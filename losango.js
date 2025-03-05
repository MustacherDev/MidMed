


const LSTATE = Object.freeze(new Enum(
    "MINESWEEPER",
    "SHOPMODE",
    "BLACKHOLE",
    "HEADPHONES",
    "NAME",
    "ANIMEHAT",
    "IMAGE",
    "GRIDIND",
    "TOTAL"
));

const LEVENT = Object.freeze(new Enum(
  "TILT",
  "ALTNAME",
  "STARTMINESWEEPER",
  "ENDMINESWEEPER",
  "SCREENMODE",
  "IMAGESHOW",
  "STARTTEST",
  "TOTAL"
));

class EventCreate{
  
  static tilt(state){
    return new EventObject(LEVENT.TILT, [state]);
  }

  static altname(state){
    return new EventObject(LEVENT.ALTNAME, [state]);
  }

  static startMinesweeper(){
    return new EventObject(LEVENT.STARTMINESWEEPER, []);
  }

  static endMinesweeper(){
    return new EventObject(LEVENT.ENDMINESWEEPER, []);
  }

  static screenMode(state = true){
    return new EventObject(LEVENT.SCREENMODE, [state]);
  }

  static imageShow(imageId){
    return new EventObject(LEVENT.IMAGESHOW, [imageId]);
  }

  static startTest(startTime){
    return new EventObject(LEVENT.STARTTEST, [startTime]);
  }

}

class SneezeActor{
  constructor(){
    this.sneezing = false;
    this.sneezeTries = 0;
    this.sneezePauseTime = 0;
    this.sneezeWait = 0;
    this.sneezeTimer = 0;
  }

  update(dt, los){

    if(this.sneezing){
      if(this.sneezeWait > 0){
        this.sneezeWait -= dt;

        this.sneezeTimer -= dt;

        if(this.sneezeWait <= 0){
          this.sneezeTries++;
          this.sneezePauseTime = this.sneezeTimer + randInt(20, 40)*this.sneezeTries;
        }
      } else {
        this.sneezeTimer+=2*dt;

        if(this.sneezeTimer > this.sneezePauseTime){
          this.sneezeWait = randInt(20, 40);
        }

        if(this.sneezeTimer > 175){
          playSound(SND.SNEEZE);
          manager.explosionImpulse(los.x, los.y, 100);
          this.sneezing = false;
          this.sneezeTries = 0;
          this.sneezePauseTime = 0;
          this.sneezeWait = 0;
        }
      }
    } else {
      if(this.sneezeTimer > 0){
        this.sneezeTimer *= Math.pow(0.9, dt);
      }
    }


    var sneezePerc = (this.sneezeTimer/200);
    los.xSclMult *= 1 + sneezePerc*0.4;
    los.ySclMult *= 1 + sneezePerc*0.4;
    los.depth += sneezePerc*(-10);

  }
}

class FlipActor{
  constructor(){
    this.flipping = false;
    this.phase = 0;
    this.targetPhase = 0;
    this.normalSpd = 0.1;
    this.spd = this.normalSpd;
    this.isFront = true;
    this.isHFlip = true;

    this.freeMoveSpd = 0;
    this.freeMoveSpdMax = 10;
    this.freeMoveDamp = 0.02;

    this.lastFront = false;

    this.flipped = false;
  }

  startFlip(flipAmount = 2, flipSnap = true,  flipSpd = this.normalSpd){
    this.spd = flipSpd;
    this.flipping = true;

    if(flipSnap){
      this.targetPhase = (this.phase - (this.phase%(Math.PI))) + flipAmount * Math.PI;
    } else{
      this.targetPhase = this.phase + flipAmount * Math.PI;
    }

    this.freeMoveSpd = 0;
  }

  update(dt, los){

    this.flipped = false;


    this.isFront = phaseAngleToSide(this.phase);

    // FLIPPING
    if(this.flipping){
      this.phase += this.spd*dt;

      this.isFront = phaseAngleToSide(this.phase);
      if(this.isFront != this.lastFront){
        this.flipped = true;
      // We should update the object properties as soon as it changes front-back
      // if(this.flipPhase >= this.flipTargetPhase - Math.PI/2){
      }

      // Flipping stops when it reaches target Phase
      if(this.phase >= this.targetPhase){
        this.flipping = false;
        this.isFront = phaseAngleToSide(this.phase);
        //this.phase = Math.PI * (1 - this.isFront);
        this.phase = this.targetPhase%(Math.PI*2);
      }
    } else {
      this.freeMoveSpd *= Math.pow(1-this.freeMoveDamp,dt);
      this.freeMoveSpd = clamp(this.freeMoveSpd, -this.freeMoveSpdMax, this.freeMoveSpdMax);
      this.phase += this.freeMoveSpd*dt;
    }

    this.lastFront = this.isFront;
  }
}

class TiltActor{
  constructor(){
    this.tilting = false;
    this.spd = 0.025;
    this.isTilted = true;
    this.tiltTarget = 0;
    
    this.angle = 0;

    this.freeMoveSpd = 0;
    this.freeMoveSpdMax = 1;
    this.freeMoveDamp = 0.02;
  }

  startTilt(){
    this.tilting = true;
    this.tiltTarget = (this.angle - (this.angle % deg2rad(90))) + (this.isTilted?0:1)*deg2rad(45);
    this.freeMoveSpd = 0;
  }

  update(dt, los){
     // Rotating/ Tilting

     if(this.tilting){
      if(this.isTilted){
        los.angle -= this.spd*dt;
        if(los.angle <= this.tiltTarget){
          this.isTilted = false;
          this.tilting = false;
          los.angle = 0;
        }
      } else {
        los.angle += this.spd*dt;
        if(los.angle >= this.tiltTarget){
          this.isTilted = true;
          this.tilting = false;
          los.angle = deg2rad(45);
        }
      }
    } else {
      this.freeMoveSpd *= Math.pow(1-this.freeMoveDamp,dt);
      this.freeMoveSpd = clamp(this.freeMoveSpd, -this.freeMoveSpdMax, this.freeMoveSpdMax);
      los.angle += this.freeMoveSpd*dt;
    }

    this.angle = los.angle;
  }
}


class WobbleActor{
  constructor(){
    this.wobbling = false;
    this.spd = 0.025;
    this.phase = 0;
    this.amp = deg2rad(20);
    this.angle = 0;

    this.angDamp = 0.02;
  }

  startWobble(spd = 0.025, phase = 0){
    this.wobbling = true;
    this.spd = spd;
    this.phase = phase;
  }

  stopWobble(){
    this.wobbling = false;
  }

  update(dt, los){
     // Rotating/ Tilting
     if(this.wobbling){
        this.phase += this.spd*dt;
        this.angle = Math.sin(this.phase)*this.amp;
    } else {
      this.angle *= Math.pow(1-this.angDamp,dt);
    }
  }
}

class ColorActor{
  constructor(color){
    this.baseColor = new Color(0,0,0,0);
    this.baseColor.setWithColor(color);
    this.color = new Color(0,0,0,0);
    this.color.setWithColor(color);

    this.phasing = false;
    this.phaseStartColor = new Color(0,0,0,0);
    this.phaseEndColor = new Color(0,0,0,0);
    this.phaseDiffColor = new Color(0,0,0,0);
    this.phaseTimer = new Alarm(0, 100, true);
  }

  reset(){
    this.color.setWithColor(this.baseColor);
  }

  setColor(color){
    this.color.setWithColor(color);
  }

  setRGB(r, g, b, a = 1){
    this.color.r = r;
    this.color.g = g;
    this.color.b = b;
    this.color.a = a;
  }

  startPhase(startColor, endColor, time){
    this.phasing = true;
    this.phaseStartColor = startColor.copy();
    this.phaseEndColor = endColor.copy();
    this.phaseDiffColor = this.phaseEndColor.diff(this.phaseStartColor);
    this.phaseTimer.timeInit = time;
    this.phaseTimer.start();
  }

  update(dt, los){
    if(this.phasing){
      this.phaseTimer.update(dt);
      var progress = this.phaseTimer.percentage();
      var progressColor = this.phaseDiffColor.mult(progress).add(this.phaseStartColor);
      this.setColor(progressColor);

      if(this.phaseTimer.finished){
        this.setColor(this.phaseEndColor);
        this.phaseTimer.stop();
        this.phasing = false;
      }
    }
  }
}

class OrbitActor{
  constructor(){
    this.orbiting = false;
    this.orbitingObj = null;
    this.timer = new Alarm(0, 400);
    this.center = new Vector(0,0);
    this.phase = 0;
    this.spd = 0;
    this.radius = 0;
    
    this.orbitPos = new Vector(0, 0);
  }

  startOrbit(phase, spd, radius, duration, obj){
    this.orbiting = true;
    this.phase = phase;
    this.spd = spd;
    this.radius = radius;
    this.center = new Vector(0, 0);

    this.timer.timeInit = duration;
    this.timer.stop();
    this.timer.start();

    
    this.orbitPos.x = 0;
    this.orbitPos.y = 0;

    // MEIO REDUNDANTE EU ACHO
    if(obj){
      this.orbitingObj = obj;
    } else {
      this.orbitingObj = null;
    }
  }

  update(dt, los){
    this.timer.update(dt);
    if(this.orbiting){

      var prog = this.timer.percentage();
      var prog2 = tweenIn(Math.abs(prog-0.5)*2);
      var prog3 = tweenIn(Math.max(prog-0.8, 0)*5);

      var extraRad = 20*this.radius* prog3;

      var rad = prog2*this.radius*0.5 + this.radius*0.75 + extraRad;



      var spd = this.spd + 3*this.spd* Math.pow(tweenIn(prog), 2);

      this.phase += spd*dt;

      if(this.orbitingObj){
        this.center.x = this.orbitingObj.x;
        this.center.y = this.orbitingObj.y;
      }

    



      this.orbitPos.x = this.center.x + rad*Math.cos(this.phase);
      this.orbitPos.y = this.center.y + rad*Math.sin(this.phase);

      if(this.timer.finished){
        this.orbiting = false;
      }
    }
  }
}

class StateFlow{
  constructor(state, stateTime){
    this.state = state;
    this.stateTimer = 0;
    this.stateTime = stateTime;
    this.progress = 0;
  }

  setState(state){
    this.state = state;
    this.progress = 0;
  }

  update(dt){


    switch(this.state){
      case 0:
        this.progress = 0;
        break;
      case 1:
        this.stateTimer += dt;
        if(this.stateTimer < this.stateTime){
          this.progress = this.stateTimer/this.stateTime;
        } else {
          this.state = 2;
          this.progress = 1;
        }
        break;
      case 2:
        this.progress = 1;
        break;
      case 3:
        this.stateTimer -= dt;
        if(this.stateTimer > 0){
          this.progress = this.stateTimer/this.stateTime;
        } else {
          this.state = 0;
          this.progress = 0;
        }
        break;
    }


  }

  trigger(){
    if(this.state == 0){
      this.state = 1;
    } else if (this.state == 3){
      this.state = 1;
      this.stateTimer = this.stateTime - this.stateTimer;
    }
  }

  hide(){
    if(this.state == 2){
      this.state = 3;
    } else if (this.state == 1){
      this.state = 3;
      this.stateTimer = this.stateTime - this.stateTimer;
    }
  }
}


class TestPaper{
  constructor(){
    this.x = 0;
    this.y = 0;
    this.depth = -20;
    this.angle = 0;

    this.xScl = 0.3;
    this.yScl = 0.3;

    this.xSclMult = 1;
    this.ySclMult = 1;

    this.hspd = 0;
    this.vspd = 0;

    this.flipActor = new FlipActor();

    this.targetPos = new Vector(0,0);

    this.inPlace = false;

    this.shaking = false;

    this.shakeX = 0;
    this.shakeY = 0;

    this.active = false;
  }

  reset(){
    this.active = true;
    this.shaking = false;
    this.flipActor = new FlipActor();
    this.hspd = 0;
    this.vspd = 0;
    this.inPlace = false;
  }

  update(dt){
    this.flipActor.update(dt);

    this.xSclMult = 1;
    this.ySclMult = 1;
    this.xSclMult *= Math.cos(this.flipActor.phase);
    //this.ySclMult *= Math.sin(this.flipActor.phase);

    if(Math.abs(this.targetPos.x - this.x) + Math.abs(this.targetPos.y - this.y) < 5){
      //if(this.attachCooldownAlarm.finished){
        if(!this.inPlace){
          this.hspd = 0;
          this.vspd = 0;

          var pos = new Vector(this.x, this.y);
          var dist = this.targetPos.sub(pos).mag();
          var dir = this.targetPos.sub(pos).unit();
          if(dist < 1){
            this.x = this.targetPos.x;
            this.y = this.targetPos.y;
            this.inPlace = true;

            //this.lockParticles();


          } else {
            this.x += dir.x/10;
            this.y += dir.y/10;
          }
        }
      //}
    } else {

      if(this.y > this.targetPos.y){
        var pos = new Vector(this.x, this.y);
        var dist = this.targetPos.sub(pos).mag();
        var dir = this.targetPos.sub(pos).unit();

        var spd = Math.max((dist*dist)/100000, 0.1);

        this.vspd += 0.1*dt;

        this.hspd += dir.x*spd*dt;
        this.vspd += dir.y*spd*dt;
      } else {
        this.vspd += 0.2*dt;
      }
    }

    this.hspd = clamp(this.hspd, -20, 20);
    this.vspd = clamp(this.vspd, -20, 20);

    this.hspd *= Math.pow(0.98, dt);
    this.vspd *= Math.pow(0.98, dt);

    this.x += this.hspd*dt;
    this.y += this.vspd*dt;

    if(this.flipActor.flipped){
      this.shaking = true;
    }

    if(this.shaking){
      this.shakeX = randRange(-2, 2);
      this.shakeY = randRange(-2, 2);
    }
  }

  draw(ctx){

    var xSclAnim = this.xScl*this.xSclMult;
    var ySclAnim = this.yScl*this.ySclMult;
    var angAnim = this.angle;

    sprites[SPR.TESTPAPER].drawExtRelative(this.x+this.shakeX, this.y + this.shakeY, this.flipActor.isFront ? 1:0, xSclAnim, ySclAnim, angAnim, 0.5,0.5);
  }

  pushDrawList() {
    if(!this.active) return;
    addList(new DrawRequest(this, this.depth, 0), OBJECT.DRAW);
  }

  drawRequest(ctx, parameter) {
    this.draw(ctx);
  }

}
 

class Losango {
  constructor(x, y, id){
    this.x = x;
    this.y = y;
    this.depth = 0;
    this.angle = deg2rad(45);
    this.id = id;

    this.type = OBJECT.LOSANGO;

    this.xScl = 1;
    this.yScl = 1;

    this.xSclMult = 1;
    this.ySclMult = 1;

    this.hspd = 0;
    this.vspd = 0;

    this.depthspd = 0;

    this.width = manager.losWid*Math.SQRT1_2;
    this.height = manager.losHei*Math.SQRT1_2;

    this.boxWid = (this.width + manager.losWid)/4;
    this.boxHei = (this.height + manager.losHei)/4;

    this.body = null;
    this.physical = true;


    this.holder = new Holder();
    this.canBeHeld = true;

    this.pressState = [false, false, false];

    this.boundingBox = new BoundingBox(this.x - this.boxWid/2, this.y - this.boxHei/2, this.boxWid, this.boxHei);
    
    
    this.clickingBox = new BoundingBox(this.x, this.y, this.width, this.height);
    this.clickingBox.xOffset = this.boxWid/2;
    this.clickingBox.yOffset = this.boxHei/2;





    this.scaling = false;
    this.isFullScale = false;
    this.fullScale = manager.losWid/this.width;
    this.scalingSpd = 0.01;
    this.extraScale = 1;

    this.sneezeActor = new SneezeActor();
    this.flipActor = new FlipActor();
    this.tiltActor = new TiltActor();
    this.wobbleActor = new WobbleActor();
    this.orbitActor = new OrbitActor();

    this.testPaper = new TestPaper();
    this.testStartCooldown = new Alarm(0, 1000, true);
    this.testFinishCooldown = new Alarm(0, 1000, true);
    this.doingTest = false;

    this.shrinked = false;
    this.shrinkAlarm = new Alarm(0, 100);
    this.growthAlarm = new Alarm(0, 100);
    this.shrinkAlarm.pause();
    this.growthAlarm.pause();

    this.popInAlarm = new Alarm(0, 25);
    this.popInAlarm.pause();
    this.popOutAlarm = new Alarm(0, 200);
    this.popOutAlarm.pause();

    this.hideLineAlarm = new Alarm(0, 25);
    this.hideLineAlarm.pause();
    this.lineStateFlow = new StateFlow(1, 50);

    this.enlargeStateFlow = new StateFlow(0, 75);



    this.colorInOutAlarm = new Alarm(0, 150);
    this.colorInOut = new Color(255, 255, 255);


    this.frontColor = new Color(255,255,255);
    this.backColor = new Color(200, 200, 200);

    this.policeColorSwitchAlarm = new Alarm(0, 10);
    this.policeColorDurationAlarm = new Alarm(130, 130);
    this.policeColorId = 0;

    this.frontColorActor = new ColorActor(this.frontColor);
    this.backColorActor = new ColorActor(this.backColor);



    this.linePerc = 0.1;

    this.imageShow = -1;
    this.resolvingImage = false;

    this.hovered = false;

    this.useAltName = false;
    this.minesweeper = false;
    this.anniversary = false;
    this.preAnniversary = false;
    this.screenMode = false;

    this.connector = false;
    this.connectorPos = new Vector(0,0);
    this.connectorAng = 0;
    this.usbSlot = new USBSlot(this,0,0,0);

    this.codenamesMode = false;

    this.headphones = false;
    this.animeHat = 0;

    this.blackHolePartAlarm = new Alarm(0, 1);
    this.blackHoleMode = false;
    this.blackHole = new BlackHole(0, 0, 2);


    this.shopMode = false;
    this.priceTag = 0;

    this.inOtherplane = false;

    this.backItem = null;




    this.effector = new Effector();


    this.updatePacket = null;
    this.updateList = [];
    this.flipsTillUpdate = 0;

    this.attached = true;
    this.attachGridId = -1;

    this.inPlace = true;

    this.attachCooldownAlarm = new Alarm(0, 300);
    this.playNoteCooldownAlarm = new Alarm(0, 5);
    this.effectCooldownAlarm = new Alarm(99, 100);

    this.mouseAlarm = new Alarm(0, 50);

    this.locked = false;
    this.open = false;

    this.active = true;


    // States
    this.states = [];

    for(var i = 0; i < LSTATE.TOTAL; i++){
      this.states.push(null);
    }

  }

  codenames(){
    this.codenamesMode = true;
    if(!this.tiltActor.tilting && this.tiltActor.isTilted){
      this.tiltActor.tilting = true;
    }

    this.frontColorActor.startPhase(this.frontColorActor.color, new Color(245, 215, 180), 200);
  }

  endCodenames(){
    this.codenamesMode = false;
    this.frontColorActor.startPhase(this.frontColorActor.color, this.frontColorActor.baseColor, 200);
    this.backColorActor.reset();
    if(this.flipActor.isFront){
      this.flip(2);
    } else {
      this.flip(1);
    }
  }

 
  popParticles(){
    var partPos = manager.getPosGrid(this.getGridId());

    for (var i = 0; i < 50; i++) {
        manager.particles.push(particleConfetti(partPos.x, partPos.y));
    }
  }

  lockParticles(){
    for(var i = 0 ; i < 4; i++){
      manager.particles.push(particleConfetti(this.x, this.y));
    }
  }

  blackHoleParticles(){
    manager.particles.push(particleBlackHole(this.x, this.y));
  }


  ghostParticles(){
    manager.particles.push(particleGhostLos(this.x, this.y, nameMan.persons[this.id].name.text));
  }

  musicNoteParticle(type){
    manager.particles.push(particleMusicNote(this.x, this.y, type));
  }

  startColorInOut(color){
    this.frontColorActor.startPhase(this.frontColor, color, 50);
    this.colorInOut = this.frontColor.copy();
    this.colorInOutAlarm.restart();
    this.colorInOutAlarm.resume();
  }

  startPoliceSiren(){
    this.policeColorDurationAlarm.restart();
    this.policeColorSwitchAlarm.restart();
    this.policeColorId = 1;
    
    var color =  new Color(255, 0, 0);
    switch (this.policeColorId){
      case 0:
        color =  new Color(0, 0, 255);
        break;
      case 1:
        color =  new Color(255, 255, 255);
        break;
      case 2:
        color =  new Color(255, 0, 0);
        break; 
      case 3:
        color =  new Color(255, 255, 255);
        break;
    } 
    this.frontColorActor.startPhase(this.frontColor,color, this.policeColorSwitchAlarm.time);
  }

  startOrbit(phase, spd, radius, duration, obj){
    this.orbitActor.startOrbit(phase, spd, radius, duration, obj);
  }

  startTest(cooldown){
    this.testPaper.reset();

    this.testPaper.x = this.x+35;
    this.testPaper.y = -400;

    this.testPaper.targetPos = new Vector(this.x+35, this.y+30);

    // this.testStartCooldown.timeInit = cooldown;
    // this.testStartCooldown.stop();
    // this.testStartCooldown.start();

    this.testFinishCooldown.timeInit = randInt(300, 800);
    if(this.id == NAME.MARLUS){
      this.testFinishCooldown.timeInit = 150;
    }

    if(this.id == NAME.FSANCHEZ){
      this.testFinishCooldown.timeInit = 950;
    }

    this.testFinishCooldown.stop();

    this.doingTest = true;
  }

  playNote(){
    if(this.playNoteCooldownAlarm.finished){
      musicMan.playNote(this.attachGridId);
      if (this.popInAlarm.paused) {
        this.popInAlarm.start();
        this.popInAlarm.timer = Math.floor(this.popInAlarm.time / 5);
      }
      this.musicNoteParticle(this.attachGridId);
      this.playNoteCooldownAlarm.restart();
    }
  }

  checkHover(){
    if(this.isInside(input.mouseX, input.mouseY) && manager.mode != 2){
      this.hovered = true;
      canvas.style.cursor = 'pointer';
    }
  }

  updateMovement(dt){
    if(this.attached){
      var targetPos = manager.getPosGrid(manager.losangosGrid[this.id]);

      this.attachCooldownAlarm.update(dt);


      if(this.orbitActor.orbiting){
      
        var ratio = 0.5;
        var orbitHspd = ((this.x*(1-ratio) + this.orbitActor.orbitPos.x*ratio) - this.x)*0.02;
        var orbitVspd = ((this.y*(1-ratio) + this.orbitActor.orbitPos.y*ratio) - this.y)*0.02;

        this.x += orbitHspd*dt;
        this.y += orbitVspd*dt; 
      } else {

        if(Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 5){

          if(this.attachCooldownAlarm.finished){
            if(!this.inPlace){
              this.hspd = 0;
              this.vspd = 0;

              var pos = new Vector(this.x, this.y);
              var dist = targetPos.sub(pos).mag();
              var dir = targetPos.sub(pos).unit();
              if(dist < 1){
                this.x = targetPos.x;
                this.y = targetPos.y;
                this.inPlace = true;

                this.lockParticles();


              } else {
                this.x += dir.x/10;
                this.y += dir.y/10;
              }
            }
          }
        } else {
          this.inPlace = false;
          var pos = new Vector(this.x, this.y);
          var dist = targetPos.sub(pos).mag();
          var dir = targetPos.sub(pos).unit();

          var spd = Math.max((dist*dist)/100000, 0.1);

          this.hspd += dir.x*spd*dt;
          this.vspd += dir.y*spd*dt;
        }
      }


      
    } else {
      if(!this.holder.holded){

        this.holder.getHold(this);

        if(this.physical){
          var posPhy = this.body.state.pos;
          this.x = posPhy.x;
          this.y = posPhy.y;

          this.angle = (this.body.state.angular.pos)%(Math.PI*2);
        }

  
      } else {
        if(this.body != null){
          this.body.state.pos.x = this.x;
          this.body.state.pos.y = this.y;
        }

      
        this.holder.update(this);
      }
    }


    if(this.holder.holded){
      this.depth -= 10;
    }

    if(this.orbitActor.orbiting){
      this.depth -= 10;
    }

    if(this.holder.throwEvent){
      if(this.body != null){
        this.body.state.pos.x = this.x;
        this.body.state.pos.y = this.y;
      }

      manager.attachObjectMouse(this, GRID.MIDDLE);
      this.holder.throwEvent = false;
    }



    this.hspd = clamp(this.hspd, -20, 20);
    this.vspd = clamp(this.vspd, -20, 20);
    this.hspd *= Math.pow(0.98, dt);
    this.vspd *= Math.pow(0.98, dt);

    this.prevX = this.x;
    this.prevY = this.y;

    this.x += this.hspd*dt;
    this.y += this.vspd*dt;

    this.updateBox();
  }


  update(dt){

    if(this.inOtherplane) return;

    this.hovered = false;
 

    // VARIABLES THAT GET CHANGED ONLY DURING THIS UPDATE
    // MODIFIERS OF EXISTING VARS 
    this.xSclMult = 1;
    this.ySclMult = 1;
    this.depth = 0;


    this.checkHover();
    this.updateMovement(dt);

    if(this.connector){
      objectLists[OBJECT.DRAW].push(new DrawRequest(this, this.depth-11, 1));
    }

    if(this.pressState[0]){
      if(!input.mouseState[0][0]){
        this.pressState[0] = false;
      }
    }
    this.pressState[1] = false;
    this.pressState[2] = false;

    // CLICKING
    if(this.hovered){

      this.pressState[0] = input.mouseState[0][0];
      this.pressState[1] = input.mouseState[0][1];
      this.pressState[2] = input.mouseState[0][2];

      if(input.mouseState[0][1] || input.mouseState[2][1]){
        this.pressed = true;


        var isRightClick = false;
        if(input.mouseState[2][1]){
          isRightClick = true;
        }

        if(this.attached){
          if(!this.flipActor.flipping){
            if(this.effectCooldownAlarm.finished){
              this.effector.effect(this, isRightClick);
            }
          }
        }
      }
    }

    // MINESWEEPER COMMITMENT
    if(this.minesweeper){
      var gridIndex = manager.losangosGrid[this.id];
      var gridOpen = manager.minesweeper.gridOpen[gridIndex];
      var gridValue = manager.minesweeper.grid[gridIndex];

      if(!this.flipActor.flipping){
        if(gridOpen && this.flipActor.isFront){
          this.flip(1);
        } else if (gridValue != this.states[LSTATE.MINESWEEPER] && !this.flipActor.isFront && this.attached){
          this.flip(1);
        }
      }
    }

    if(this.codenamesMode){
      
      var codeId = manager.codenamesManager.nameMap[this.id];
      if(codeId != -1){

        if(manager.codenamesManager.grid[codeId].opened){
          var team  = manager.codenamesManager.grid[codeId].team;
          this.backColorActor.setColor(manager.codenamesManager.colors[team]);
        }
      }
    }

    if(this.wobbleActor.wobbling){

      if(manager.holding){
        if(manager.holdingObject.type != OBJECT.BITCOIN){
          this.wobbleActor.stopWobble();
          this.lineStateFlow.trigger();
        }
      } else {
        this.wobbleActor.stopWobble();
        this.lineStateFlow.trigger();
      }
    } else {

      if(this.id == NAME.LAIS){

        if(manager.holding){

          if(manager.holdingObject.type == OBJECT.BITCOIN){
            this.wobbleActor.startWobble(0.075, 0);
            this.lineStateFlow.hide();
          }
        }
      }
    }

    // BLACK HOLE PARTICLES
    if(this.blackHoleMode && !this.flipActor.isFront && !this.minesweeper){
      this.blackHolePartAlarm.update(dt);
      if(this.blackHolePartAlarm.finished){
        this.blackHoleParticles();
        this.blackHolePartAlarm.restart();
      }

      this.blackHole.update(dt);

      for(var i = 0; i < objectLists[OBJECT.BITCOIN].length; i++){
        var coin = objectLists[OBJECT.BITCOIN][i];

        var vec = new Vector(this.x-coin.x, this.y-coin.y);
        var dist = vec.mag();
        if(dist < 1000){
          var distClamp = clamp(dist, 0.001, 1000);
          var force = 0.05/(distClamp/1000);
          if(dist < 10){
            force = -force;
          }
          vec = vec.unit().mult(force);

          coin.hspd += vec.x;
          coin.vspd += vec.y;
        } 
      }
    }

    // NOTE PLAY COOLDOWN
    this.playNoteCooldownAlarm.update(dt);

    // EFFECT COOLDOWN
    this.effectCooldownAlarm.update(dt);

    // SNEEZING
    this.sneezeActor.update(dt, this);

    // WOBBLING
    this.wobbleActor.update(dt, this);

    // ORBITING
    this.orbitActor.update(dt, this);

    // TEST PAPER
    if(this.doingTest){
      this.testPaper.update(dt);
      this.testPaper.pushDrawList();
      //this.testStartCooldown.update(dt);
      this.testFinishCooldown.update(dt);

      // if(this.testStartCooldown.finished){
      //   this.testStartCooldown.stop();
      //   this.testPaper.flipActor.startFlip(1);
      //   this.testFinishCooldown.start();
      //   if(this.id == NAME.MARLUS){
      //     playSound(SND.WHISTLE);
      //   }
      // }

      if(this.testFinishCooldown.finished){
        this.testPaper.active = false;
        manager.addParticles(createParticlesInRect(particleSun, 5, this.x - manager.losWid / 2, this.y - manager.losHei / 2, manager.losWid, manager.losHei));
        this.testFinishCooldown.stop();
        this.doingTest = false;
        playSound(SND.POP);
      }
    }

    // POLICE COLOR
    this.policeColorDurationAlarm.update(dt);
    if(!this.policeColorDurationAlarm.finished){
      this.policeColorSwitchAlarm.update(dt);
      if(this.policeColorSwitchAlarm.finished){
        this.policeColorSwitchAlarm.restart();
        this.policeColorId = (this.policeColorId+1) % 4;

        var color =  new Color(255, 0, 0);
        switch (this.policeColorId){
          case 0:
            color =  new Color(0, 0, 255);
            break;
          case 1:
            color =  new Color(255, 255, 255);
            break;
          case 2:
            color =  new Color(255, 0, 0);
            break; 
          case 3:
            color =  new Color(255, 255, 255);
            break;
        } 
        this.frontColorActor.startPhase(this.frontColor,color, this.policeColorSwitchAlarm.time);
      }
    }

    // COLOR INOUT
    this.colorInOutAlarm.update(dt);
    if(this.colorInOutAlarm.finished){
      this.frontColorActor.startPhase(this.frontColor, this.colorInOut, 50);
      this.colorInOutAlarm.stop();
    }


    // COLOR CHANGING
    this.frontColorActor.update(dt, this);
    this.backColorActor.update(dt, this);
    this.frontColor.setWithColor(this.frontColorActor.color);
    this.backColor.setWithColor(this.backColorActor.color);

    // OUTLINE STATE
    this.lineStateFlow.update(dt);

    // ENLARGING STATE
    this.enlargeStateFlow.update(dt);

    // POPPING
    this.popInAlarm.update(dt);
    this.popOutAlarm.update(dt);

    if(this.popInAlarm.finished){
      this.popInAlarm.stop();
      this.popOutAlarm.start();
    }

    if(this.popOutAlarm.finished){
      this.popOutAlarm.stop();
    }

    var poppingPerc = 0;
    if(!this.popInAlarm.paused){
      poppingPerc = tweenOut(this.popInAlarm.percentage());
    } else if (!this.popOutAlarm.paused){
      poppingPerc = 1 - tweenOut(this.popOutAlarm.percentage());
    }

    this.xSclMult *= 1 + poppingPerc*0.4;
    this.ySclMult *= 1 + poppingPerc*0.4;
    this.depth += poppingPerc*(-10);



    // SHOP COMMITMENT
    if(this.shopMode){
      if(!this.flipActor.flipping && this.flipActor.isFront){
        this.shopMode = false;
      }
    }


    


    // Full Scaling
    if(this.scaling){
      if(this.isFullScale){
        this.extraScale -= this.scalingSpd*dt;
        if(this.extraScale <= 1){
          this.isFullScale = false;
          this.scaling = false;
          this.extraScale = 1;
        }
      } else {
        this.extraScale += this.scalingSpd*dt;
        if(this.extraScale >= this.fullScale){
          this.isFullScale = true;
          this.scaling = false;
          this.extraScale = this.fullScale;
        }
      }
    }

    this.xSclMult *= this.extraScale;
    this.ySclMult *= this.extraScale;


    // Shrinking
    this.shrinkAlarm.update(dt);
    this.growthAlarm.update(dt);
    if(this.shrinked){
      this.xSclMult *= this.growthAlarm.percentage();
      this.ySclMult *= this.growthAlarm.percentage();
      if(this.growthAlarm.finished){
        this.shrinked = false;
        this.growthAlarm.stop();
      }
    } else {
      this.xSclMult *= 1- this.shrinkAlarm.percentage();
      this.ySclMult *= 1- this.shrinkAlarm.percentage();
      if(this.shrinkAlarm.finished){
        this.shrinked = true;
        this.shrinkAlarm.stop();
      }
    }

    // ENLARGEMENT
    this.xSclMult *= (this.enlargeStateFlow.progress*0.2+1);
    this.ySclMult *= (this.enlargeStateFlow.progress*0.2+1);






    if(this.screenMode){
      if(this.tiltActor.isTilted && !this.tiltActor.tilting){
        this.tiltActor.tilting = true;
      }

      if(!this.isFullScale && !this.scaling){
        this.scaling = true;
      }

      if(!this.flipActor.flipping){
        this.onDestroy();


        var metalBlock = new MetalBlock(this.x, this.y);

        if(this.attached){
          var gridId = manager.losangosGrid[this.id];  
          manager.deattachObject(gridId, GRID.MIDDLE);
          manager.attachObject(metalBlock, gridId, GRID.MIDDLE);
        }
        
        var partPlaces = placesInRect(50, this.x - manager.losWid*0.75, this.y - manager.losHei*0.75, manager.losWid*1.5, manager.losHei*1.5);
        var partList = createParticleWithPlaces(particleLock, partPlaces, 100);
        manager.addParticles(partList);

        addObject(metalBlock, OBJECT.METALBLOCK);

        var playOffset = Date.now() - manager.poofStart;
        if(playOffset > 100){
          playSound(SND.POOF);
          manager.poofStart = Date.now();
        }
      }
    }


    // UPDATING LINEANIMATION
    this.linePerc = 0.1 + Math.cos(manager.frames/40)*0.05;
    this.hideLineAlarm.update(dt);

    this.xScl = Math.cos(this.flipActor.phase);

    this.tiltActor.update(dt, this);
    this.flipActor.update(dt, this);

    // Packet processing


    if(this.flipActor.flipped){
      if(this.updatePacket != null){
        
        if(this.flipsTillUpdate <= 1){
          for(var i = 0; i < this.updatePacket.actionList.length; i++){
            var act = this.updatePacket.actionList[i];
            if(act.type == 0){
              this[act.propertyName] = act.value;
            } else {
              this.eventProcesser(act.event, act.params);
            }
          }
          this.updatePacket = null;
        } else {
          this.flipsTillUpdate--;
        }
      }

      this.states[LSTATE.MINESWEEPER] =  manager.minesweeper.grid[manager.losangosGrid[this.id]];
      this.states[LSTATE.SHOPMODE] = this.shopMode;

      this.states[LSTATE.HEADPHONES] = this.headphones;
      this.states[LSTATE.ANIMEHAT] = this.animeHat;
      this.states[LSTATE.IMAGE] = this.imageShow;
      this.states[LSTATE.GRIDIND] = this.getGridId();
    }


    if(!this.flipActor.flipping){
      if(this.updateList.length > 0){
        if(this.updateList[0].waitTime > 0){
          this.updateList[0].waitTime -= dt;
        } else {
          this.updatePacket = this.updateList.shift();
          
          var flipAmount = (this.flipActor.isFront == this.updatePacket.isFront) ? 2 : 1;
          this.flipsTillUpdate = flipAmount;
          this.flip(flipAmount);
        }
      }
    }
  }

  tilt(startState){
    this.tiltActor.tilting = true;
    this.tiltActor.isTilted = startState;
  }

  eventProcesser(eventId, params){
    switch(eventId){
      case LEVENT.TILT:
        this.tilt(params[0]);
      break;
      case LEVENT.ALTNAME:
        this.useAltName = params[0];
      break;
      case LEVENT.STARTMINESWEEPER:
        this.minesweeper = true;
        this.lineStateFlow.hide();
        this.enlargeStateFlow.trigger();
      break;
      case LEVENT.ENDMINESWEEPER:
        this.minesweeper = false;
        this.lineStateFlow.trigger();
        this.enlargeStateFlow.hide();
      break;
      case LEVENT.SCREENMODE:
        this.screenMode = params[0];
      break;
      case LEVENT.IMAGESHOW:
        this.imageShow = params[0];
        this.resolvingImage = false;
        break;

      case LEVENT.STARTTEST:
        this.startTest(params[0]);
        break;
    }
  }



  shop(){
    if(!this.flipActor.flipping){
      if(this.flipActor.isFront){
        
        var obj = null;
        if(this.id == NAME.JVROCHA){
          obj = new Rock(this.x, this.y, 100, 100);
          this.priceTag = 100;
        } else if(this.id == NAME.MICCHAEL){
          obj = new MotherBoard(this.x, this.y);
          this.priceTag = 1000;
        } else if (this.id == NAME.DENISE){
          obj = new USBCable(this.x, this.y);
          this.priceTag = 5000;
        } else if (this.id == NAME.MARCELO){
          obj = new MetalBlock(this.x, this.y);
          this.priceTag = 250;
        }else if (this.id == NAME.JOAS){
          obj = new Bitcoin(this.x, this.y, 50);
          this.priceTag = manager.bitcoinGraph.value;
        }else if (this.id == NAME.NATHALIA){
          obj = new FlowerPot(this.x, this.y);
          this.priceTag = 1000;
        }

        if(obj != null){
          this.backItem = obj;
          this.shopMode = true;

          this.flip(1);
        }
      } 
    }
  }

  startBlackHole(){
    this.blackHoleMode = true;
  }

  drawRequest(ctx, parameter){
    if(parameter == 1){
      this.drawUSBSlot(ctx);
    } else {
      this.draw(ctx);
    }
  }

  drawUSBSlot(ctx){ 
    var anim = manager.losangosAnim[this.getGridId()];

    var xAnim = this.x + anim.x;
    var yAnim = this.y + anim.y;
    var xSclAnim = this.xScl * (1+anim.xScl);
    var ySclAnim = this.yScl * (1+anim.yScl);
    var angAnim = this.angle + anim.angle;



    ctx.save();
    ctx.translate(xAnim, yAnim);
    ctx.scale(xSclAnim*this.xSclMult, ySclAnim*this.ySclMult);
    ctx.rotate(angAnim);

    if(this.connector){
      var xx = -this.width/2;
      var yy = 0;
      sprites[SPR.SCREENUSBSLOT].drawExtRelative(xx, yy, 0, 2,2, 0, 1, 0.5);
    }

    ctx.restore();
  }


  draw(ctx){



    if(this.inOtherplane) return;

    var anim = manager.losangosAnim[this.getGridId()];

    var xAnim = this.x + anim.x;
    var yAnim = this.y + anim.y;
    var xSclAnim = this.xScl * (1+anim.xScl);
    var ySclAnim = this.yScl * (1+anim.yScl);
    var angAnim = this.angle + anim.angle + this.wobbleActor.angle;



    ctx.save();
    ctx.translate(xAnim, yAnim);
    ctx.scale(xSclAnim*this.xSclMult, ySclAnim*this.ySclMult);
    ctx.rotate(angAnim);


    var xRot = -(this.width/2)*Math.cos(angAnim);
    var yRot = -(this.width/2)*Math.sin(angAnim);
    xRot *= xSclAnim*this.xSclMult;
    yRot *= ySclAnim*this.ySclMult;
    xRot += xAnim;
    yRot += yAnim;

    this.connectorPos = new Vector(xRot, yRot);

    if(this.xScl < 0){
      this.connectorAng = -angAnim+Math.PI; 
    } else {
      this.connectorAng = angAnim;
    }

    var resultColor = (this.flipActor.isFront > 0) ? this.frontColor.copy() : this.backColor.copy();

    if(!manager.winSoundReady() && this.id == NAME.VICTORIA){
      resultColor = resultColor.mult(0.5);
    } else if(this.hovered){
      resultColor = resultColor.mult(0.75);
    }

  

    var colorHex = resultColor.toHex();


    // Drawing lines around
    var perc = this.linePerc;
    
    // if(this.minesweeper){
    //   perc *= (1 - this.hideLineAlarm.percentage());
    // }

    perc *= this.lineStateFlow.progress;

    var cooldownColor = Math.floor(this.effectCooldownAlarm.percentage()*200);
    ctx.fillStyle = "rgb(200," + cooldownColor + "," +cooldownColor+")";
    


    if(this.attached){
      ctx.fillRect(-this.width / (2+2*perc), -this.height / (2-2*perc), this.width*(1-perc), 2);
      ctx.fillRect(-this.width / (2+2*perc), +this.height / (2-2*perc) -2, this.width*(1-perc), 2);
      ctx.fillRect(-this.width / (2-2*perc), -this.height / (2+2*perc), 2, this.height*(1-perc));
      ctx.fillRect(+this.width / (2-2*perc)-2, -this.height / (2+2*perc), 2, this.height*(1-perc));
    }


    // Birthdat Hat
    if(this.anniversary){
      sprites[SPR.BIRTHDAY].drawExtRelative(0,-this.height*0.8, this.id,1,1,deg2rad(0),0.5,0.5);
    }

    if(this.preAnniversary){
      sprites[SPR.BIRTHDAY].drawExtRelative(0,-this.height*0.3,this.id,1,1,deg2rad(0),0.5,0.5);
    }


    if(this.states[LSTATE.HEADPHONES]){
      sprites[SPR.HEADPHONES].drawExtRelative(-this.width/2,-this.height/2,0,4,4,deg2rad(0),0.5,0.5);
    }

    if(this.states[LSTATE.ANIMEHAT] == 1){
      sprites[SPR.STRAWHAT].drawExtRelative(0, 0,0,0.7,0.7,deg2rad(0),0.5,0.5);
    }  


   

    // if(this.connector){
    //   var xx = -this.width/2;
    //   var yy = 0;
    //   sprites[SPR.SCREENUSBSLOT].drawExtRelative(xx, yy, 0, 2,2, 0, 1, 0.5);
    // }



    // Drawing Losango
    ctx.fillStyle = colorHex;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    var alpha = ctx.globalAlpha;
    ctx.globalAlpha = 1;
    if (this.states[LSTATE.ANIMEHAT] == 3){
      sprites[SPR.HUNTERHUNTER].drawExtRelative(0,0,0,0.25,0.25,deg2rad(-45),0.5,-0.25);
    }
    ctx.globalAlpha = alpha;



    // Drawing Losango Contents
    if(this.flipActor.isFront){

      if(this.states[LSTATE.IMAGE] == 0){

        var gridInd = this.states[LSTATE.GRIDIND];
        var col = gridInd%10;
        var row = Math.floor(gridInd/10);
  
        var imgX = col + row;
        var imgY = 9 - col + row;
  
        var img = imgX + imgY*14;
  
        sprites[SPR.XAROPSQUARE].drawExtRelative(0,0, img,2.1,2.1,deg2rad(0),0.5,0.5);
      }


      ctx.rotate(-angAnim); // Rotate the canvas context

      ctx.font = ((isMobile) ? "18" : "14") + "px Arial";
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';

      if(this.useAltName){
        ctx.scale(nameMan.persons[this.id].altName.scale, nameMan.persons[this.id].altName.scale);
        ctx.fillText(nameMan.persons[this.id].altName.text, 0, 0);
      } else {
        ctx.scale(nameMan.persons[this.id].name.scale, nameMan.persons[this.id].name.scale);
        ctx.fillText(nameMan.persons[this.id].name.text, 0, 0);
        //ctx.fillText(this.depth, 0, 40);
      }

      if(this.minesweeper){
          if(manager.minesweeper.gridFlag[this.getGridId()]){
              sprites[SPR.NUMBERS].drawExtRelative(0,0,10,this.boxWid/16, this.boxHei/16, 0, 0.5,0.5);
          }
      }
      ctx.rotate(angAnim); // Rotate the canvas context

    } else {
      if(this.minesweeper){
        ctx.rotate(-angAnim); // Rotate the canvas context
        ctx.scale(-1, 1); // Scale the x-axis

        if(this.states[LSTATE.MINESWEEPER] == -1){
          sprites[SPR.BOMB].drawExtRelative(0,0,0,this.boxWid/16, this.boxHei/16, 0, 0.5, 0.5);
        } else if (this.states[LSTATE.MINESWEEPER] != 0){
          sprites[SPR.NUMBERS].drawExtRelative(0,0,this.states[LSTATE.MINESWEEPER],this.boxWid/16, this.boxHei/16, 0, 0.5, 0.5);
        }

        ctx.scale(-1, 1); // Scale the x-axis
        ctx.rotate(angAnim); // Rotate the canvas context
      } else {
        
        ctx.rotate(-angAnim); // Rotate the canvas context
        ctx.scale(-1, 1); // Scale the x-axis


        if(this.blackHoleMode){
          this.blackHole.draw(ctx);
        }

        if(this.backItem != null){
          this.backItem.x = 0;
          this.backItem.y = 0;

          if(this.backItem.type == OBJECT.USBCABLE){
            sprites[SPR.INVENTORYITEMS].drawExtRelative(0,0, OBJECT.USBCABLE-4, 4,4,0,0.5,0.5);
          } else {
            this.backItem.draw(ctx);
          }
        }

        
        if(this.states[LSTATE.SHOPMODE]){
          ctx.font = ((isMobile) ? "22" : "18") + "px Arial";
          ctx.fillStyle = 'green';
          ctx.textAlign = 'center';
          //ctx.fillRect();
          sprites[SPR.PRICETAG].drawExtRelative(0, 40, 0, 2, 2, 0, 0.5, 0.5);
          ctx.fillText(this.priceTag, 0, 40);
          ctx.fillStyle = 'black';

          ctx.fillText(this.priceTag, 0, 38);

        }
        
        ctx.scale(-1, 1); // Scale the x-axis
        ctx.rotate(angAnim); // Rotate the canvas context
      }


    }

    ctx.restore(); // Restore the original state
  }


  onDestroy(){
    this.killBody();
    this.ghostParticles();
    this.inOtherplane = true;
  }

  killBody(){
    if(this.body != null){
      manager.world.remove(this.body);
      this.body = null;
    }
  }

  spawnBody(){
    this.killBody();

    this.body = Physics.body('rectangle', {
      width: this.width
      ,height: this.height
      ,x: this.x
      ,y: this.y
      ,vx: this.hspd + randRange(-0.1, 0.1)
      ,vy: this.vspd + randRange(-0.1, 0.1)
      ,cof: 0.99
      ,restitution: 0.99
    });
    this.body.state.angular.pos = deg2rad(45);
    manager.world.add(this.body);
  }


  deattach(){
    if(this.physical && !this.inOtherplane){
      this.spawnBody();
    } else {
      this.killBody();
    }
  }

  attach(){
    this.killBody();
  }



  startFlipping(){

    var playOffset = Date.now() - manager.pageSlipStart;
    if(playOffset > 100){
      playSound(SND.PAGESLIP);
      manager.pageSlipStart = Date.now();
    }
 
    this.flipActor.flipping = true;
  }

  flip(flipAmount = 2, flipSnap = true, flipSpd = this.flipActor.normalSpd){
    this.startFlipping();
    this.flipActor.startFlip(flipAmount, flipSnap, flipSpd);
    //this.flipActor.flipping = true;
    //this.flipAmount = flipAmount;
    //this.flipTargetPhase = this.phase + this.flipAmount * Math.PI;
  }





  isInside(x, y){
    if(pointInRect(x, y, this.x - this.boundingBox.width/2, this.y - this.boundingBox.height/2, this.x + this.boundingBox.width/2, this.y + this.boundingBox.height/2)){
      return true;
    }
    return false;
  }

  updateBox(){
    this.boundingBox.x = this.x - this.boxWid/2;
    this.boundingBox.y = this.y - this.boxHei/2;
  }

  boundingboxToPos(){
    return new Vector(this.boundingBox.x + this.boundingBox.width/2, this.boundingBox.y + this.boundingBox.height/2);
  }

  getGridId(){
    return manager.losangosGrid[this.id];
  }

  show(){
    this.draw(ctx);
  }

}
