

function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.xOffset = 0;
    this.yOffset = 0;

    this.checkCollision = function (otherBB) {
        if (this.x - this.xOffset < otherBB.x - otherBB.xOffset + otherBB.width &&
            this.x - this.xOffset + this.width > otherBB.x - otherBB.xOffset &&
            this.y - this.yOffset < otherBB.y - otherBB.yOffset + otherBB.height &&
            this.y - this.yOffset + this.height > otherBB.y - otherBB.yOffset) {
            return true;
        }
        return false;
    };

    this.isPointInside = function(x,y){
      return pointInRect(x, y, this.x - this.xOffset, this.y - this.yOffset, this.x - this.xOffset + this.width, this.y - this.yOffset + this.height);
    }

    this.add = function(x, y){
      var bb = new BoundingBox(this.x + x,this.y + y,this.width,this.height);
      bb.xOffset = this.xOffset;
      bb.yOffset = this.yOffset;
      return bb;
    }



    this.show = function () {
        // Draw the rectangle border
        ctx.strokeStyle = "rgb(255, 0, 0)";
        //ctx.lineWidth = 2;
        ctx.strokeRect(this.x - this.xOffset, this.y - this.yOffset, this.width, this.height);
    };
}


class BoundingArea{
  constructor(){
    this.areas = [];
  }



  checkCollision(otherBoundingBox) {

    if(otherBoundingBox instanceof BoundingArea){
      for(var i = 0 ; i < otherBoundingBox.areas.length; i++){
        var area = otherBoundingBox.areas[i];
        if(this.checkCollisionBoundingBox(area)){
          return true;
        }
      }
    } else {
      if(this.checkCollisionBoundingBox(otherBoundingBox)){
        return true;
      }
    }
    return false; // No collision
  }

  checkCollisionBoundingBox(otherBB){
    for(var i = 0 ; i < this.areas.length; i++){
      var area = this.areas[i];

      if(area.checkCollision(otherBB)){
        return true;
      }
    }
    return false;
  }

  isPointInside(x,y){
    for(var i = 0 ; i < this.areas.length; i++){
      var area = this.areas[i];
      if(area.isPointInside(x, y)){
        return true;
      } 
    }
    return false;
  }

}



// Base Object
function GameObject(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.hspd = 0;
    this.vspd = 0;
    this.angSpd = 0;

    this.sprite = sprite;
    this.depth = 0;
    this.ang = 0;
    this.xScl = 1;
    this.yScl = 1;

    this.type = OBJECT.GAMEOBJECT;

    this.attached = false;
    this.attachGridId = -1;

    this.active = true;

    this.pushDrawList = function () {
      addList(new DrawRequest(this, this.depth, 0), OBJECT.DRAW);
    }

    this.drawRequest = function(ctx, parameter){
      this.draw(ctx);
    }
}

GameObject.prototype.draw = function (ctx) {
    this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.xScl, 0, 0, 0);
};

GameObject.prototype.update = function () {
    this.x += this.hspd;
    this.y += this.vspd;
    this.ang += this.angSpd;
};


class DrawRequest{
  constructor(obj, depth, parameter = null){
    this.obj = obj;
    this.depth = depth;
    this.parameter = parameter;
  }

  draw(ctx){
    this.obj.drawRequest(ctx, this.parameter);
  }
}





function TextObject(x, y, text) {
    this.x = x;
    this.y = y;
    this.hspd = 0;
    this.vspd = 0;
    this.scl = 2;
    this.text = text;
    this.active = true;

    this.depth = -1;

    this.maxLife = 150;
    this.life = this.maxLife;

    this.update = function () {
        this.y -= 1;
        this.life--;

        if (this.life <= 0) {
            this.active = false;
        }
    }

    this.drawRequest = function(ctx, parameter){
      this.draw();
    }

    this.draw = function () {
        ctx.font = "20px Fixedsys";

        let hue = Math.random() * 360;
        ctx.fillStyle = "hsl(" + hue + ", 100%, 50%)";
        ctx.fillText(this.text, this.x + 2, this.y + 2);
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText(this.text, this.x, this.y);
    }

}

function SleepText(x, y){
  TextObject.call(this, x, y, "Z");
  this.amp = 10;
  this.phase = 0;

  this.vspd = -1;
  this.hspd = 0.5;



  this.update = function(){
    this.phase += 0.05;
    this.y += this.vspd;
    this.x += this.hspd;

    this.life--;

    if (this.life <= 0) {
        this.active = false;
    }
  }

  this.draw = function () {
    ctx.font = "48px Fixedsys";

    var ratio = (this.life/this.maxLife);
    var animX = this.x + this.amp*Math.sin(this.phase);
    var animY = this.y + this.amp*Math.sin(this.phase);

    var scl = this.scl * (1-ratio);
    var alpha = ratio;

    ctx.save();
    ctx.translate(animX, animY);
    ctx.scale(scl, scl);
    ctx.fillStyle = "rgba(0,0,0,"+ alpha +")";
    ctx.fillText(this.text, 2, 2);
    ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }
}



function Block(x, y, wid, hei) {
    GameObject.call(this, x, y, sprites[SPR.BOMB]);

    this.width = wid;
    this.height = hei;
    this.centerX = 0;
    this.centerY = 0;

    this.x1 = this.x - this.centerX;
    this.x2 = this.x - this.centerX + this.width;
    this.y1 = this.y - this.centerY;
    this.y2 = this.y - this.centerY + this.height;

    this.weight = 1;


    //   pos =  x1, y1, x2, y2
    //this.pos = [0, 0, wid, hei];

    this.show = function () {
        this.strokeBounds();
    }

    this.strokeBounds = function () {
        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.strokeRect(this.x - this.centerX, this.y - this.centerY, this.width, this.height);
    }

    this.updatePos = function () {
        // Updates Bounding Points
        this.x1 = this.x - this.centerX;
        this.x2 = this.x - this.centerX + this.width;
        this.y1 = this.y - this.centerY;
        this.y2 = this.y - this.centerY + this.height;
    }

    this.update = function () {
        this.x += this.hspd;
        this.y += this.vspd;

        this.vspd += 0.1;

        this.hspd = clamp(this.hspd, -40, 40);
        this.vspd = clamp(this.vspd, -40, 40);

        if (this.x + this.width > width) {
            this.x = width - this.width;
            this.hspd *= -0.9;

        } else if (this.x < 0) {
            this.x = 0;
            this.hspd *= -0.9;
        }

        if (this.y + this.height > height) {
            this.y = height - this.height;
            this.vspd *= -0.9;
        } else if (this.y < 0) {
            this.y = 0;
            this.vspd *= -0.9;
        }

    }
}
















class Holder{
  constructor(){
    this.holded = false;
    this.holdX = 0;
    this.holdY = 0;
    this.holdEvent = false; 
    this.throwEvent = false;
  }

  getHold(obj){
    if(obj.hovered && !this.holded && input.mouseState[0][1] && manager.holding == false && obj.canBeHeld){
      manager.holding = true;
      manager.holdingObject = obj;
      manager.holdingContent = obj.type;

      this.holded = true;
      this.holdEvent = true;
      this.holdX = input.mouseX - obj.x;
      this.holdY = input.mouseY - obj.y;


      obj.hspd = 0;
      obj.vspd = 0;
    }
  }

  update(obj){
    if(this.holded){

      obj.x = input.mouseX - this.holdX;
      obj.y = input.mouseY - this.holdY;

      if(!input.mouseState[0][0]){
        this.holded = false;
        this.throwEvent = true;

        this.throw(obj);
      }
    }
  }

  throw(obj){
    let totalXDiff = 0;
    let totalYDiff = 0;

    for (const mousePos of manager.prevMousePos) {
      totalXDiff += (obj.x + this.holdX) - mousePos.x;
      totalYDiff += (obj.y + this.holdY) - mousePos.y;
    }

    var throwForce = 1;
    obj.hspd = (totalXDiff / manager.prevMousePos.length) * throwForce;
    obj.vspd = (totalYDiff / manager.prevMousePos.length) * throwForce;
  }
}






function Box(x, y, width, height, sprite) {
    Block.call(this, x, y, width, height);
    GameObject.call(this, x, y, sprite);

    this.type = OBJECT.BLOCK;

    this.width = width;
    this.height = height;

    this.xOffset = 0;
    this.yOffset = 0;

    this.boundingBox = new BoundingBox(this.x  -this.xOffset, this.y -this.yOffset, this.width, this.height);

    this.hovered = false;
    // this.holded = false;
    // this.holdX = 0;
    // this.holdY = 0;

    this.prevX = 0;
    this.prevY = 0;

    this.hspdMax = 20;
    this.vspdMax = 20;

    this.angDamp = 0.99;
    this.linDamp = 0.999;

    this.vLoss = 0.8;
    this.hLoss = 0.9;

    this.gravityOn = true;
    this.gravity = 0.1;

    this.rotateOnCollision = true;

    this.hacc = 0;
    this.vacc = 0;

    this.floorY = roomHeight;

    this.onGround = false;

    this.holder = new Holder();
    this.canBeHeld = true;


    this.tick = 0;

    this.draw = function () {
        this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, this.ang, this.xOffset/this.xScl, this.yOffset/this.yScl);
    }


    this.parameterStep = function(dt){

      this.hacc = 0;
      this.vacc = 0;


      if(this.gravityOn){
        this.vacc += this.gravity;
      }

      this.hspd += this.hacc*dt;
      this.vspd += this.vacc*dt;

      this.hspd *= Math.pow(this.linDamp, dt);
      this.vspd *= Math.pow(this.linDamp, dt);

      this.hspd = clamp(this.hspd, -this.hspdMax, this.hspdMax);
      this.vspd = clamp(this.vspd, -this.vspdMax, this.vspdMax);
      this.angSpd = clamp(this.angSpd, -0.5, 0.5);

      this.angSpd *= Math.pow(this.angDamp, dt);

      this.prevX = this.x;
      this.prevY = this.y;

      this.x += this.hspd*dt;
      this.y += this.vspd*dt;
      this.ang += this.angSpd*dt;

      this.boundingBox.x = this.x - this.xOffset;
      this.boundingBox.y = this.y - this.yOffset;

    }

    this.collisionAction = function(isHorizontal, velocity){

    }

    this.updateBox = function (dt) {

        this.parameterStep(dt);

        this.hovered = false;
        if(this.boundingBox.isPointInside(input.mouseX, input.mouseY)){
          this.hovered = true;
        }

        this.holder.getHold(this);

        // Wall Collisions
        if (!this.holder.holded) {
            this.tick++;

            if (this.x - this.xOffset + this.width> roomWidth) {
              this.collisionAction(true, this.hspd);

              this.x = roomWidth - this.width + this.xOffset;

              if(this.rotateOnCollision){
                this.angSpd += this.vspd / 40;
              }
              this.hspd *= -this.hLoss;
            } else if (this.x - this.xOffset < 0) {
              this.collisionAction(true, this.hspd);

              this.x = this.xOffset;
              if(this.rotateOnCollision){
                this.angSpd += this.vspd / 40;
              }
              this.hspd *= -this.hLoss;
            }


            if (this.y - this.yOffset + this.height  > this.floorY) {
              if (Math.abs(this.vspd) > Math.abs(this.gravity * 3)) {
                this.collisionAction(false, this.vspd);
                if(this.rotateOnCollision){
                  this.angSpd += this.hspd / 40;
                }
              }

              this.y = this.floorY -this.height + this.yOffset;
              this.vspd *= -this.vLoss;
              this.hspd *= this.linDamp;
            }
        }

        if(this.y -this.yOffset + this.height + 1 > this.floorY){
          this.onGround = true;
        } else {
          this.onGround = false;
        }

        if(this.onGround){
          if(this.rotateOnCollision){
            this.angSpd = this.hspd/40;
          }
        }

        this.holder.update(this);

        this.pushDrawList();
    }

    this.update = function(dt = 1){
      this.updateBox(dt);
    }
}


function Ball(x, y, radius, sprite) {
    Box.call(this, x, y, radius*2, radius*2, sprite);
    this.type = OBJECT.BALL;
    this.xOffset = radius;
    this.yOffset = radius;

    this.r = radius;
}

function Bitcoin(x, y, radius) {
  Ball.call(this, x, y, radius, sprites[SPR.BITCOIN]);
  this.type = OBJECT.BITCOIN;

  this.xScl = (2*radius)/this.sprite.width;
  this.yScl = (2*radius)/this.sprite.height;
  this.xOffset = radius;
  this.yOffset = radius;
  this.hovered = false;

  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.depth = objectsDepth.bitcoin;

  this.collisionAction = function(isHorizontal, velocity){
    var spd =  Math.abs(velocity);
    if(spd > 2){
      if(spd > 5){
        playSound(SND.COINHIT);
      } else {
        playSound(SND.COINHIT2);
      }
    }
  }

  this.update = function(dt){
    this.updateBox(dt);

    if(this.holder.throwEvent){

      if(manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)){
        manager.inventory.attachObjectMouse(this);
      } else {
        manager.attachObjectMouse(this, GRID.FRONT);
      }


      this.holder.throwEvent = false;
    }
  }
}

function Rock(x, y, width, height) {
  Box.call(this, x, y, width, height, sprites[SPR.ROCK]);
  this.type = OBJECT.ROCK;


  this.xScl = (width)/this.sprite.width;
  this.yScl = (height)/this.sprite.height;
  this.xOffset = this.width/2;
  this.yOffset = this.height/2;
  this.hovered = false;
  this.hLoss = 0;
  this.vLoss = 0;

  this.hspdMax = 30;
  this.vspdMax = 30;

  this.gravity = 0.25;

  this.depth = objectsDepth.rock;

  this.rotateOnCollision = false;

  this.collisionAction = function(isHorizontal, velocity){

    var spd =  Math.abs(velocity);

    if(spd > 5){
      playSound(SND.HIT);
    }



    if(!isHorizontal){
      manager.rockHit(spd);
      stopSound(SND.FALLINGROCK);
    }
  }

  this.update = function(dt){

    if(this.onGround){
      this.linDamp = 0.95;
    } else {
      this.linDamp = 1;
    }

    this.updateBox(dt);

    

    if(this.vspd > 10){
      for(var i = 0 ; i < objectLists[OBJECT.MIDMEDLOGO].length; i++){
        var logoObj = objectLists[OBJECT.MIDMEDLOGO][i];
        if(this.boundingBox.checkCollision(logoObj.boundingBox)){
          manager.breakLogo(logoObj);
          this.vspd *= -0.1;
          playSound(SND.HIT);
          playSound(SND.METALHIT3);
          stopSound(SND.FALLINGROCK);
          var parts = createParticlesInRect(particleLock, 50, this.x - this.xOffset, this.y - this.yOffset + this.height/1.5, this.width, this.height);

          manager.addParticles(parts);


        }
      }
    }

    
    if(this.holder.throwEvent){

      if(manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)){
        manager.inventory.attachObjectMouse(this);
      }


      this.holder.throwEvent = false;
    }
  }
}

function Sun(x, y){
  GameObject.call(this,x,y,sprites[SPR.SUN]);
  this.type = OBJECT.SUN;

  this.vspd = 2;
  this.width = 100;
  this.height = 100;
  this.xScl = this.width/this.sprite.width;
  this.yScl = this.height/this.sprite.height;
  this.phase = 0;
  this.hovered = false;
  this.collected = false;
  this.life = 1000;

  this.depth = 1;

  this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);

  this.update = function(dt = 1){
    this.y += this.vspd*dt;

    this.phase += 0.02*dt;

    this.ang = Math.sin(this.phase)*deg2rad(45);

    if(this.y + this.height/2 >= roomHeight){
      this.vspd = 0;
    }

    this.life -= dt;

    if(this.life <= 0){
      this.active = false;
    }

    this.boundingBox.x = this.x - this.width/2;
    this.boundingBox.y = this.y - this.height/2;

    this.hovered = false;
    if(this.boundingBox.isPointInside(input.mouseX, input.mouseY)){
      this.hovered = true;
    }

    if(this.hovered){
      if(input.mouseState[0][1]){
        this.active = false;
        var partNum = randInt(8, 12);
        var partPlaces = placesInRect(partNum, this.x - this.width/2, this.y- this.height/2, this.width, this.height);
        manager.addParticles(createParticleWithPlaces(particleSun, partPlaces));

        playSound(SND.POP);
        manager.collectSun();
      }
    }

    this.pushDrawList();

  }

  this.draw = function(){
    this.sprite.drawExtRelative(this.x, this.y, 0, this.xScl, this.yScl, this.ang, 0.5,0.5);
  }
}


function Dart(x, y, ang){
  Box.call(this, x, y, 60, 60, sprites[SPR.DART]);
  this.type = OBJECT.DART;




  this.xScl = this.width/this.sprite.width;
  this.yScl = this.xScl;

  this.xOffset = this.xScl*this.sprite.width/2;
  this.yOffset = this.yScl*this.sprite.height/4;

  this.boundingBox = new BoundingBox(this.x  -this.xOffset, this.y -this.yOffset + this.width, this.width, this.height);
  this.boundingBoxBack = new BoundingBox(this.x  -this.xOffset, this.y -this.yOffset, this.width, this.height);



  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.depth = objectsDepth.dart;

  this.fixed = false;

  this.update = function(dt = 1){

    if(this.fixed){
      this.hspd = 0;
      this.vspd = 0;
      this.angSpd = 0;
      this.gravityOn = false;

      this.updateBox(dt);
    } else {
      this.updateBox(dt);

      this.boundingBoxBack.x = this.x - this.xOffset + this.width*Math.sin(-this.ang);
      this.boundingBoxBack.y = this.y - this.yOffset + this.width*Math.cos(-this.ang);
      // TUDO ERRADO TUDOOOO

      if(this.hspd != 0 || this.vspd != 0){
        var spdVec = new Vector(this.hspd, this.vspd);
        var targetAng = normalizeAngle(spdVec.angle()+Math.PI/2);

        var diffAng = targetAng - normalizeAngle(this.ang);
        var turnSpd = 0.1;

        if (Math.abs(diffAng) > Math.PI) {
            var diffSign = sign(diffAng);
            this.angSpd = (diffSign * Math.PI - diffAng) * turnSpd;
        }
        else {
            this.angSpd = (diffAng)*turnSpd;
        }

      }
    }

    if(this.holder.holdEvent){
      this.holder.holdEvent = false;
      this.fixed = false;
      this.gravityOn = true;
    }

    if(this.holder.throwEvent){

      if(manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)){
        manager.inventory.attachObjectMouse(this);
      }


      this.holder.throwEvent = false;
    }
  }

  this.collisionAction = function(isHorizontal, velocity){
    var spd =  Math.abs(velocity);

    if(spd > 12){
      playSound(SND.HIT);

      var spdVec = new Vector(this.hspd, this.vspd);
      var targetAng = normalizeAngle(spdVec.angle()+Math.PI/2);
      var diffAng = targetAng - normalizeAngle(this.ang);
      var alignment = 0;
      if (Math.abs(diffAng) > Math.PI) {
          var diffSign = sign(diffAng);
          alignment = (diffSign * Math.PI - diffAng);
      }
      else {
          alignment = (diffAng);
      }

      if(Math.abs(alignment) < Math.PI/16){
        if(this.y > 0){
          this.fixed = true;
        }
      }
    }


  }

  this.draw = function(){
      this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, this.ang, this.xOffset/this.xScl, this.yOffset/this.yScl);
      //this.boundingBox.show();
      //this.boundingBoxBack.show();
  }

}

function MetalBlock(x, y){
  Box.call(this, x, y, manager.losWid, manager.losHei, sprites[SPR.METALBLOCK]);
  this.type = OBJECT.METALBLOCK;


  this.xScl = manager.losWid/this.sprite.width;
  this.yScl = manager.losHei/this.sprite.height;

  this.xOffset = this.xScl*this.sprite.width/2;
  this.yOffset = this.yScl*this.sprite.height/2;

  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.inPlace = false;

  this.depth = 5;

  this.update = function(dt = 1){




    if(this.attached && this.attachGridId != -1){
      this.gravityOn = false;

      if(this.hovered){
        if(input.mouseState[2][1]){
          var gridPos = manager.gridInd2XY(this.attachGridId);
          manager.screenize(gridPos.x, gridPos.y);
        }
      }


      var targetPos = manager.getPosGrid(this.attachGridId);

      //this.attachCooldownAlarm.update(dt);

      if(Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 5){

        //if(this.attachCooldownAlarm.finished){
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

              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));


            } else {
              this.x += dir.x/10;
              this.y += dir.y/10;
            }
          }
        //}
      } else {
        this.inPlace = false;
        var pos = new Vector(this.x, this.y);
        var dist = targetPos.sub(pos).mag();
        var dir = targetPos.sub(pos).unit();

        var spd = Math.max((dist*dist)/100000, 0.1);

        this.hspd += dir.x*spd*dt;
        this.vspd += dir.y*spd*dt;
      }
    } else {
      this.gravityOn = true;
    }

    this.updateBox(dt);

    if(this.holder.throwEvent){

      if(manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)){
        manager.inventory.attachObjectMouse(this);
      } else {
        if(!this.attached){
          manager.attachObjectMouse(this, GRID.MIDDLE);
        }
      }
      this.holder.throwEvent = false;
    }

  }

  this.collisionAction = function(isHorizontal, velocity){

  }

  this.draw = function(){
      this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, 0, this.xOffset/this.xScl, this.yOffset/this.yScl);
  }
}

function BlockPanel(x, y, blocksX, blocksY){
  Box.call(this, x, y, blocksX*manager.losWid, blocksY*manager.losHei, sprites[SPR.SCREENBACKTILE]);
  this.type = OBJECT.PANEL;

  this.hTileNum = blocksX;
  this.vTileNum = blocksY;


  this.xScl = manager.losWid/this.sprite.width;
  this.yScl = manager.losHei/this.sprite.height;

  this.xOffset = 0;
  this.yOffset = 0;

  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.inPlace = false;

  this.depth = 10;

  this.hasCartridgeSlot = (this.hTileNum >= 3);
  this.hasUsbSlot = (this.vTileNum == 1);

  this.pushDrawList = function(){
    objectLists[OBJECT.DRAW].push(new DrawRequest(this, this.depth, 0));
    objectLists[OBJECT.DRAW].push(new DrawRequest(this, -15, 1));
  }


  this.update = function(dt = 1){

    this.depth = 5;

    if(this.attached && this.attachGridId != -1){

      this.depth = 10;
      this.gravityOn = false;

      var targetPos = manager.getPosGrid(this.attachGridId);
      targetPos.x -= manager.losWid/2;
      targetPos.y -= manager.losHei/2;

      //this.attachCooldownAlarm.update(dt);

      if(Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 5){

        //if(this.attachCooldownAlarm.finished){
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

              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));


            } else {
              this.x += dir.x/10;
              this.y += dir.y/10;
            }
          }
        //}
      } else {
        this.inPlace = false;
        var pos = new Vector(this.x, this.y);
        var dist = targetPos.sub(pos).mag();
        var dir = targetPos.sub(pos).unit();

        var spd = Math.max((dist*dist)/100000, 0.1);

        this.hspd += dir.x*spd*dt;
        this.vspd += dir.y*spd*dt;
      }
    } else {
      this.gravityOn = true;
    }

    this.updateBox(dt);

    if(this.holder.throwEvent){
      if(manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)){
        manager.inventory.attachObjectMouse(this);
      } else {
        if(!this.attached){
          manager.attachObjectMouse(this, GRID.BACK);
        }
      }
      this.holder.throwEvent = false;
    }
  }

  this.collisionAction = function(isHorizontal, velocity){

  }

  this.drawRequest = function(ctx, parameter){
    if(parameter == 0){
      this.draw();
    } else {
      this.drawBorder();
    }
  }

  this.drawBorder = function(){

    for(var i = 0; i < this.vTileNum; i++){
      for(var j = 0; j < this.hTileNum; j++){
        var xx = this.x + j*manager.losWid;
        var yy = this.y + i*manager.losHei;
        var img = 0;

        var rotation = 0;

        // Image machine
        if(this.vTileNum == 1 && this.hTileNum == 1){
          img = 12;
        } else if(this.vTileNum == 1){
          
          if(j == 0){
            img = 9;
          } else if(j == this.hTileNum-1){
            img = 11;
          } else {
            img = 10;
          }
        } else if(this.hTileNum == 1){      
          rotation = Math.PI/2;
          if(i == 0){
            img = 9;
          } else if(i == this.vTileNum-1){
            img = 11;
          } else {
            img = 10;
          }
        } else {
          if(i == 0){
            if(j == 0){
              img = 0;
            } else if(j == this.hTileNum-1){
              img = 2;
            } else {
              img = 1;
            }
          } else if (i == this.vTileNum-1) {
            if(j == 0){
              img = 6;
            } else if(j == this.hTileNum-1){
              img = 8;
            } else {
              img = 7;
            }
          } else {
            if(j == 0){
              img = 3;
            } else if(j == this.hTileNum-1){
              img = 5;
            } else {
              img = 4;
            }
          }
        }


       sprites[SPR.SCREENFRAMETILE].drawExt(xx + 32*this.xScl, yy + 32*this.yScl, img, this.xScl, this.yScl, rotation, 32,32);
      }
    }

    if(this.hasCartridgeSlot){
      sprites[SPR.SCREENTILESLOT].drawExt(this.x + manager.losWid*1.5, this.y, 0, this.xScl, this.yScl, 0, sprites[SPR.SCREENTILESLOT].width/2, sprites[SPR.SCREENTILESLOT].height);
    }

    if(this.hasUsbSlot){
      sprites[SPR.SCREENUSBSLOT].drawExt(this.x, this.y + manager.losHei*0.5, 0, this.xScl, this.yScl, 0, sprites[SPR.SCREENUSBSLOT].width, sprites[SPR.SCREENUSBSLOT].height/2);
    }

  }


  this.draw = function(){



      for(var i = 0; i < this.vTileNum; i++){
        for(var j = 0; j < this.hTileNum; j++){
          var xx = this.x + j*manager.losWid;
          var yy = this.y + i*manager.losHei;
          var img = 0;
          var rotation = 0;

          // Image machine
          if(this.vTileNum == 1 && this.hTileNum == 1){
            img = 12;
          } else if(this.vTileNum == 1){
            
            if(j == 0){
              img = 9;
            } else if(j == this.hTileNum-1){
              img = 11;
            } else {
              img = 10;
            }
          } else if(this.hTileNum == 1){    
            rotation = Math.PI/2;  
            if(i == 0){
              img = 9;
            } else if(i == this.vTileNum-1){
              img = 11;
            } else {
              img = 10;
            }
          } else {
            if(i == 0){
              if(j == 0){
                img = 0;
              } else if(j == this.hTileNum-1){
                img = 2;
              } else {
                img = 1;
              }
            } else if (i == this.vTileNum-1) {
              if(j == 0){
                img = 6;
              } else if(j == this.hTileNum-1){
                img = 8;
              } else {
                img = 7;
              }
            } else {
              if(j == 0){
                img = 3;
              } else if(j == this.hTileNum-1){
                img = 5;
              } else {
                img = 4;
              }
            }
          }


          sprites[SPR.SCREENBACKTILE].drawExt(xx + 32*this.xScl, yy + 32*this.yScl, img, this.xScl, this.yScl, rotation, 32,32);
        }
      }

      



      

  }
  
}


function BlockScreen(x, y, blocksX, blocksY){
  Box.call(this, x, y, blocksX*manager.losWid, blocksY*manager.losHei, sprites[SPR.SCREENBACKTILE]);
  this.type = OBJECT.SCREEN;

  this.hTileNum = blocksX;
  this.vTileNum = blocksY;


  this.xScl = manager.losWid/this.sprite.width;
  this.yScl = manager.losHei/this.sprite.height;

  this.xOffset = 0;
  this.yOffset = 0;

  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.inPlace = false;

  this.depth = 5;

  this.hasCartridgeSlot = (this.hTileNum >= 3);
  this.hasUsbSlot = (this.vTileNum == 1);

  // SCREEN VISUAL STUFF

  this.powerOn = false;

  this.cartridge = null;
  this.lastCartridge = null;
  this.cartridgeUpdated = true;
  this.cartridgePos = new Vector(0,0);


  this.checkCartridgeAlarm = new Alarm(0, 100);

  this.turnOnAlarm = new Alarm(0, 50);
  this.turnOffAlarm = new Alarm(0,50);


  // Temporary DRMARIO
  this.bottleWid = this.hTileNum*4;
  this.bottleHei = this.vTileNum*4;

  this.pushDrawList = function(){
    objectLists[OBJECT.DRAW].push(new DrawRequest(this, this.depth, 0));
    objectLists[OBJECT.DRAW].push(new DrawRequest(this, this.depth, 1));
  }


  this.update = function(dt = 1){

    this.depth = 5;

    this.checkCartridgeAlarm.update(dt);


    if(!this.attached){
      if(this.checkCartridgeAlarm.finished){
        this.cartridge = null;
        this.checkCartridgeAlarm.start();
      }
    }

    if(this.powerOn){
      if(this.cartridge == null){
        this.turnOffAlarm.update(dt);

        if(this.turnOffAlarm.finished){
          this.powerOn = false;
          this.turnOffAlarm.restart();
        }
      }
    } else {
      if(this.cartridge != null){
        this.turnOnAlarm.update(dt);

        if(this.turnOnAlarm.finished){
          this.powerOn = true;
          this.turnOnAlarm.restart();
        }
      }
    }

    if(this.attached && this.attachGridId != -1){

      this.depth = -5;


      // CHECKING CARTRIDGE
      if(this.checkCartridgeAlarm.finished){
        if(this.cartridgeUpdated && this.hasCartridgeSlot){
          var gridPos = manager.gridInd2XY(this.attachGridId);
          if(manager.checkValidGridPos(gridPos.x + 1, gridPos.y - 1)){
            var gridObj = manager.grid[GRID.MIDDLE][manager.gridXY2Ind(gridPos.x + 1, gridPos.y - 1)];
            if(gridObj.valid){
              if(gridObj.object.type == OBJECT.LOSANGO){
                this.cartridge = gridObj.object.id;
                this.lastCartridge = this.cartridge;
                if(this.cartridge == NAME.BERNAD){
                  manager.startDrMario(this, this.bottleWid, this.bottleHei);
                }

              } else {
                this.cartridge = null;
              }
            } else {
              this.cartridge = null;
            }
          } else {
            this.cartridge = null;
          }
        }
        this.checkCartridgeAlarm.start();
      }


      this.gravityOn = false;

      var targetPos = manager.getPosGrid(this.attachGridId);
      targetPos.x -= manager.losWid/2;
      targetPos.y -= manager.losHei/2;

      //this.attachCooldownAlarm.update(dt);

      if(Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 5){

        //if(this.attachCooldownAlarm.finished){
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

              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));


            } else {
              this.x += dir.x/10;
              this.y += dir.y/10;
            }
          }
        //}
      } else {
        this.inPlace = false;
        var pos = new Vector(this.x, this.y);
        var dist = targetPos.sub(pos).mag();
        var dir = targetPos.sub(pos).unit();

        var spd = Math.max((dist*dist)/100000, 0.1);

        this.hspd += dir.x*spd*dt;
        this.vspd += dir.y*spd*dt;
      }
    } else {
      this.gravityOn = true;
    }

    this.updateBox(dt);

    if(this.holder.throwEvent){
      if(manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)){
        manager.inventory.attachObjectMouse(this);
      } else {
        if(!this.attached){
          manager.attachObjectMouse(this, GRID.MIDDLE);
        }
      }
      this.holder.throwEvent = false;
    }

  }

  this.collisionAction = function(isHorizontal, velocity){

  }

  this.drawRequest = function(ctx, parameter){
    if(parameter == 0){
      this.draw();
    } else {
      this.drawBorder();
    }
  }

  this.drawBorder = function(){

    for(var i = 0; i < this.vTileNum; i++){
      for(var j = 0; j < this.hTileNum; j++){
        var xx = this.x + j*manager.losWid;
        var yy = this.y + i*manager.losHei;
        var img = 0;

        var rotation = 0;

        // Image machine
        if(this.vTileNum == 1 && this.hTileNum == 1){
          img = 12;
        } else if(this.vTileNum == 1){
          
          if(j == 0){
            img = 9;
          } else if(j == this.hTileNum-1){
            img = 11;
          } else {
            img = 10;
          }
        } else if(this.hTileNum == 1){      
          rotation = Math.PI/2;
          if(i == 0){
            img = 9;
          } else if(i == this.vTileNum-1){
            img = 11;
          } else {
            img = 10;
          }
        } else {
          if(i == 0){
            if(j == 0){
              img = 0;
            } else if(j == this.hTileNum-1){
              img = 2;
            } else {
              img = 1;
            }
          } else if (i == this.vTileNum-1) {
            if(j == 0){
              img = 6;
            } else if(j == this.hTileNum-1){
              img = 8;
            } else {
              img = 7;
            }
          } else {
            if(j == 0){
              img = 3;
            } else if(j == this.hTileNum-1){
              img = 5;
            } else {
              img = 4;
            }
          }
        }


       sprites[SPR.SCREENFRAMETILE].drawExt(xx + 32*this.xScl, yy + 32*this.yScl, img, this.xScl, this.yScl, rotation, 32,32);
      }
    }

    if(this.hasCartridgeSlot){
      sprites[SPR.SCREENTILESLOT].drawExt(this.x + manager.losWid*1.5, this.y, 0, this.xScl, this.yScl, 0, sprites[SPR.SCREENTILESLOT].width/2, sprites[SPR.SCREENTILESLOT].height);
    }

    if(this.hasUsbSlot){
      sprites[SPR.SCREENUSBSLOT].drawExt(this.x, this.y + manager.losHei*0.5, 0, this.xScl, this.yScl, 0, sprites[SPR.SCREENUSBSLOT].width, sprites[SPR.SCREENUSBSLOT].height/2);
    }



  }

  this.draw = function(){


    if(this.lastCartridge != null ){
      if(this.cartridge != null){
        sprites[SPR.BUBBLE].drawExt(this.cartridgePos.x, this.cartridgePos.y, 0, this.xScl*1.2, this.yScl*1.2, 0, 32,32);
      }
    }

      for(var i = 0; i < this.vTileNum; i++){
        for(var j = 0; j < this.hTileNum; j++){
          var xx = this.x + j*manager.losWid;
          var yy = this.y + i*manager.losHei;
          var img = 0;
          var rotation = 0;

          // Image machine
          if(this.vTileNum == 1 && this.hTileNum == 1){
            img = 12;
          } else if(this.vTileNum == 1){
            
            if(j == 0){
              img = 9;
            } else if(j == this.hTileNum-1){
              img = 11;
            } else {
              img = 10;
            }
          } else if(this.hTileNum == 1){    
            rotation = Math.PI/2;  
            if(i == 0){
              img = 9;
            } else if(i == this.vTileNum-1){
              img = 11;
            } else {
              img = 10;
            }
          } else {
            if(i == 0){
              if(j == 0){
                img = 0;
              } else if(j == this.hTileNum-1){
                img = 2;
              } else {
                img = 1;
              }
            } else if (i == this.vTileNum-1) {
              if(j == 0){
                img = 6;
              } else if(j == this.hTileNum-1){
                img = 8;
              } else {
                img = 7;
              }
            } else {
              if(j == 0){
                img = 3;
              } else if(j == this.hTileNum-1){
                img = 5;
              } else {
                img = 4;
              }
            }
          }


          sprites[SPR.SCREENBACKTILE].drawExt(xx + 32*this.xScl, yy + 32*this.yScl, img, this.xScl, this.yScl, rotation, 32,32);
        }
      }

      


      if(this.lastCartridge != null ){

        if(this.attachGridId != -1){
          this.cartridgePos = manager.getPosGrid(this.attachGridId - manager.cols + 1);
        }



        var powerPerc = (this.powerOn ? (1-this.turnOffAlarm.percentage()) : this.turnOnAlarm.percentage());

        var clipVPerc = tweenIn(0.01 + (clamp(powerPerc, 0.75, 1) - 0.75)*(0.99/0.25));
        var clipHPerc = powerPerc;
        var clipWid = this.width - 10*this.xScl;
        var clipHei = this.height - 10*this.yScl;
        var clipX = this.x+5*this.xScl + (clipWid * (1-clipHPerc))/2;
        var clipY = this.y+5*this.yScl + (clipHei * (1-clipVPerc))/2;

        var xx = this.x +this.width/2;
        var yy = this.y +this.height/2;
        ctx.save();
        ctx.beginPath();
        ctx.rect(clipX, clipY, clipWid*clipHPerc, clipHei*clipVPerc);
        ctx.clip();
        switch(this.lastCartridge){
          case 12:
            sprites[SPR.BANNERS].drawExtRelative(xx, yy, 0, this.xScl, this.yScl, 0,0.5,0.5);
          break;
          case 27:
            sprites[SPR.BANNERS].drawExtRelative(xx, yy, 2, this.xScl, this.yScl, 0,0.5,0.5);
          break;
          case 40:
            sprites[SPR.BANNERS].drawExtRelative(xx, yy, 3, this.xScl, this.yScl, 0,0.5,0.5);
          break;
          case 41:
            sprites[SPR.BANNERS].drawExtRelative(xx, yy, 1, this.xScl, this.yScl, 0,0.5,0.5);
          break;
          case 11:
            sprites[SPR.BANNERS].drawExtRelative(xx, yy, 4, this.xScl, this.yScl, 0,0.5,0.5);
          break;
          case 4:
            manager.drMario.draw(this.x, this.y, this.hTileNum*manager.losWid, this.vTileNum*manager.losHei);
          break;
        }
        ctx.restore();
      }

  }

}


function MedLogo(x, y){
  Box.call(this, x, y, manager.losWid*4, manager.losHei*2, sprites[SPR.MIDMEDLOGO]);
  this.type = OBJECT.MIDMEDLOGO;


  this.xScl = 4*manager.losWid/this.sprite.width;
  this.yScl = 2*manager.losHei/this.sprite.height;

  this.xOffset = 0;
  this.yOffset = 0;

  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.inPlace = false;
  this.canBeHeld = false;

  this.depth = 10;

  // this.updateHold = function(){
  //   if(this.holded){
  //     this.x = input.mouseX - this.holdX;
  //     this.y = input.mouseY - this.holdY;

  //     if(!input.mouseState[0][0]){
  //       this.holded = false;
  //       this.throwEvent = true;

  //       let totalXDiff = 0;
  //       let totalYDiff = 0;

  //       for (const mousePos of manager.prevMousePos) {
  //         totalXDiff += (this.x + this.holdX) - mousePos.x;
  //         totalYDiff += (this.y + this.holdY) - mousePos.y;
  //       }

  //       var throwForce = 1;
  //       this.hspd = (totalXDiff / manager.prevMousePos.length) * throwForce;
  //       this.vspd = (totalYDiff / manager.prevMousePos.length) * throwForce;

  //       manager.attachObjectMouse(this);
  //     }


  //   }


    //}

  this.update = function(dt = 1){


    if(this.attached && this.attachGridId != -1){
      this.gravityOn = false;

      var targetPos = manager.getPosGrid(this.attachGridId);
      targetPos.x -= manager.losWid/2;
      targetPos.y -= manager.losHei/2;

      //this.attachCooldownAlarm.update(dt);

      if(Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 5){

        //if(this.attachCooldownAlarm.finished){
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

              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));


            } else {
              this.x += dir.x/10;
              this.y += dir.y/10;
            }
          }
        //}
      } else {
        this.inPlace = false;
        var pos = new Vector(this.x, this.y);
        var dist = targetPos.sub(pos).mag();
        var dir = targetPos.sub(pos).unit();

        var spd = Math.max((dist*dist)/100000, 0.1);

        this.hspd += dir.x*spd*dt;
        this.vspd += dir.y*spd*dt;
      }
    } else {
      this.gravityOn = true;
    }

    this.updateBox(dt);

    if(this.hovered && input.mouseState[0][1]){
      manager.clickParticle();
      var ind = choose([SND.METALHIT1, SND.METALHIT2, SND.METALHIT3]);
      playSound(ind);
    }


    if(this.holder.throwEvent){
      manager.attachObjectMouse(this, GRID.MIDDLE);
      this.holder.throwEvent = false;
    }

  }

  this.collisionAction = function(isHorizontal, velocity){

  }

  this.show = function(){
      this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, 0, this.xOffset/this.xScl, this.yOffset/this.yScl);
  }

}
