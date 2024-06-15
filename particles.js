

function Particle(x, y, life){
  this.x = x;
  this.y = y;

  this.origin = {x: this.x, y: this.y};

  this.lifeMax = this.life = life;

  this.angle = 0;
  this.angleSpd = 0;

  this.spd = {x: 0, y: 0};
  this.acc = {x: 0, y: 0};

  this.radAcc = 0;
  this.tanAcc = 0;

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

  this.draw = function(){
    ctx.fillStyle = this.color.toCSS();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }

  this.update = function(dt){

    if(this.life > 0){

      this.life -= dt;

      var radVec = this.normalize({x: this.x - this.origin.x, y: this.y - this.origin.y});
      var tanVec = {x: -radVec.y, y: radVec.x};

      this.spd.x += (this.acc.x + radVec.x*this.radAcc + tanVec.x*this.tanAcc)*dt;
      this.spd.y += (this.acc.y + radVec.y*this.radAcc + tanVec.y*this.tanAcc)*dt;

      this.x += this.spd.x*dt;
      this.y += this.spd.y*dt;

      this.color.r += this.colorSpd.r*dt;
      this.color.g += this.colorSpd.g*dt;
      this.color.b += this.colorSpd.b*dt;
      this.color.a += this.colorSpd.a*dt;

      this.radius += this.radiusSpd*dt;

      this.angle += this.angleSpd*dt;

    } else {
      this.active = false;
    }
  }
}
