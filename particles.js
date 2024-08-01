

class Particle{
  constructor(x, y, life){
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


    this.active = true;
  }

  normalize(vec){
    var mag = Math.sqrt(vec.x*vec.x + vec.y*vec.y);
    if(mag == 0) return {x: 0, y: 0};
    return {x: vec.x/mag, y: vec.y/mag};
  }

  drawRequest(ctx, parameter){
    this.draw();
  }

  draw(){
  }

  baseStep(dt){
    this.life -= dt;

    var radVec = this.normalize({x: this.x - this.origin.x, y: this.y - this.origin.y});
    var tanVec = {x: -radVec.y, y: radVec.x};

    this.spd.x += (this.acc.x + radVec.x*this.radAcc + tanVec.x*this.tanAcc)*dt;
    this.spd.y += (this.acc.y + radVec.y*this.radAcc + tanVec.y*this.tanAcc)*dt;

    this.spd.x *= Math.pow(1 - this.damp.x, dt);
    this.spd.y *= Math.pow(1 - this.damp.y, dt);

    this.x += this.spd.x*dt;
    this.y += this.spd.y*dt;

    this.angle += this.angleSpd*dt;
  }

  update(dt){

    if(this.life > 0){
      this.baseStep(dt);
    } else {
      this.active = false;
    }
  }
}


class ParticleCircle extends Particle{
  constructor(x, y, life){
    super(x, y, life);
    
    this.color    = new Color(0,0,0);
    this.colorSpd = new Color(0,0,0,0);

    this.radius = 1;
    this.radiusSpd = 0;
  }

  ballStep(dt){
    this.color.r += this.colorSpd.r*dt;
    this.color.g += this.colorSpd.g*dt;
    this.color.b += this.colorSpd.b*dt;
    this.color.a += this.colorSpd.a*dt;

    this.radius += this.radiusSpd*dt;
    this.radius = Math.max(0, this.radius);
  }

  update(dt){

    if(this.life > 0){
      this.baseStep(dt);
      this.ballStep(dt);
    } else {
      this.active = false;
    }
  }

  draw(){
    ctx.fillStyle = this.color.toCSS();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
}

class ParticleSprite extends Particle{
  constructor(x, y, life, sprite){
    super(x, y, life);
    
    this.scl = 1;
    this.sclSpd = 0;

    this.sprite = sprite;
    this.xOffset = 0;
    this.yOffset = 0;
    this.img = 0;
    this.imgSpd = 0;
  }

  spriteStep(dt){
    this.img += this.imgSpd*dt;
    this.scl += this.sclSpd*dt;
  }

  update(dt){
    if(this.life > 0){
      this.baseStep(dt);
      this.spriteStep(dt);
    } else {
      this.active = false;
    }
  }

  draw(){
    this.sprite.drawExt(this.x, this.y, Math.floor(this.img)%this.sprite.imgNum , this.scl, this.scl, this.angle, this.xOffset, this.yOffset);
  }
}

class ParticleAnim extends Particle{
  constructor(x, y, life, animation){
    super(x, y, life);
    this.animation = animation;
    this.scl = 1;
    this.sclSpd = 0;
  }

  animationStep(dt){
    this.animation.update(dt);
    this.scl += this.sclSpd*dt;
  }

  update(dt){
    if(this.life > 0){
      this.baseStep(dt);
      this.animationStep(dt);
    } else {
      this.active = false;
    }
  }

  draw(){
    this.animation.draw(this.x, this.y, this.scl, this.scl, this.angle);
  }
}



function particleBlackHole(x, y){
  var life = 50;


  var part = new ParticleCircle(x, y, life);
  var dir = randRange(0, Math.PI*2);
  var rad = 100;
  part.x = x + rad*Math.cos(dir);
  part.y = y + rad*Math.sin(dir);

  part.radius = randInt(5, 10);
  part.color = Color.fromHSL(0, 0, randInt(0, 100));
  part.colorSpd = new Color(0,0,0, -1/life);
  part.radiusSpd = -part.radius/life;

  part.tanAcc = 0.03;
  part.radAcc = -0.1;

  var dir = randRange(0, deg2rad(360));
  var dirVec = new Vector(Math.cos(dir), Math.sin(dir));
  var spd = randRange(0.25, 2);

  part.spd = dirVec.mult(spd);
  part.acc = new Vector(0, 0);
  part.damp = new Vector(0.01, 0.01);
  part.depth = -10;

  return part;
}

function particleSun(x, y){
  var life = 100;
  var part = new ParticleCircle(x, y, life);
  part.radius = randInt(2, 5);
  part.color = new Color(randInt(200, 255), randInt(200, 255), 0, 1);
  part.colorSpd = new Color(0,0,0, -1/life);
  part.radiusSpd = -part.radius/life;
  return part;
}

function particleConfetti(x, y){
  var life = 200;
  var part = new ParticleCircle(x, y, life);
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
  var part = new ParticleCircle(x, y, life);
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

function particleGhostLos(x, y, name){
  var life = 1000;
  var wid = manager.losWid*Math.SQRT1_2;
  var hei = manager.losHei*Math.SQRT1_2;
  var part = new ParticleAnim(x, y, life, new AnimationObjectGhostLos(name, wid, hei));
  part.scl = 1;
  part.spd.y = -2;

  part.depth = -20;

  return part;
}

function particleSmack(x, y){
  var life = 20;
  var part = new ParticleSprite(x, y, life, sprites[SPR.SMACKEFFECT]);
  
  part.scl = 4;
  part.xOffset = part.sprite.width/2;
  part.yOffset = part.sprite.height/2;
  part.img = randInt(0, part.sprite.imgNum);
  part.imgSpd = (part.sprite.imgNum)/life;

  part.depth = -20;

  return part;
}

function particleMusicNote(x, y, type){
  var life = 40;
  var part = new ParticleSprite(x, y, life, sprites[SPR.MUSICNOTES]);
  
  part.scl = 4;
  part.xOffset = part.sprite.width/2;
  part.yOffset = part.sprite.height/2;
  part.img = type;
  part.imgSpd = 0;
  part.spd.y = -5;
  part.damp.y = 0.05; 
  part.angle = randRange(-Math.PI/10, Math.PI/10);
  part.depth = -20;

  return part;
}


function particleLogo(x, y){
  var life = 100;
  var part = new ParticleSprite(x, y, life, sprites[SPR.MIDMEDLOGO]);
  part.scl = 4*manager.losWid/part.sprite.width;
  part.xOffset = 0;
  part.yOffset = 0;
  part.img = randInt(0, part.sprite.imgNum);
  part.imgSpd = (part.sprite.imgNum)/life;
  part.acc = new Vector(0, 0.2);
  part.spd = new Vector(1, -1);

  part.depth = 20;

  return part;
}


function particleClick(x, y){
  var life = 5;
  var part = new ParticleAnim(x, y, life, new AnimationObjectClick());
  part.scl = 1;
  part.animation.stepSpd = 1/life;

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

function createParticlesInRect(partCreateFunc, num, x, y, wid, hei){
  var places = placesInRect(num,x,y,wid,hei);
  return createParticleWithPlaces(partCreateFunc, places);
}
