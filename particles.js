

function Particle(x, y, life){
  this.x = x;
  this.y = y;
  this.depth = 0;

  this.origin = new Vector(this.x, this.y);

  this.lifeMax = this.life = life;

  this.angle = 0;
  this.angleSpd = 0;

  this.spd = new Vector(0, 0);
  this.acc = new Vector(0, 0);

  this.radAcc = 0;
  this.tanAcc = 0;

  this.damp = new Vector(0, 0);

  this.color    = new Color(0,0,0);
  this.colorSpd = new Color(0,0,0,0);

  this.radius = 1;
  this.radiusSpd = 0;

  this.active = true;

  this.normalize = function(vec){
    var mag = Math.sqrt(vec.x*vec.x + vec.y*vec.y);
    if(mag == 0) return {x: 0, y: 0};
    return {x: vec.x/mag, y: vec.y/mag};
  }

  this.show = function(){
    this.draw();
  }

  this.draw = function(){
    ctx.fillStyle = this.color.toCSS();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  this.update = function(dt = 1){

    if(this.life > 0){

      this.life -= dt;

      var radVec = this.normalize({x: this.x - this.origin.x, y: this.y - this.origin.y});
      var tanVec = {x: -radVec.y, y: radVec.x};

      this.spd.x += (this.acc.x + radVec.x*this.radAcc + tanVec.x*this.tanAcc)*dt;
      this.spd.y += (this.acc.y + radVec.y*this.radAcc + tanVec.y*this.tanAcc)*dt;

      this.spd.x *= Math.pow(1 - this.damp.x, dt);
      this.spd.y *= Math.pow(1 - this.damp.y, dt);

      this.x += this.spd.x*dt;
      this.y += this.spd.y*dt;

      this.color.r += this.colorSpd.r*dt;
      this.color.g += this.colorSpd.g*dt;
      this.color.b += this.colorSpd.b*dt;
      this.color.a += this.colorSpd.a*dt;

      this.radius += this.radiusSpd*dt;
      this.radius = Math.max(0, this.radius);

      this.angle += this.angleSpd*dt;

    } else {
      this.active = false;
    }
  }
}



function particleSun(x, y){
  var life = 100;
  var part = new Particle(x, y, life);
  part.radius = randInt(2, 5);
  part.color = new Color(randInt(200, 255), randInt(200, 255), 0, 1);
  part.colorSpd = new Color(0,0,0, -1/life);
  part.radiusSpd = -part.radius/life;
  return part;
}

function particleConfetti(x, y){
  var life = 200;
  var part = new Particle(x, y, life);
  part.radius = randInt(5, 10);
  part.color = Color.fromHSL(randRange(0, 360), 100, 50);
  part.colorSpd = new Color(0,0,0, -1/life);
  part.radiusSpd = -part.radius/life;

  var dir = randRange(0, deg2rad(360));
  var dirVec = new Vector(Math.cos(dir), Math.sin(dir));
  var spd = randRange(1, 5);

  part.spd = dirVec.mult(spd);
  part.acc = new Vector(0, 0);
  part.damp = new Vector(0.01, 0.01);
  part.depth = -10;

  return part;
}

function particleLock(x, y){
  var life = 50 + randInt(0, 25);
  var part = new Particle(x, y, life);
  part.radius = randInt(15, 25);
  part.color = Color.fromHSL(100, 0, 50);
  part.colorSpd = new Color(0,0,0, -1/life);
  part.radiusSpd = -part.radius/life;

  var dir = randRange(0, deg2rad(360));
  var dirVec = new Vector(Math.cos(dir), Math.sin(dir));
  var spd = randRange(1, 2);

  part.spd = dirVec.mult(spd);
  part.acc = new Vector(0, 0);
  part.damp = new Vector(0.01, 0.01);
  part.depth = -20;

  return part;
}

function placesInRect(num, x, y, wid, hei){
  var list = [];
  for(var i = 0; i < num; i++){
    list.push(new Vector(x + randRange(0, wid), y + randRange(0, hei)));
  }
  return list;
}

function createParticleWithPlaces(partCreateFunc, places){
  var partList = [];
  for(var i = 0; i < places.length; i++){
    partList.push(partCreateFunc(places[i].x, places[i].y));
  }

  return partList;
}
