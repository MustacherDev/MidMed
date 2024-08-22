
// O ARQUIVO MAIS DESORGANIZADO, COMPLEXO, FEIO, DESMOTIVANTE
// MERECEU ATÉ UM COMENTÁRIO EM PORTUGUÊS

// AS BOUNDINGBOX TÃO MAL APROVEITADAS
// DO GAMEOBJECT EU NÃO VOU RECLAMAR
// TUDO USA O OBJETO BOX COMO BASE
// 





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

  this.isPointInside = function (x, y) {
    return pointInRect(x, y, this.x - this.xOffset, this.y - this.yOffset, this.x - this.xOffset + this.width, this.y - this.yOffset + this.height);
  }

  this.updatePos = function (x, y) {
    this.x = x;
    this.y = y;
  }

  this.setOffset = function (xOff, yOff) {
    this.xOffset = xOff;
    this.yOffset = yOff;
  }

  this.add = function (x, y) {
    var bb = new BoundingBox(this.x + x, this.y + y, this.width, this.height);
    bb.xOffset = this.xOffset;
    bb.yOffset = this.yOffset;
    return bb;
  }



  this.show = function () {
    // Draw the rectangle border
    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.strokeRect(this.x - this.xOffset, this.y - this.yOffset, this.width, this.height);
  };
}


class BoundingArea {
  constructor() {
    this.areas = [];
  }
  checkCollision(otherBoundingBox) {

    if (otherBoundingBox instanceof BoundingArea) {
      for (var i = 0; i < otherBoundingBox.areas.length; i++) {
        var area = otherBoundingBox.areas[i];
        if (this.checkCollisionBoundingBox(area)) {
          return true;
        }
      }
    } else {
      if (this.checkCollisionBoundingBox(otherBoundingBox)) {
        return true;
      }
    }
    return false; // No collision
  }

  checkCollisionBoundingBox(otherBB) {
    for (var i = 0; i < this.areas.length; i++) {
      var area = this.areas[i];

      if (area.checkCollision(otherBB)) {
        return true;
      }
    }
    return false;
  }

  isPointInside(x, y) {
    for (var i = 0; i < this.areas.length; i++) {
      var area = this.areas[i];
      if (area.isPointInside(x, y)) {
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

  this.drawRequest = function (ctx, parameter) {
    this.draw(ctx);
  }

  this.onDestroy = function () {

  }

  this.onRespawn = function () {

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


class DrawRequest {
  constructor(obj, depth, parameter = null) {
    this.obj = obj;
    this.depth = depth;
    this.parameter = parameter;
  }

  draw(ctx) {
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

  this.drawRequest = function (ctx, parameter) {
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

function SleepText(x, y) {
  TextObject.call(this, x, y, "Z");
  this.amp = 10;
  this.phase = 0;

  this.vspd = -1;
  this.hspd = 0.5;



  this.update = function () {
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

    var ratio = (this.life / this.maxLife);
    var animX = this.x + this.amp * Math.sin(this.phase);
    var animY = this.y + this.amp * Math.sin(this.phase);

    var scl = this.scl * (1 - ratio);
    var alpha = ratio;

    ctx.save();
    ctx.translate(animX, animY);
    ctx.scale(scl, scl);
    ctx.fillStyle = "rgba(0,0,0," + alpha + ")";
    ctx.fillText(this.text, 2, 2);
    ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }
}




class Holder {
  constructor() {
    this.holded = false;
    this.holdX = 0;
    this.holdY = 0;
    this.holdEvent = false;
    this.throwEvent = false;
  }

  getHold(obj) {
    if (obj.hovered && !this.holded && input.mouseState[0][1] && manager.holding == false && obj.canBeHeld) {
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

  update(obj) {
    if (this.holded) {

      obj.x = input.mouseX - this.holdX;
      obj.y = input.mouseY - this.holdY;

      if (!input.mouseState[0][0]) {
        this.holded = false;
        this.throwEvent = true;

        this.throw(obj);
      }
    }
  }

  throw(obj) {
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

  GameObject.call(this, x, y, sprite);

  this.type = OBJECT.BLOCK;

  this.width = width;
  this.height = height;

  this.xOffset = 0;
  this.yOffset = 0;

  this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
  this.boundingBox.xOffset = this.xOffset;
  this.boundingBox.yOffset = this.yOffset;

  this.clickBox = new BoundingBox(this.x, this.y, this.width, this.height);
  this.clickBox.xOffset = this.xOffset;
  this.clickBox.yOffset = this.yOffset;

  this.hovered = false;

  this.hspdMax = 20;
  this.vspdMax = 20;
  this.angSpdMax = 1;

  this.angDamp = 0.99;
  this.linDamp = 0.999;

  this.vLoss = 0.8;
  this.hLoss = 0.9;

  this.gravityOn = true;
  this.gravity = new Vector(0, 0.1);

  this.rotateOnCollision = true;

  this.hacc = 0;
  this.vacc = 0;

  // EAST, NORTH, WEST, SOUTH
  this.roomLimitsActive = [true, false, true, true];
  this.roomLimits = [roomWidth, 0, 0, roomHeight];

  this.onGround = false;

  this.holder = new Holder();
  this.canBeHeld = true;

  this.scale2FitSprite = function(){
    this.xScl = this.width/this.sprite.width;
    this.yScl = this.height/this.sprite.height;
  }

  this.draw = function (ctx) {
    this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, this.ang, this.xOffset / this.xScl, this.yOffset / this.yScl);
  }


  this.parameterStep = function (dt) {


    if (this.gravityOn) {
      this.hacc += this.gravity.x;
      this.vacc += this.gravity.y;
    }

    this.hspd += this.hacc * dt;
    this.vspd += this.vacc * dt;

    this.hspd *= Math.pow(this.linDamp, dt);
    this.vspd *= Math.pow(this.linDamp, dt);
    this.angSpd *= Math.pow(this.angDamp, dt);

    this.hspd = clamp(this.hspd, -this.hspdMax, this.hspdMax);
    this.vspd = clamp(this.vspd, -this.vspdMax, this.vspdMax);
    this.angSpd = clamp(this.angSpd, -this.angSpdMax, this.angSpdMax);

    this.x += this.hspd * dt;
    this.y += this.vspd * dt;
    this.ang += this.angSpd * dt;

    this.boundingBox.updatePos(this.x, this.y);
    this.clickBox.updatePos(this.x, this.y);

    this.hacc = 0;
    this.vacc = 0;

  }

  this.collisionAction = function (isHorizontal, velocity) {

  }

  this.updateBox = function (dt) {

    this.parameterStep(dt);

    this.hovered = false;
    if (this.clickBox.isPointInside(input.mouseX, input.mouseY)) {
      this.hovered = true;
    }

    this.holder.getHold(this);

    // Wall Collisions
    if (!this.holder.holded) {

      if (this.roomLimitsActive[0]) {
        if (this.x - this.boundingBox.xOffset + this.width > this.roomLimits[0]) {
          this.collisionAction(true, this.hspd);

          this.x = this.roomLimits[0] - this.width + this.boundingBox.xOffset;

          if (this.rotateOnCollision) {
            this.angSpd += this.vspd / 40;
          }
          this.hspd *= -this.hLoss;
        }
      }

      if (this.roomLimitsActive[2]) {
        if (this.x - this.boundingBox.xOffset < this.roomLimits[2]) {
          this.collisionAction(true, this.hspd);

          this.x = this.roomLimits[2] + this.boundingBox.xOffset;

          if (this.rotateOnCollision) {
            this.angSpd += this.vspd / 40;
          }
          this.hspd *= -this.hLoss;
        }
      }

      if (this.roomLimitsActive[1]) {
        if (this.y - this.boundingBox.yOffset < this.roomLimits[1]) {
          if (Math.abs(this.vspd) > Math.abs(this.gravity.y * 3)) {
            this.collisionAction(false, this.vspd);
            if (this.rotateOnCollision) {
              this.angSpd += this.hspd / 40;
            }
          }

          this.y = this.roomLimits[1] + this.boundingBox.yOffset;
          this.vspd *= -this.vLoss;
          this.hspd *= this.linDamp;
        }
      }

      if (this.roomLimitsActive[3]) {
        if (this.y - this.boundingBox.yOffset + this.height > this.roomLimits[3]) {
          if (Math.abs(this.vspd) > Math.abs(this.gravity.y * 3)) {
            this.collisionAction(false, this.vspd);
            if (this.rotateOnCollision) {
              this.angSpd += this.hspd / 40;
            }
          }

          this.y = this.roomLimits[3] - this.height + this.boundingBox.yOffset;
          this.vspd *= -this.vLoss;
          this.hspd *= this.linDamp;
        }
      }
    }

    if (this.roomLimitsActive[3]) {
      if (this.y - this.boundingBox.yOffset + this.height + 1 > this.roomLimits[3]) {
        this.onGround = true;
      } else {
        this.onGround = false;
      }
    } else {
      this.onGround = false;
    }

    if (this.onGround) {
      if (this.rotateOnCollision) {
        this.angSpd = this.hspd / 40;
      }
    }

    this.holder.update(this);

    this.pushDrawList();
  }

  this.update = function (dt) {
    this.updateBox(dt);
  }
}


function Ball(x, y, radius, sprite) {
  Box.call(this, x, y, radius * 2, radius * 2, sprite);
  this.type = OBJECT.BALL;
  this.xOffset = radius;
  this.yOffset = radius;

  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.clickBox.setOffset(this.xOffset, this.yOffset);

  this.r = radius;
}

function Bitcoin(x, y, radius) {
  Ball.call(this, x, y, radius, sprites[SPR.BITCOIN]);
  this.type = OBJECT.BITCOIN;

  this.xScl = (2 * radius) / this.sprite.width;
  this.yScl = (2 * radius) / this.sprite.height;
  this.xOffset = radius;
  this.yOffset = radius;
  this.hovered = false;

  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.clickBox.setOffset(this.xOffset, this.yOffset);


  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.depth = objectsDepth.bitcoin;

  this.collisionAction = function (isHorizontal, velocity) {
    var spd = Math.abs(velocity);
    if (spd > 2) {
      if (spd > 6) {
        playSound(SND.COINHIT);
      } else {
        playSound(SND.COINHIT2);
      }
    }
  }

  this.update = function (dt) {
    this.updateBox(dt);

    if (this.holder.throwEvent) {

      if (manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
        manager.inventory.attachObjectMouse(this);
      } else {
        var pos = manager.getMouseGrid();
        var gridXY = manager.gridInd2XY(pos);
        if (manager.checkValidGridPos(gridXY.x, gridXY.y)) {

          var gridObj = manager.grid[GRID.MIDDLE][pos];

          if (gridObj.valid) {
            if (gridObj.object.type == OBJECT.LOSANGO) {
              if (gridObj.object.id == NAME.LAIS) {
                manager.addParticles(createParticlesInRect(particleSun, 5, gridObj.object.x - manager.losWid / 2, gridObj.object.y - manager.losHei / 2, manager.losWid, manager.losHei));

                manager.collectMoney(manager.bitcoinGraph.value) * 8;
                manager.achievementManager.getAchievement(ACHIEVEMENT.FIRSTTRADE);
                this.active = false;
              }
            }
          }
        }

      }


      this.holder.throwEvent = false;
    }
  }
}

function Rock(x, y, width, height) {
  Box.call(this, x, y, width, height, sprites[SPR.ROCK]);
  this.type = OBJECT.ROCK;


  this.xScl = (width) / this.sprite.width;
  this.yScl = (height) / this.sprite.height;
  this.xOffset = this.width / 2;
  this.yOffset = this.height / 2;
  this.hovered = false;
  this.hLoss = 0;
  this.vLoss = 0;

  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.clickBox.setOffset(this.xOffset, this.yOffset);

  this.hspdMax = 30;
  this.vspdMax = 30;

  this.gravity.y = 0.25;

  this.depth = objectsDepth.rock;

  this.rotateOnCollision = false;

  this.collisionAction = function (isHorizontal, velocity) {

    var spd = Math.abs(velocity);

    if (spd > 5) {
      playSound(SND.HIT);
    }



    if (!isHorizontal) {
      manager.rockHit(spd);
      stopSound(SND.FALLINGROCK);

      if(spd > 3){
        manager.screenShaker.startShake(5, 20);
      }
    }
  }

  this.update = function (dt) {

    if (this.onGround) {
      this.linDamp = 0.95;
    } else {
      this.linDamp = 1;
    }

    this.updateBox(dt);



    if (this.vspd > 10) {
      for (var i = 0; i < objectLists[OBJECT.MIDMEDLOGO].length; i++) {
        var logoObj = objectLists[OBJECT.MIDMEDLOGO][i];
        if (this.boundingBox.checkCollision(logoObj.boundingBox)) {
          manager.breakLogo(logoObj);
          this.vspd *= -0.1;
          playSound(SND.HIT);
          playSound(SND.METALHIT3);
          stopSound(SND.FALLINGROCK);

          manager.screenShaker.startShake(10, 30);

          var parts = createParticlesInRect(particleLock, 50, this.x - this.xOffset, this.y - this.yOffset + this.height / 1.5, this.width, this.height);

          manager.addParticles(parts);


        }
      }
    }


    if (this.holder.throwEvent) {
      if (manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
        manager.inventory.attachObjectMouse(this);
      }
      this.holder.throwEvent = false;
    }
  }
}

function Sun(x, y) {
  GameObject.call(this, x, y, sprites[SPR.SUN]);
  this.type = OBJECT.SUN;

  this.vspd = 2;
  this.width = 100;
  this.height = 100;
  this.xScl = this.width / this.sprite.width;
  this.yScl = this.height / this.sprite.height;
  this.phase = 0;
  this.hovered = false;
  this.collected = false;
  this.life = 1000;

  this.depth = 1;

  this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
  //this.boundingBox.setOffset(this.xOffset, this.yOffset);

  this.absorbe = function(){
    this.active = false;
    var partNum = randInt(2, 5);
    var partPlaces = placesInRect(partNum, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    manager.addParticles(createParticleWithPlaces(particleSun, partPlaces));

    playSound(SND.POP);
  }

  this.update = function (dt) {
    this.y += this.vspd * dt;

    this.phase += 0.02 * dt;

    this.ang = Math.sin(this.phase) * deg2rad(45);

    if (this.y + this.height / 2 >= roomHeight) {
      this.vspd = 0;
    }

    this.life -= dt;

    if (this.life <= 0) {
      this.active = false;
    }

    this.boundingBox.x = this.x - this.width / 2;
    this.boundingBox.y = this.y - this.height / 2;

    this.hovered = false;
    if (this.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
      this.hovered = true;
    }

    for(var i = 0 ;i  < objectLists[OBJECT.FLOWERPOT].length; i++){
      var pot = objectLists[OBJECT.FLOWERPOT][i];
      if(pot.boundingBox.checkCollision(this.boundingBox)){
        if(pot.hasPlant){
          pot.plantStage++;
          this.absorbe();
          break;
        }
      }
    }

    if (this.hovered) {
      if (input.mouseState[0][1]) {
        this.absorbe();
        manager.collectSun();
      }
    }

    this.pushDrawList();

  }

  this.draw = function (ctx) {

    var alpha = ctx.globalAlpha;
    ctx.globalAlpha = (this.life < 100 ? this.life / 100 : 1);
    this.sprite.drawExtRelative(this.x, this.y, 0, this.xScl, this.yScl, this.ang, 0.5, 0.5);

    ctx.globalAlpha = alpha;
  }
}


function Dart(x, y, ang) {
  Box.call(this, x, y, 60, 60, sprites[SPR.DART]);
  this.type = OBJECT.DART;




  this.xScl = this.width / this.sprite.width;
  this.yScl = this.xScl;

  this.xOffset = this.xScl * this.sprite.width / 2;
  this.yOffset = this.yScl * this.sprite.height / 4;

  this.backOffset = new Vector(0, this.width);

  this.boundingBox = new BoundingBox(this.x + this.backOffset.x, this.y + this.backOffset.y, this.width, this.height);
  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.boundingBoxBack = new BoundingBox(this.x, this.y, this.width, this.height);
  this.boundingBoxBack.setOffset(this.xOffset, this.yOffset);
  this.clickBox = new BoundingBox(this.x, this.y, this.width, this.height);
  this.clickBox.setOffset(this.xOffset, this.yOffset);



  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.depth = objectsDepth.dart;

  this.fixed = false;

  this.update = function (dt) {

    if (this.fixed) {
      this.hspd = 0;
      this.vspd = 0;
      this.angSpd = 0;
      this.gravityOn = false;

      this.updateBox(dt);
    } else {
      this.updateBox(dt);

      this.backOffset.setAngle(-this.ang + deg2rad(90))
      this.backOffset = this.backOffset.mult(this.width);

      this.boundingBoxBack.updatePos(this.x + this.backOffset.x, this.y + this.backOffset.y);
      //  = this.x - this.xOffset + this.width*Math.sin(-this.ang);
      // this.boundingBoxBack.y = this.y - this.yOffset + this.width*Math.cos(-this.ang);
      // TUDO ERRADO TUDOOOO

      if (this.hspd != 0 || this.vspd != 0) {
        var spdVec = new Vector(this.hspd, this.vspd);
        var targetAng = normalizeAngle(spdVec.angle() + Math.PI / 2);

        var diffAng = targetAng - normalizeAngle(this.ang);
        var turnSpd = 0.1;

        if (Math.abs(diffAng) > Math.PI) {
          var diffSign = sign(diffAng);
          this.angSpd = (diffSign * Math.PI - diffAng) * turnSpd;
        }
        else {
          this.angSpd = (diffAng) * turnSpd;
        }

      }
    }

    if (this.holder.holdEvent) {
      this.holder.holdEvent = false;
      this.fixed = false;
      this.gravityOn = true;
    }

    if (this.holder.throwEvent) {

      if (manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
        manager.inventory.attachObjectMouse(this);
      }


      this.holder.throwEvent = false;
    }
  }

  this.collisionAction = function (isHorizontal, velocity) {
    var spd = Math.abs(velocity);

    if (spd > 12) {
      playSound(SND.HIT);

      var spdVec = new Vector(this.hspd, this.vspd);
      var targetAng = normalizeAngle(spdVec.angle() + Math.PI / 2);
      var diffAng = targetAng - normalizeAngle(this.ang);
      var alignment = 0;
      if (Math.abs(diffAng) > Math.PI) {
        var diffSign = sign(diffAng);
        alignment = (diffSign * Math.PI - diffAng);
      }
      else {
        alignment = (diffAng);
      }

      if (Math.abs(alignment) < Math.PI / 16) {
        if (this.y > 0) {
          this.fixed = true;
        }
      }
    }


  }

  this.draw = function () {
    this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, this.ang, this.xOffset / this.xScl, this.yOffset / this.yScl);
    //this.boundingBox.show();
    //this.boundingBoxBack.show();
  }

}


function MiniDart(x, y, type, angle) {
  Box.call(this, x, y, 80, 80, sprites[SPR.MINIDART]);
  this.type = OBJECT.MINIDART;


  this.xScl = this.width / this.sprite.width;
  this.yScl = this.xScl;

  this.xOffset = this.xScl * this.sprite.width / 2;
  this.yOffset = this.yScl * this.sprite.height / 2;

  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.clickBox.setOffset(this.xOffset, this.yOffset);

  this.dartType = type;

  this.angle = angle;
  this.spd = 10;

  this.gravityOn = false;
  this.canBeHeld = false;

  this.life = 400;

  this.depth = -1;

  this.update = function (dt) {
    this.hspd = this.spd * Math.cos(this.angle);
    this.vspd = this.spd * Math.sin(this.angle);

    this.parameterStep(dt);

    var margin = 50;
    if (this.x > roomWidth + margin || this.x < -margin) {
      this.active = false;
    } else if (this.y > roomHeight + margin || this.y < -margin) {
      this.active = false;
    }

    this.life--;
    if (this.life <= 0) {
      this.active = false;
    }

    this.pushDrawList();
  }

  this.draw = function (ctx) {
    this.sprite.drawExtRelative(this.x, this.y, this.dartType, this.xScl, this.yScl, this.angle, 0.5, 0.5);
  }
}

function Balloon(x, y, type) {
  Box.call(this, x, y, 100, 100, sprites[SPR.BALLOON]);
  this.type = OBJECT.BALLOON;
  this.sprite = sprites[SPR.BALLOON];

  this.xScl = this.width / this.sprite.width;
  this.yScl = this.xScl;

  this.xOffset = this.xScl * this.sprite.width / 2;
  this.yOffset = this.yScl * this.sprite.height / 2;

  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.clickBox.setOffset(this.xOffset, this.yOffset);

  this.balloonType = type;

  this.gravityOn = true;
  this.vspdMax = 2;
  this.gravity.y = -0.05;
  this.roomLimitsActive[3] = false;
  this.roomLimitsActive[1] = false;
  this.canBeHeld = true;

  this.holdingString = new RopeObject(this.x, this.y + this.height / 2, randInt(3, 5), 30);
  this.holdingString.sprite = sprites[SPR.CABLE];
  this.holdingString.ropeImgType = 1;
  this.holdingString.init(this.holdingString.rope.points.length - 1, false, true, true);

  this.angle = 0;

  this.depth = -11;

  this.update = function (dt) {

    var offset = this.height / 2;
    this.holdingString.rope.points[0].pos.x = this.x - offset * Math.cos(this.angle - Math.PI / 2);
    this.holdingString.rope.points[0].pos.y = this.y - offset * Math.sin(this.angle - Math.PI / 2);

    this.holdingString.update(dt);

    this.updateBox(dt);


    if (this.y < -200) {
      this.active = false;
    }

  }

  this.draw = function (ctx) {

    var scl = this.holdingString.rope.segmentLength / this.holdingString.sprite.height;

    for (var i = 0; i < objectLists[OBJECT.MINIDART].length; i++) {
      var dart = objectLists[OBJECT.MINIDART][i];
      if (this.boundingBox.checkCollision(dart.boundingBox)) {
        this.active = false;
        dart.active = false;
      }
    }


    this.sprite.drawExtRelative(this.x, this.y, this.balloonType, this.xScl, this.yScl, this.angle, 0.5, 0.5);
  }

  this.onDestroy = function () {
    playSound(choose([SND.BALLOONPOP1, SND.BALLOONPOP2]));
    manager.addParticles([particleSmack(this.x, this.y)]);
    this.holdingString.active = false;
    this.holdingString.onDestroy();
  }
}


function MotherBoard(x, y) {
  Box.call(this, x, y, manager.losWid * 0.75, manager.losHei * 0.75, sprites[SPR.SHOPITEMS]);
  this.type = OBJECT.MOTHERBOARD;


  this.xScl = this.width / this.sprite.width;
  this.yScl = this.height / this.sprite.height;

  this.xOffset = this.xScl * this.sprite.width / 2;
  this.yOffset = this.yScl * this.sprite.height / 2;

  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.clickBox.setOffset(this.xOffset, this.yOffset);

  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.depth = 5;

  this.update = function (dt) {
    this.updateBox(dt);

    if (this.holder.holded) {
      this.depth = -20;
    }

    if (this.holder.throwEvent) {

      if (manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
        manager.inventory.attachObjectMouse(this);
      } else {
        //manager.attachObjectMouse(this, GRID.FRONT);
        var pos = manager.getMouseGrid();
        var gridXY = manager.gridInd2XY(pos);
        if (manager.checkValidGridPos(gridXY.x, gridXY.y)) {
          var gridObj = manager.grid[GRID.MIDDLE][pos];
          if (gridObj.valid) {
            if (gridObj.object.type == OBJECT.METALBLOCK) {
              manager.screenize(gridXY.x, gridXY.y);
              this.active = false;
            }
          }
        }

      }
      this.holder.throwEvent = false;
    }

  }

  this.collisionAction = function (isHorizontal, velocity) {

  }

  this.draw = function (ctx) {

    this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, 0, this.xOffset / this.xScl, this.yOffset / this.yScl);
  }
}



function MetalBlock(x, y) {
  Box.call(this, x, y, manager.losWid, manager.losHei, sprites[SPR.METALBLOCK]);
  this.type = OBJECT.METALBLOCK;


  this.xScl = manager.losWid / this.sprite.width;
  this.yScl = manager.losHei / this.sprite.height;

  this.xOffset = this.xScl * this.sprite.width / 2;
  this.yOffset = this.yScl * this.sprite.height / 2;

  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.clickBox.setOffset(this.xOffset, this.yOffset);

  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.inPlace = false;

  this.depth = 5;


  this.physics = true;

  this.body = null;
  this.angle = 0;

  this.update = function (dt) {



    this.hovered = false;
    if (this.clickBox.isPointInside(input.mouseX, input.mouseY)) {
      this.hovered = true;
    }

    this.holder.getHold(this);
    this.holder.update(this);

    if (this.holder.throwEvent) {

      if (manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
        manager.inventory.attachObjectMouse(this);
      } else {
        if (!this.attached) {
          manager.attachObjectMouse(this, GRID.MIDDLE);
        }
      }
      this.holder.throwEvent = false;
    }

    if (this.attached && this.attachGridId != -1) {

      this.gravityOn = false;
      if (this.body != null) {
        this.desmaterializeBody();
      }

      if (this.hovered) {
        if (input.mouseState[2][1]) {
          var gridPos = manager.gridInd2XY(this.attachGridId);
          manager.screenize(gridPos.x, gridPos.y);
        }
      }



      var targetPos = manager.getPosGrid(this.attachGridId);

      //this.attachCooldownAlarm.update(dt);

      if (Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 5) {

        //if(this.attachCooldownAlarm.finished){
        if (!this.inPlace) {
          this.hspd = 0;
          this.vspd = 0;

          var pos = new Vector(this.x, this.y);
          var dist = targetPos.sub(pos).mag();
          var dir = targetPos.sub(pos).unit();
          if (dist < 1) {
            this.x = targetPos.x;
            this.y = targetPos.y;
            this.inPlace = true;

            manager.particles.push(particleConfetti(this.x, this.y));
            manager.particles.push(particleConfetti(this.x, this.y));
            manager.particles.push(particleConfetti(this.x, this.y));
            manager.particles.push(particleConfetti(this.x, this.y));


          } else {
            this.x += dir.x / 10;
            this.y += dir.y / 10;
          }
        }
        //}
      } else {
        this.inPlace = false;
        var pos = new Vector(this.x, this.y);
        var dist = targetPos.sub(pos).mag();
        var dir = targetPos.sub(pos).unit();

        var spd = Math.max((dist * dist) / 100000, 0.1);

        this.hspd += dir.x * spd * dt;
        this.vspd += dir.y * spd * dt;
      }
    } else {
      if (this.body == null) {
        this.materializeBody();
      }
    }

    this.parameterStep(dt);

    this.boundingBox.x = this.x;
    this.boundingBox.y = this.y;
    this.clickBox.updatePos(this.x, this.y);

    this.pushDrawList();

    //this.updateBox(dt);



    if (this.holder.holded) {
      if (this.body != null) {
        this.body.state.pos.x = this.x;
        this.body.state.pos.y = this.y;
        this.body.state.angular.pos = this.angle;
        this.body.sleep(false);
      }
    } else {
      if (this.body != null) {
        if (this.physics) {
          var posPhy = this.body.state.pos;
          this.x = posPhy.x;
          this.y = posPhy.y;

          this.angle = (this.body.state.angular.pos) % (Math.PI * 2);
        }
      }
    }
  }

  this.applyForce = function (force, point) {
    if (this.body != null) {
      this.body.sleep(false);
      this.body.applyForce(new Physics.vector(force.x, force.y), new Physics.vector(point.x, point.y));
    }
  }

  this.onDestroy = function () {
    this.desmaterializeBody();
    this.physics = false;
  }

  this.desmaterializeBody = function () {
    if (this.body != null) {
      manager.world.remove(this.body);
      this.body = null;
    }

  }

  this.materializeBody = function () {
    if (this.physics) {

      if (this.body != null) {
        manager.world.remove(this.body);
      }

      this.body = Physics.body('rectangle', {
        width: this.width
        , height: this.height
        , x: this.x
        , y: this.y
        , vx: this.hspd
        , vy: this.vspd
        , cof: 0.9
        , restitution: 0.6
      });

      manager.world.add(this.body);
    }
  }


  this.collisionAction = function (isHorizontal, velocity) {

  }

  this.draw = function () {
    this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, this.angle, this.xOffset / this.xScl, this.yOffset / this.yScl);
  }
}

function BlockPanel(x, y, blocksX, blocksY) {
  Box.call(this, x, y, blocksX * manager.losWid, blocksY * manager.losHei, sprites[SPR.SCREENBACKTILE]);
  this.type = OBJECT.PANEL;

  this.hTileNum = blocksX;
  this.vTileNum = blocksY;


  this.xScl = manager.losWid / this.sprite.width;
  this.yScl = manager.losHei / this.sprite.height;

  this.xOffset = 0;
  this.yOffset = 0;

  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.clickBox.setOffset(this.xOffset, this.yOffset);

  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.inPlace = false;

  this.depth = 10;

  this.hasCartridgeSlot = (this.hTileNum >= 3);

  this.usbSlots = [];

  if (this.vTileNum == 1) {
    this.usbSlots.push(new USBSlot(this, this.usbSlots.length, new Vector(0, 0), 2));
  }

  this.pushDrawList = function () {
    objectLists[OBJECT.DRAW].push(new DrawRequest(this, this.depth, 0));
    objectLists[OBJECT.DRAW].push(new DrawRequest(this, -15, 1));
  }


  this.update = function (dt) {

    this.depth = 5;

    if (this.attached && this.attachGridId != -1) {


      if(this.usbSlots.length > 0){
        var device = this.usbSlots[0].getOtherDevice();
        if(device){
          if(device.type == OBJECT.SCREEN){
            if(device.cartridge == NAME.BERNAD){
              var inputStates = [];
              var gridPos = manager.gridInd2XY(this.attachGridId);
              for(var i = 0; i < this.hTileNum; i++){
                if (!manager.checkValidGridPos(gridPos.x + i, gridPos.y)) {
                  inputStates.push([false,false,false]);
                  continue;

                }
            
                var gridObj = manager.grid[GRID.MIDDLE][manager.gridXY2Ind(gridPos.x + i, gridPos.y)];
                if(!gridObj.valid){
                  inputStates.push([false,false,false]);
                  continue;
                }
                if(gridObj.object.type != OBJECT.LOSANGO){
                  inputStates.push([false,false,false]);
                  continue;
                }
                var stt = [];
                stt.push(gridObj.object.pressState[0]);
                stt.push(gridObj.object.pressState[1]);
                stt.push(gridObj.object.pressState[2]);
                inputStates.push(stt);
              }


              manager.drMario.input(inputStates[0], inputStates[1],inputStates[2][0],inputStates[3][1]);
            }
          }
        }
      }


      this.depth = 10;
      this.gravityOn = false;

      var targetPos = manager.getPosGrid(this.attachGridId);
      targetPos.x -= manager.losWid / 2;
      targetPos.y -= manager.losHei / 2;

      //this.attachCooldownAlarm.update(dt);

      if (Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 5) {

        //if(this.attachCooldownAlarm.finished){
        if (!this.inPlace) {
          this.hspd = 0;
          this.vspd = 0;

          var pos = new Vector(this.x, this.y);
          var dist = targetPos.sub(pos).mag();
          var dir = targetPos.sub(pos).unit();
          if (dist < 1) {
            this.x = targetPos.x;
            this.y = targetPos.y;
            this.inPlace = true;

            manager.particles.push(particleConfetti(this.x, this.y));
            manager.particles.push(particleConfetti(this.x, this.y));
            manager.particles.push(particleConfetti(this.x, this.y));
            manager.particles.push(particleConfetti(this.x, this.y));


          } else {
            this.x += dir.x / 10;
            this.y += dir.y / 10;
          }
        }
        //}
      } else {
        this.inPlace = false;
        var pos = new Vector(this.x, this.y);
        var dist = targetPos.sub(pos).mag();
        var dir = targetPos.sub(pos).unit();

        var spd = Math.max((dist * dist) / 100000, 0.1);

        this.hspd += dir.x * spd * dt;
        this.vspd += dir.y * spd * dt;
      }
    } else {
      this.gravityOn = true;
    }

    this.updateBox(dt);

    if (this.holder.throwEvent) {
      if (manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
        manager.inventory.attachObjectMouse(this);
      } else {
        if (!this.attached) {
          manager.attachObjectMouse(this, GRID.BACK);
        }
      }
      this.holder.throwEvent = false;
    }
  }

  this.collisionAction = function (isHorizontal, velocity) {

  }

  this.drawRequest = function (ctx, parameter) {
    if (parameter == 0) {
      this.draw();
    } else {
      this.drawBorder();
    }
  }

  this.tileNumHelp = function (tile, tileMax, imgMin) {
    if (tile == 0) {
      return imgMin;
    } else if (tile == tileMax - 1) {
      return imgMin + 2;
    }

    return imgMin + 1;
  }

  this.tileNumHelpFull = function (tileX, tileY, tileXMax, tileYMax) {
    var img = 0;
    var rotation = 0;
    if (tileYMax == 1 && tileXMax == 1) {
      img = 12;
    } else if (tileXMax == 1) {
      rotation = Math.PI / 2;
      img = this.tileNumHelp(tileY, tileYMax, 9);
    } else if (tileYMax == 1) {
      img = this.tileNumHelp(tileX, tileXMax, 9);
    } else {
      if (tileY == 0) {
        img = this.tileNumHelp(tileX, tileXMax, 0);
      } else if (tileY == tileYMax - 1) {
        img = this.tileNumHelp(tileX, tileXMax, 6);
      } else {
        img = this.tileNumHelp(tileX, tileXMax, 3);
      }
    }

    return new Vector(img, rotation);
  }

  this.drawBorder = function () {

    for (var i = 0; i < this.vTileNum; i++) {
      for (var j = 0; j < this.hTileNum; j++) {
        var xx = this.x + j * manager.losWid;
        var yy = this.y + i * manager.losHei;
        var img = 0;
        var rotation = 0;

        var imgRot = this.tileNumHelpFull(j, i, this.hTileNum, this.vTileNum);

        rotation = imgRot.y;
        img = imgRot.x;


        sprites[SPR.SCREENFRAMETILE].drawExt(xx + 32 * this.xScl, yy + 32 * this.yScl, img, this.xScl, this.yScl, rotation, 32, 32);
      }
    }

    if (this.hasCartridgeSlot) {
      sprites[SPR.SCREENTILESLOT].drawExt(this.x + manager.losWid * 1.5, this.y, 0, this.xScl, this.yScl, 0, sprites[SPR.SCREENTILESLOT].width / 2, sprites[SPR.SCREENTILESLOT].height);
    }

    var directions = [
      new Vector(1, 0),
      new Vector(0, -1),
      new Vector(-1, 0),
      new Vector(0, 1)
    ];

    for (var i = 0; i < this.usbSlots.length; i++) {
      var dir = this.usbSlots[i].direction;
      var xx = this.usbSlots[i].slotPos.x * manager.losWid + this.x + manager.losWid * 0.5 + directions[dir].x * manager.losWid * 0.5;
      var yy = this.usbSlots[i].slotPos.y * manager.losHei + this.y + manager.losHei * 0.5 + directions[dir].y * manager.losHei * 0.5;;
      var ang = (dir + 2) * Math.PI / 2;
      sprites[SPR.SCREENUSBSLOT].drawExt(xx, yy, 0, this.xScl, this.yScl, ang, sprites[SPR.SCREENUSBSLOT].width, sprites[SPR.SCREENUSBSLOT].height / 2);
    }

  }


  this.draw = function () {
    for (var i = 0; i < this.vTileNum; i++) {
      for (var j = 0; j < this.hTileNum; j++) {
        var xx = this.x + j * manager.losWid;
        var yy = this.y + i * manager.losHei;
        var img = 0;
        var rotation = 0;

        var imgRot = this.tileNumHelpFull(j, i, this.hTileNum, this.vTileNum);

        rotation = imgRot.y;
        img = imgRot.x;


        sprites[SPR.SCREENBACKTILE].drawExt(xx + 32 * this.xScl, yy + 32 * this.yScl, img, this.xScl, this.yScl, rotation, 32, 32);
      }
    }
  }

}


function BlockScreen(x, y, blocksX, blocksY) {
  Box.call(this, x, y, blocksX * manager.losWid, blocksY * manager.losHei, sprites[SPR.SCREENBACKTILE]);
  this.type = OBJECT.SCREEN;

  this.hTileNum = blocksX;
  this.vTileNum = blocksY;


  this.xScl = manager.losWid / this.sprite.width;
  this.yScl = manager.losHei / this.sprite.height;

  this.xOffset = 0;
  this.yOffset = 0;

  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.clickBox.setOffset(this.xOffset, this.yOffset);

  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.inPlace = false;

  this.depth = 5;

  this.hasCartridgeSlot = (this.hTileNum >= 3);
  this.usbSlots = [];

  //if (this.vTileNum == 1) {
  this.usbSlots.push(new USBSlot(this, this.usbSlots.length, new Vector(0, 0), 2));
  //}

  // SCREEN VISUAL STUFF

  this.powerOn = false;

  this.cartridge = null;
  //this.lastCartridge = null;
  this.cartridgeUpdated = true;
  this.cartridgePos = new Vector(0, 0);


  this.checkCartridgeAlarm = new Alarm(0, 100);

  this.turnOnAlarm = new Alarm(0, 50, true);
  this.turnOffAlarm = new Alarm(0, 50, true);
  this.turningOnoff = false;

  this.attachCooldownAlarm = new Alarm(0,20);
  this.hoverPrecision = 0.05;


  // // Temporary DRMARIO
  // this.bottleWid = this.hTileNum*4;
  // this.bottleHei = this.vTileNum*4;

  this.pushDrawList = function () {
    objectLists[OBJECT.DRAW].push(new DrawRequest(this, this.depth, 0));
    objectLists[OBJECT.DRAW].push(new DrawRequest(this, this.depth, 1));
  }

  this.turnOn = function () {
    if (this.turningOnoff || this.powerOn) return;

    this.turnOnAlarm.start();
    this.turningOnoff = true;
  }

  this.turnOff = function () {
    if (this.turningOnoff || !this.powerOn) return;

    this.turnOffAlarm.start();
    this.turningOnoff = true;
  }

  this.setCartridge = function(newCartridge){
    this.cartridge = newCartridge;
    if (this.cartridge == NAME.BERNAD) {
      var bottleWid = this.hTileNum*4;
      var bottleHei = this.vTileNum*4;
      manager.startDrMario(this, bottleWid, bottleHei);
      console.log("Mario started");
    }
    this.turnOn();
  }

  this.fetchCartridge = function () {

    if (!this.attached) return;

    if (!this.hasCartridgeSlot) {
      return;
    }

    var cartridge = this.checkCartridge();

    if (this.turningOnoff) return;

    if (this.powerOn) {
      if (cartridge != this.cartridge) {
        this.turnOff();
      }
    } else {
      if (cartridge != null) {
        this.setCartridge(cartridge);
      }
    }

  }

  this.checkBubble = function () {
    var gridPos = manager.gridInd2XY(this.attachGridId);

    if (!manager.checkValidGridPos(gridPos.x + 1, gridPos.y - 1)) {
      return false;
    }

    var gridObj = manager.grid[GRID.MIDDLE][manager.gridXY2Ind(gridPos.x + 1, gridPos.y - 1)];

    if (!gridObj.valid) {
      return false;
    }
    return true;
  }

  this.checkCartridge = function () {
    if (!this.attached) return null;

    var gridPos = manager.gridInd2XY(this.attachGridId);

    if (!manager.checkValidGridPos(gridPos.x + 1, gridPos.y - 1)) {
      return null;
    }

    var gridObj = manager.grid[GRID.MIDDLE][manager.gridXY2Ind(gridPos.x + 1, gridPos.y - 1)];

    if (!gridObj.valid) {
      return null;
    }

    if (gridObj.object.type != OBJECT.LOSANGO) {
      return null;
    }

    return gridObj.object.id;
  }


  this.update = function (dt) {

    this.depth = 5;

    this.checkCartridgeAlarm.update(dt);

    if (this.checkCartridgeAlarm.finished) {
      if (!this.attached) {
        if (this.powerOn) {
          this.turnOff();
        }
      } else {
        this.fetchCartridge();
      }
      this.checkCartridgeAlarm.start();
    }

    if (this.powerOn) {
      this.turnOffAlarm.update(dt);

      if (this.turnOffAlarm.finished) {
        this.powerOn = false;
        this.turningOnoff = false;
        this.turnOffAlarm.stop();

        var cartridge = this.checkCartridge();
        if (cartridge != null) {
          this.setCartridge(cartridge);
        }
      }
    } else {

      this.turnOnAlarm.update(dt);

      if (this.turnOnAlarm.finished) {
        this.powerOn = true;
        this.turningOnoff = false;
        this.turnOnAlarm.stop();
      }
    }

    if (this.attached && this.attachGridId != -1) {

      this.depth = -5;

      this.gravityOn = false;

      var targetPos = manager.getPosGrid(this.attachGridId);
      targetPos.x -= manager.losWid / 2;
      targetPos.y -= manager.losHei / 2;

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

        this.hspd += (dir.x*5 - this.hspd)*this.hoverPrecision  + (1-this.hoverPrecision)*dir.x*spd*dt;
        this.vspd += (dir.y*5 - this.vspd)*this.hoverPrecision  + (1-this.hoverPrecision)*dir.y*spd*dt;
      }
    } else {
      this.gravityOn = true;
    }

    this.updateBox(dt);

    if (this.holder.throwEvent) {
      if (manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
        manager.inventory.attachObjectMouse(this);
      } else {
        if (!this.attached) {
          manager.attachObjectMouse(this, GRID.MIDDLE);
        }
      }
      this.holder.throwEvent = false;
    }

  }

  this.collisionAction = function (isHorizontal, velocity) {

  }

  this.drawRequest = function (ctx, parameter) {
    if (parameter == 0) {
      this.draw();
    } else {
      this.drawBorder();
    }
  }

  this.tileNumHelp = function (tile, tileMax, imgMin) {
    if (tile == 0) {
      return imgMin;
    } else if (tile == tileMax - 1) {
      return imgMin + 2;
    }

    return imgMin + 1;
  }


  this.tileNumHelpFull = function (tileX, tileY, tileXMax, tileYMax) {
    var img = 0;
    var rotation = 0;
    if (tileYMax == 1 && tileXMax == 1) {
      img = 12;
    } else if (tileXMax == 1) {
      rotation = Math.PI / 2;
      img = this.tileNumHelp(tileY, tileYMax, 9);
    } else if (tileYMax == 1) {
      img = this.tileNumHelp(tileX, tileXMax, 9);
    } else {
      if (tileY == 0) {
        img = this.tileNumHelp(tileX, tileXMax, 0);
      } else if (tileY == tileYMax - 1) {
        img = this.tileNumHelp(tileX, tileXMax, 6);
      } else {
        img = this.tileNumHelp(tileX, tileXMax, 3);
      }
    }

    return new Vector(img, rotation);
  }
  this.drawBorder = function () {

    for (var i = 0; i < this.vTileNum; i++) {
      for (var j = 0; j < this.hTileNum; j++) {
        var xx = this.x + j * manager.losWid;
        var yy = this.y + i * manager.losHei;

        var img = 0;
        var rotation = 0;

        var imgRot = this.tileNumHelpFull(j, i, this.hTileNum, this.vTileNum);

        rotation = imgRot.y;
        img = imgRot.x;


        sprites[SPR.SCREENFRAMETILE].drawExt(xx + 32 * this.xScl, yy + 32 * this.yScl, img, this.xScl, this.yScl, rotation, 32, 32);
      }
    }

    if (this.hasCartridgeSlot) {
      sprites[SPR.SCREENTILESLOT].drawExt(this.x + manager.losWid * 1.5, this.y, 0, this.xScl, this.yScl, 0, sprites[SPR.SCREENTILESLOT].width / 2, sprites[SPR.SCREENTILESLOT].height);
    }

    var directions = [
      new Vector(1, 0),
      new Vector(0, -1),
      new Vector(-1, 0),
      new Vector(0, 1)
    ];

    for (var i = 0; i < this.usbSlots.length; i++) {
      var dir = this.usbSlots[i].direction;
      var xx = this.usbSlots[i].slotPos.x * manager.losWid + this.x + manager.losWid * 0.5 + directions[dir].x * manager.losWid * 0.5;
      var yy = this.usbSlots[i].slotPos.y * manager.losHei + this.y + manager.losHei * 0.5 + directions[dir].y * manager.losHei * 0.5;;
      var ang = (dir + 2) * Math.PI / 2;
      sprites[SPR.SCREENUSBSLOT].drawExt(xx, yy, 0, this.xScl, this.yScl, ang, sprites[SPR.SCREENUSBSLOT].width, sprites[SPR.SCREENUSBSLOT].height / 2);
    }



  }

  this.draw = function () {


    if (this.cartridge != null) {
      if (this.checkBubble()) {
        sprites[SPR.BUBBLE].drawExt(this.cartridgePos.x, this.cartridgePos.y, 0, this.xScl * 1.2, this.yScl * 1.2, 0, 32, 32);
      }
    }

    for (var i = 0; i < this.vTileNum; i++) {
      for (var j = 0; j < this.hTileNum; j++) {
        var xx = this.x + j * manager.losWid;
        var yy = this.y + i * manager.losHei;

        var img = 0;
        var rotation = 0;

        var imgRot = this.tileNumHelpFull(j, i, this.hTileNum, this.vTileNum);

        rotation = imgRot.y;
        img = imgRot.x;


        sprites[SPR.SCREENBACKTILE].drawExt(xx + 32 * this.xScl, yy + 32 * this.yScl, img, this.xScl, this.yScl, rotation, 32, 32);
      }
    }




    if (this.cartridge != null) {

      if (this.attachGridId != -1) {
        this.cartridgePos = manager.getPosGrid(this.attachGridId - manager.cols + 1);
      }



      var powerPerc = (this.powerOn ? (1 - this.turnOffAlarm.percentage()) : this.turnOnAlarm.percentage());

      var clipVPerc = tweenIn(0.01 + (clamp(powerPerc, 0.75, 1) - 0.75) * (0.99 / 0.25));
      var clipHPerc = powerPerc;
      var clipWid = this.width - 10 * this.xScl;
      var clipHei = this.height - 10 * this.yScl;
      var clipX = this.x + 5 * this.xScl + (clipWid * (1 - clipHPerc)) / 2;
      var clipY = this.y + 5 * this.yScl + (clipHei * (1 - clipVPerc)) / 2;

      var xx = this.x + this.width / 2;
      var yy = this.y + this.height / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(clipX, clipY, clipWid * clipHPerc, clipHei * clipVPerc);
      ctx.clip();


      ContentDisplayer.draw(this.cartridge, this.x, this.y, this.width, this.height, ctx);
      ctx.restore();
    }
  }
}

class ContentDisplayer{
  static draw(contentId, x,y, wid, hei, ctx){
    var xx = x + wid/2;
    var yy = y + hei/2;

    
    var xScl = manager.losWid / sprites[SPR.SCREENFRAMETILE].width;
    var yScl = manager.losHei / sprites[SPR.SCREENFRAMETILE].height;

    switch (contentId) {
      case NAME.HENRIQUE:
        sprites[SPR.BANNERS].drawExtRelative(xx, yy, 0, xScl, yScl, 0, 0.5, 0.5);
        break;
      case NAME.SAMUEL:
        sprites[SPR.BANNERS].drawExtRelative(xx, yy, 1, xScl, yScl, 0, 0.5, 0.5);
        break;
      case NAME.JOAS:
        sprites[SPR.BANNERS].drawExtRelative(xx, yy, 2, xScl, yScl, 0, 0.5, 0.5);
        manager.bitcoinGraph.drawGraph(ctx, x, y, wid, hei);
        break;
      case NAME.NILTON:
        sprites[SPR.BANNERS].drawExtRelative(xx, yy, 3, xScl, yScl, 0, 0.5, 0.5);
        break;
      case NAME.FSANCHEZ:
        sprites[SPR.BANNERS].drawExtRelative(xx, yy, 4, xScl, yScl, 0, 0.5, 0.5);
        break;
      case NAME.NATHALIA:
        sprites[SPR.BANNERS].drawExtRelative(xx, yy, 5, xScl, yScl, 0, 0.5, 0.5);
        break;
      case NAME.DANILO:
        sprites[SPR.BANNERS].drawExtRelative(xx, yy, 6, xScl, yScl, 0, 0.5, 0.5);
        break;
      case NAME.MARLUS:
        sprites[SPR.BANNERS].drawExtRelative(xx, yy, 7, xScl, yScl, 0, 0.5, 0.5);
        break;
      case NAME.LAIS:
        sprites[SPR.BANNERS].drawExtRelative(xx, yy, 8, xScl, yScl, 0, 0.5, 0.5);
        break;
      case NAME.MATHEUS:
        sprites[SPR.BANNERS].drawExtRelative(xx, yy, 9, xScl, yScl, 0, 0.5, 0.5);
        break;
      case NAME.BERNAD:
        manager.drMario.draw(x, y, wid, hei);
        break;
    }
  }
}


function MedLogo(x, y) {
  Box.call(this, x, y, manager.losWid * 4, manager.losHei * 2, sprites[SPR.MIDMEDLOGO]);
  this.type = OBJECT.MIDMEDLOGO;


  this.xScl = 4 * manager.losWid / this.sprite.width;
  this.yScl = 2 * manager.losHei / this.sprite.height;

  this.xOffset = 0;
  this.yOffset = 0;

  this.boundingBox.setOffset(this.xOffset, this.yOffset);
  this.clickBox.setOffset(this.xOffset, this.yOffset);

  this.hLoss = 0.4;
  this.vLoss = 0.4;

  this.inPlace = false;
  this.canBeHeld = false;

  this.depth = 10;

  this.breaking = false;
  this.breakAlarm = new Alarm(0, 2);

  this.break = function () {
    this.breaking = true;
    this.breakAlarm.start();
    manager.particles.push(particleLogo(this.x, this.y));
  }

  this.update = function (dt) {

    if (this.breaking) {
      this.breakAlarm.update(dt);

      if (this.breakAlarm.finished) {
        this.active = false;
      }
    }




    if (this.attached && this.attachGridId != -1) {
      this.gravityOn = false;

      var targetPos = manager.getPosGrid(this.attachGridId);
      targetPos.x -= manager.losWid / 2;
      targetPos.y -= manager.losHei / 2;

      //this.attachCooldownAlarm.update(dt);

      if (Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 5) {

        //if(this.attachCooldownAlarm.finished){
        if (!this.inPlace) {
          this.hspd = 0;
          this.vspd = 0;

          var pos = new Vector(this.x, this.y);
          var dist = targetPos.sub(pos).mag();
          var dir = targetPos.sub(pos).unit();
          if (dist < 1) {
            this.x = targetPos.x;
            this.y = targetPos.y;
            this.inPlace = true;

            manager.particles.push(particleConfetti(this.x, this.y));
            manager.particles.push(particleConfetti(this.x, this.y));
            manager.particles.push(particleConfetti(this.x, this.y));
            manager.particles.push(particleConfetti(this.x, this.y));


          } else {
            this.x += dir.x / 10;
            this.y += dir.y / 10;
          }
        }
        //}
      } else {
        this.inPlace = false;
        var pos = new Vector(this.x, this.y);
        var dist = targetPos.sub(pos).mag();
        var dir = targetPos.sub(pos).unit();

        var spd = Math.max((dist * dist) / 100000, 0.1);

        this.hspd += dir.x * spd * dt;
        this.vspd += dir.y * spd * dt;
      }
    } else {
      this.gravityOn = true;
    }

    this.updateBox(dt);

    if (this.hovered && input.mouseState[0][1]) {
      manager.clickParticle();
      var ind = choose([SND.METALHIT1, SND.METALHIT2, SND.METALHIT3]);
      playSound(ind);
    }


    if (this.holder.throwEvent) {
      manager.attachObjectMouse(this, GRID.MIDDLE);
      this.holder.throwEvent = false;
    }

  }

  this.collisionAction = function (isHorizontal, velocity) {

  }

  this.show = function () {
    this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, 0, this.xOffset / this.xScl, this.yOffset / this.yScl);
  }

}

function SeedModule(seedType){
  this.type = seedType;


  this.tryPlant = function(seedObj){
    for(var i = 0 ;i  < objectLists[OBJECT.FLOWERPOT].length; i++){
      var pot = objectLists[OBJECT.FLOWERPOT][i];
      if(pot.boundingBox.checkCollision(seedObj.boundingBox)){
        if(!pot.hasPlant){
          pot.plant = this.type;
          pot.hasPlant = true;
          pot.plantStage = 0;
          return true;
          break;
        }
      }
    }
    return false;
  }
}

function Seed(x, y, seedType){
  Box.call(this, x, y, 60, 60, sprites[SPR.SEEDS]);
  this.type = OBJECT.SEED;

  this.seed = new SeedModule(seedType);
  // this.variation = 0;
  // this.hasPlant = false;
  // this.plant = 0;
  // this.plantStage = 0;

  this.hLoss = 0.2;
  this.vLoss = 0.2;

  this.rotateOnCollision = true;

  //this.tickAlarm = new Alarm(0, 100);
  this.wobbleAlarm = new Alarm(0, 100);

  this.scale2FitSprite();

  this.boundingBox.setOffset(this.width/2, this.height/2);
  this.clickBox.setOffset(this.width/2, this.height/2);
  
  this.update = function(dt){
    this.updateBox(dt);

    this.wobbleAlarm.update(dt);
    if(this.wobbleAlarm.finished){
      this.wobbleAlarm.restart();
    }

    if(this.holder.holded){
      this.ang = Math.PI/12*tweenInOut(zigzag(this.wobbleAlarm.percentage())) - Math.PI/24;
    }

    if (this.holder.throwEvent) {
      if (manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
        manager.inventory.attachObjectMouse(this);
      } else {
        if(this.seed.tryPlant(this)){
          this.active = false;
        }
      }
      this.holder.throwEvent = false;
    }
  }

  this.draw = function(ctx){

    this.sprite.drawExtRelative(this.x, this.y, this.seed.type, this.xScl,this.yScl, this.ang, 0.5, 0.5);
  }
}

function FlowerPot(x, y){
  Box.call(this, x, y, 100, 100, sprites[SPR.FLOWERPOT]);
  this.type = OBJECT.FLOWERPOT;
  this.variation = 0;
  this.hasPlant = false;
  this.plant = 0;
  this.plantStage = 0;

  this.hLoss = 0.2;
  this.vLoss = 0.2;

  this.linDamp = 0.95;

  this.tickAlarm = new Alarm(0, 100);
  this.wobbleAlarm = new Alarm(0, 100);

  this.scale2FitSprite();

  this.boundingBox.setOffset(this.width/2, 0);
  this.clickBox.setOffset(this.width/2, 0);
  
  this.update = function(dt){


    if (this.onGround) {
      this.linDamp = 0.95;
    } else {
      this.linDamp = 1;
    }

    this.updateBox(dt);

    this.wobbleAlarm.update(dt);
    if(this.wobbleAlarm.finished){
      this.wobbleAlarm.restart();
    }

    if(this.holder.holded){
      this.ang = Math.PI/12*tweenInOut(zigzag(this.wobbleAlarm.percentage())) - Math.PI/24;
    } else {
      this.ang = 0;
    }

    this.tickAlarm.update(dt);
    if(this.tickAlarm.finished){
      this.tickAlarm.restart();

      if(chance(0.5)){
        if(this.hasPlant){
          if(this.plantStage < 3){
            this.plantStage++;
          }
        }
      }
    }

    if (this.holder.throwEvent) {
      if (manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
        manager.inventory.attachObjectMouse(this);
      }
      this.holder.throwEvent = false;
    }
  }

  this.draw = function(ctx){

    this.sprite.drawExtRelative(this.x, this.y, this.variation, this.xScl,this.yScl, this.ang, 0.5, 0);
    if(this.hasPlant){
      sprites[SPR.PLANTS].drawExt(this.x, this.y, this.plant*4 + this.plantStage,this.xScl,this.yScl, this.ang, 16, 45);
    }
  }
}





function CurtainObject(x, y) {
  Box.call(this, x, y, 10, 10, sprites[SPR.CABLE]);
  this.clothObj = new ClothObject(x, y, 20, 5, 45, 180);
  this.depth = -10;

  this.eyeletDensity = 8;
  this.eyeletNum = 0;
  this.eyeletSpacing = 6;
  this.pointNumber = this.clothObj.cloth.hSegments + 1;
  this.pointMiddle = (this.pointNumber) / 2;

  this.eyelet = [];
  var ind = 0;

  var finish = false;
  var odd = (this.pointMiddle != Math.floor(this.pointMiddle)) ? true : false;

  var eyeletsIndex = [];

  while (!finish) {

    if (ind <= this.pointMiddle) {
      eyeletsIndex.push(ind);

    } else if (ind < this.pointNumber && eyeletsIndex.length == 0) {
      if (odd) {
        eyeletsIndex.push(Math.floor(this.pointMiddle));
      }
      break;
    } else {
      break;
    }
    ind += this.eyeletSpacing;
  }

  var startInd = 0 + (odd) ? 1 : 0;
  var startLen = eyeletsIndex.length;
  for (var i = startInd; i < startLen; i++) {
    var invInd = startLen - i - 1;
    eyeletsIndex.push(this.pointNumber - 1 - eyeletsIndex[invInd]);
  }

  console.log(eyeletsIndex);

  for (var i = 0; i < eyeletsIndex.length; i++) {
    var ind = eyeletsIndex[i];
    var wid = this.clothObj.cloth.segmentHLength;
    var xx = this.clothObj.cloth.points[0][ind].pos.x;
    this.eyelet.push(new Vector(wid * ind, ind));
    //this.eyelet.push(new Vector(xx, ind));
  }

  this.eyeletNum = this.eyelet.length;


  // [1, 1]
  // [1, 0, 1]
  // [1, 0, 0, 1]
  // [1, 0, 0, 0, 1]
  // [1, 0, 0, 0, 0, 1]
  // [1, 0, 0, 0, 0, 0, 1]

  // [1, 0, 1, *0, 1, 0, 1] Dens 2
  // [1, 0, 0, *1, 0, 0, 1] Dens 3
  // [1, 0, 0, *1, 0, 0, 1] Dens 4 -> Dens3
  // [1, 0, 0, *1, 0, 0, 1] Dens 5 -> Dens3
  // [1, 0, 0, *0, 0, 0, 1] Dens 6 -> Dens6

  // [1, 0, 1, 0 | 0, 1, 0, 1] Dens 2
  // [1, 0, 0, 1 | 1, 0, 0, 1] Dens 3
  // [1, 0, 0, 0 | 0, 0, 0, 1] Dens 4 -> Dens3
  // [1, 0, 0, 0 | 0, 0, 0, 1] Dens 5 -> Dens3
  // [1, 0, 0, 0 | 0, 0, 0, 1] Dens 6 -> Dens6

  // [1, 0, 1, 0, *1, 0, 1, 0, 1] Dens 2
  // [1, 0, 0, 1, *0, 1, 0, 0, 1] Dens 3
  // [1, 0, 0, 0, *1, 0, 0, 0, 1] Dens 4 -> Dens3
  // [1, 0, 0, 0, *1, 0, 0, 0, 1] Dens 5 -> Dens3
  // [1, 0, 0, 0, *1, 0, 0, 0, 1] Dens 6 -> Dens6



  this.gravityOn = false;
  this.gravity.y = 0;

  this.type = OBJECT.CURTAIN;

  this.draw = function (ctx) {
    this.clothObj.draw(ctx);
  }

  this.update = function (dt) {
    var cloth = this.clothObj.cloth;
    for (var i = 0; i < this.eyeletNum; i++) {
      cloth.points[0][this.eyelet[i].y].pos.x = this.x + this.eyelet[i].x;
      cloth.points[0][this.eyelet[i].y].pos.y = this.y;
    }

    this.parameterStep(dt);

    this.clothObj.update(dt);
  }

  this.compressEyelets = function (amount, rightSide) {
    for (var i = 0; i < this.eyeletNum; i++) {
      if (rightSide) {
        this.eyelet[i].x -= i * (amount / this.eyeletNum);
      } else {
        this.eyelet[i].x += (this.eyeletNum - i - 1) * (amount / this.eyeletNum);
      }
    }
  }
}

function ClothObject(x, y, segH, segV, segLenH, segLenV) {
  Box.call(this, x, y, 10, 10, sprites[SPR.CABLE]);
  this.cloth = new ClothBody(x, y, segH, segV, segLenH, segLenV);

  this.depth = -10;


  this.type = OBJECT.CLOTH;


  this.draw = function (ctx) {
    var sclH = this.cloth.segmentHLength / this.sprite.height;
    var sclV = this.cloth.segmentVLength / this.sprite.height;

    for (var i = 0; i < this.cloth.vSegments + 1; i++) {
      for (var j = 0; j < this.cloth.hSegments + 1; j++) {
        var point1 = this.cloth.points[i][j].pos;

        if (i != 0) {

          var point2 = this.cloth.points[i - 1][j].pos;
          var ppos = point1.add(point2);
          ppos.x /= 2;
          ppos.y /= 2;
          var dif = point1.sub(point2);
          var segAngle = dif.angle() - Math.PI;

          dist = distance(dif.x, dif.y);
          ctx.save();
          ctx.translate(ppos.x, ppos.y);
          ctx.rotate(segAngle + deg2rad(90));


          ctx.fillStyle = "rgb(100, 100, 100)";
          var wid = this.cloth.segmentHLength * 1.1;
          var hei = this.cloth.segmentVLength * 1.1;

          ctx.fillRect(-wid / 2, -hei / 2, wid, hei);
          ctx.restore();
          //this.sprite.drawExtRelative(ppos.x, ppos.y, 0, sclV,sclV, segAngle, 0.5, 0.5);
        }

      }
    }

    for (var i = 0; i < this.cloth.vSegments + 1; i++) {
      for (var j = 0; j < this.cloth.hSegments + 1; j++) {
        var point1 = this.cloth.points[i][j].pos;

        if (i != 0) {

          var point2 = this.cloth.points[i - 1][j].pos;
          var ppos = point1.add(point2);
          ppos.x /= 2;
          ppos.y /= 2;
          var dif = point1.sub(point2);
          var segAngle = dif.angle() - Math.PI;

          dist = distance(dif.x, dif.y);
          ctx.save();
          ctx.translate(ppos.x, ppos.y);
          ctx.rotate(segAngle + deg2rad(90));


          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";

          var wid = this.cloth.segmentHLength * 1.1;
          var hei = this.cloth.segmentVLength * 1.1;

          ctx.fillRect(-wid / 2, -hei / 2, wid, hei);
          ctx.restore();
          //this.sprite.drawExtRelative(ppos.x, ppos.y, 0, sclV,sclV, segAngle, 0.5, 0.5);
        }

      }
    }


  }

  this.update = function (dt) {

    this.cloth.applyForce(new Vector(0, 0.2));
    this.cloth.update(dt);

    this.pushDrawList();
  }
}

function RopeObject(x, y, segments, segmentLen) {
  Box.call(this, x, y, 10, 10, sprites[SPR.CABLE]);
  this.rope = new RopeBody(x, y, segments, segmentLen);
  this.ropeImgSegment = [];

  this.ropeImgType = 2;
  this.depth = -10;

  this.type = OBJECT.ROPE;

  this.init = function (segmentNum, openBegin, openEnd, randomizeMiddle) {
    this.ropeImgSegment = [];
    for (var i = 0; i < segmentNum; i++) {
      var imageNum = 1;
      if (randomizeMiddle) {
        imageNum = choose([1, 4, 5, 6]);
      }
      if (i == 0) {
        imageNum = 0;
        if (!openBegin) {
          imageNum = 3;
        }
      }
      else if (i == segmentNum - 1) {
        imageNum = 2;
        if (!openEnd) {
          imageNum = 7;
        }
      }


      this.ropeImgSegment.push(imageNum);
    }

  }

  this.init(segments, true, true, true);

  this.draw = function (ctx) {
    var scl = this.rope.segmentLength / this.sprite.height;

    for (var i = 1; i < this.rope.points.length; i++) {

      var imageNum = this.ropeImgSegment[i - 1];

      var point1 = this.rope.points[i - 1].pos;
      var point2 = this.rope.points[i].pos;

      var ppos = point1.add(point2);
      ppos.x /= 2;
      ppos.y /= 2;
      var dif = point1.sub(point2);
      var segAngle = dif.angle() - Math.PI;
      this.sprite.drawExtRelative(ppos.x, ppos.y, imageNum + this.ropeImgType * this.sprite.imgNumX, scl, scl, segAngle, 0.5, 0.5);
    }
  }

  this.update = function (dt) {

    this.rope.applyForce(new Vector(0, 0.2));
    this.rope.update(dt);

    this.pushDrawList();
  }
}


class USBSlot {
  constructor(device, slotId, slotPos, direction) {
    this.device = device;
    this.connector = null;

    this.slotId = slotId;
    this.slotPos = slotPos;
    this.direction = direction;
  }

  getOtherDevice(){
    if(!this.connector) return null;
    if(!this.connector.cable) return null;

    var oConnector = this.connector.getOtherConnector();
    if(!oConnector) return null;

    if(!oConnector.connection.connected) return null;

    return oConnector.connection.usbSlot.device;
  }
}

class USBConnection {
  constructor() {
    this.usbSlot = null;
    this.connected = false;
  }
}


function USBConnector(idCable, x, y, cable) {

  Box.call(this, x, y, 50, 50, sprites[SPR.USBCONNECTOR]);

  this.type = OBJECT.USBCONNECTOR;
  this.physics = true;

  this.body = null;
  this.xScl = this.width / this.sprite.width;
  this.yScl = this.height / this.sprite.height;
  this.xOffset = 0;
  this.yOffset = this.yScl * this.sprite.height / 2;
  this.angle = 0;
  
  this.idCable = idCable;

  this.connection = new USBConnection();
  this.cable = cable;

  this.depth = objectsDepth.usbConnector;

  this.draw = function (ctx) {


    this.sprite.drawExt(this.x, this.y, 0, this.xScl, this.yScl, this.angle, this.xOffset / this.xScl, this.yOffset / this.yScl);
  }

  this.getOtherConnector = function(){
    if(this.cable != null){
      if(this.cable.box1.idCable != this.idCable) {
        return this.cable.box1;
      } else {
        return this.cable.box2;
      }
    }
    return null;
  }

  this.update = function (dt) {

    if (this.physics) {
      if (this.body == null) {
        this.materializeBody();
      }
    }

    this.hovered = false;
    if (this.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
      this.hovered = true;
    }

    if (!this.connection.connected) {
      this.holder.getHold(this);
      this.holder.update(this);

      if (this.holder.throwEvent) {
        for (var i = 0; i < objectLists[OBJECT.SCREEN].length; i++) {
          var panel = objectLists[OBJECT.SCREEN][i];
          if (panel.boundingBox.checkCollision(this.boundingBox)) {
            var panelGridX = Math.floor((input.mouseX - panel.x) / panel.width);
            var panelGridY = Math.floor((input.mouseY - panel.y) / panel.height);
            for (var j = 0; j < panel.usbSlots.length; j++) {
              if (panel.usbSlots[j].connector != null) continue;
              if (panel.usbSlots[j].slotPos.x != panelGridX) continue;
              if (panel.usbSlots[j].slotPos.y != panelGridY) continue;

              if (this.connection.connected) {
                if (this.connection.usbSlot != null) {
                  this.connection.usbSlot.disconnect();
                }
              }

              panel.usbSlots[j].connector = this;
              this.connection.connected = true;
              this.connection.usbSlot = panel.usbSlots[j];

              this.onDestroy();
              break;
            }
            if (this.connection.connected) {
              break;
            }
          }
        }

        for (var i = 0; i < objectLists[OBJECT.PANEL].length; i++) {
          var panel = objectLists[OBJECT.PANEL][i];
          if (panel.boundingBox.checkCollision(this.boundingBox)) {
            var panelGridX = Math.floor((input.mouseX - panel.x) / panel.width);
            var panelGridY = Math.floor((input.mouseY - panel.y) / panel.height);
            for (var j = 0; j < panel.usbSlots.length; j++) {
              if (panel.usbSlots[j].connector != null) continue;
              if (panel.usbSlots[j].slotPos.x != panelGridX) continue;
              if (panel.usbSlots[j].slotPos.y != panelGridY) continue;

              if (this.connection.connected) {
                if (this.connection.usbSlot != null) {
                  this.connection.usbSlot.disconnect();
                }
              }

              panel.usbSlots[j].connector = this;
              this.connection.connected = true;
              this.connection.usbSlot = panel.usbSlots[j];

              this.onDestroy();
              break;
            }
            if (this.connection.connected) {
              break;
            }
          }
        }

        if (manager.mouseGrid != -1) {
          var gridObj = manager.grid[GRID.MIDDLE][manager.mouseGrid];
          if (gridObj.valid) {
            if (gridObj.object.type == OBJECT.LOSANGO) {
              if (gridObj.object.connector) {
                if (gridObj.object.usbSlot.connector == null) {
                  if (this.connection.connected) {
                    if (this.connection.usbSlot != null) {
                      this.connection.usbSlot.disconnect();
                    }
                  }

                  gridObj.object.usbSlot.connector = this;
                  this.connection.connected = true;
                  this.connection.usbSlot = gridObj.object.usbSlot;

                  this.onDestroy();
                }
              }
            }
          }
        }



        if (manager.inventory.boundingBox.isPointInside(input.mouseX, input.mouseY)) {
          if (this.cable == null) {
            manager.inventory.attachObjectMouse(this);
          } else {
            this.cable.enterInventory();
          }
        }

        this.holder.throwEvent = false;
      }
    } else {
      var device = this.connection.usbSlot.device;

      if (device.type == OBJECT.LOSANGO) {
        this.angle = device.connectorAng;
        this.x = device.connectorPos.x - this.width * Math.cos(this.angle);
        this.y = device.connectorPos.y - this.width * Math.sin(this.angle);

      } else {
        var usbPos = this.connection.usbSlot.slotPos;
        var dir = this.connection.usbSlot.direction;

        var directions = [
          new Vector(1, 0),
          new Vector(0, -1),
          new Vector(-1, 0),
          new Vector(0, 1)
        ];

        this.x = device.x + usbPos.x * manager.losWid + manager.losWid * 0.5 + directions[dir].x * manager.losWid * 0.9;
        this.y = device.y + usbPos.y * manager.losHei + manager.losHei * 0.5 + directions[dir].y * manager.losHei * 0.9;
        this.angle = (Math.PI / 2) * (dir + 2);
      }


    }

    this.boundingBox.x = this.x + Math.cos(this.angle) * this.width / 2 - this.width / 2;
    this.boundingBox.y = this.y + Math.sin(this.angle) * this.width / 2 - this.height / 2;

    this.pushDrawList();

    //this.updateBox(dt);



    if (this.holder.holded) {
      if (this.body != null) {
        this.body.state.pos.x = this.x + Math.cos(this.angle) * this.width / 2;
        this.body.state.pos.y = this.y + Math.sin(this.angle) * this.width / 2;
        this.body.state.angular.pos = this.angle;
        this.body.sleep(false);
      }
    } else {
      if (this.body != null) {
        if (this.physics) {
          var posPhy = this.body.state.pos;
          this.x = posPhy.x - (this.width / 2) * Math.cos(this.angle);
          this.y = posPhy.y - (this.width / 2) * Math.sin(this.angle);

          this.angle = (this.body.state.angular.pos) % (Math.PI * 2);
        }
      }
    }
  }

  this.applyForce = function (force, point) {
    if (this.body != null) {
      this.body.sleep(false);
      this.body.applyForce(new Physics.vector(force.x, force.y), new Physics.vector(point.x, point.y));
    }
  }

  this.onDestroy = function () {
    if (this.body != null) {
      manager.world.remove(this.body);
      this.body = null;
    }
    this.physics = false;
  }

  this.materializeBody = function () {
    if (this.physics) {

      if (this.body != null) {
        manager.world.remove(this.body);
      }

      this.body = Physics.body('rectangle', {
        width: this.width
        , height: this.height
        , x: this.x
        , y: this.y
        , vx: this.hspd
        , vy: this.vspd
        , cof: 0.9
        , restitution: 0.6
      });

      manager.world.add(this.body);
    }
  }
}

function USBCable(x, y, segments, segmentLen) {

  Box.call(this, x, y, 10, 10, sprites[SPR.CABLE]);

  this.type = OBJECT.USBCABLE;

  this.box1 = new USBConnector(0, x, y, this);
  this.box2 = new USBConnector(1, x + 100, y, this);

  this.rope = new RopeObject(x, y, 10, 50);
  this.rope.ropeImgType = 0;





  this.depth = objectsDepth.usbCable;

  this.onDestroy = function () {
    this.box1.onDestroy();
    this.box2.onDestroy();
  }

  this.onRespawn = function () {
    this.box1.physics = true;
    this.box2.physics = true;
  }

  this.enterInventory = function () {
    if (this.attached) return;
    if (this.box1.connection.connected) return;
    if (this.box2.connection.connected) return;

    manager.inventory.attachObjectMouse(this);
  }




  this.draw = function (ctx) {

    //console.log("Ctx DrawUSBCABle " + ctx);


    var scl = this.rope.rope.segmentLength / this.sprite.height;

    var boxes = [this.box1, this.box2];
    var ropeExt = [0, this.rope.rope.points.length - 1];
    var ropeInt = [1, this.rope.rope.points.length - 2];

    var subCableColors = ["rgb(150, 0, 0)", "rgb(0,150,0)", "rgb(0,0,150)"];

    for (var i = 0; i < 2; i++) {

      var ropeExtPos = this.rope.rope.points[ropeExt[i]].pos.getCopy();
      var ropeIntPos = this.rope.rope.points[ropeInt[i]].pos.getCopy();

      var boxPos = new Vector(boxes[i].x, boxes[i].y);

      var boxSurfVec = (new Vector(0, 0));
      boxSurfVec.setAngle(boxes[i].angle + Math.PI / 2);

      var ropeVecDiff = ropeExtPos.sub(ropeIntPos);
      var ropeSurfAng = Math.atan2(ropeVecDiff.y, ropeVecDiff.x);
      var ropeSurfVec = (new Vector(0, 0))
      ropeSurfVec.setAngle(ropeSurfAng + Math.PI / 2);


      for (var j = -1; j < 2; j++) {


        var spacing = 10;
        var startPoint = boxPos.add(boxSurfVec.mult(j * spacing));
        var endPoint = ropeExtPos.add(ropeSurfVec.mult(j * spacing));

        var diffVec = startPoint.sub(endPoint);
        var diffAngle = Math.atan2(diffVec.y, diffVec.x);
        var diffDist = diffVec.mag();

        ctx.save();
        ctx.translate(startPoint.x, startPoint.y);
        ctx.rotate(diffAngle);
        ctx.fillStyle = subCableColors[j + 1];
        ctx.fillRect(0, -4, -diffDist, 8);
        ctx.restore();

      }
    }

    this.rope.draw(ctx);

    // for (var i = 1; i < this.rope.points.length; i++) {
    //     var imageNum = 1;
    //     if (i == 1) {
    //         imageNum = 0;
    //     }
    //     else if (i == this.rope.points.length - 1) {
    //         imageNum = 2;
    //     }

    //     var point1 = this.rope.points[i - 1].pos;
    //     var point2 = this.rope.points[i].pos;

    //     var ppos = point1.add(point2);
    //     ppos.x /= 2;
    //     ppos.y /= 2;
    //     var dif = point1.sub(point2);
    //     var segAngle = dif.angle() + Math.PI/2;
    //     this.sprite.drawExtRelative(ppos.x, ppos.y, imageNum, scl,scl, segAngle, 0.5, 0.5);
    // }
  }

  this.update = function (dt) {

    this.rope.rope.applyForce(new Vector(0, 0.2));

    var xx1 = (Math.cos(this.box1.angle) * (-this.box1.xOffset * 0.25));
    var yy1 = (Math.sin(this.box1.angle) * (-this.box1.yOffset * 0.25));

    var xx2 = (Math.cos(this.box2.angle) * (-this.box2.xOffset * 0.25));
    var yy2 = (Math.sin(this.box2.angle) * (-this.box2.yOffset * 0.25));


    this.rope.rope.points[0].pos.x = this.box1.x;
    this.rope.rope.points[0].pos.y = this.box1.y;
    this.rope.rope.points[this.rope.rope.points.length - 1].pos.x = this.box2.x;
    this.rope.rope.points[this.rope.rope.points.length - 1].pos.y = this.box2.y;

    this.box1.applyForce(this.rope.rope.tensionForce.mult(0.02), new Vector(xx1, yy1));
    this.box2.applyForce(this.rope.rope.tensionForce.mult(-0.02), new Vector(xx2, yy2));

    // this.box1.hspd += this.rope.tensionForce.x / 2;
    // this.box1.vspd += this.rope.tensionForce.y / 2;
    // this.box2.hspd -= this.rope.tensionForce.x / 2;
    // this.box2.vspd -= this.rope.tensionForce.y / 2;

    this.box1.update(dt);
    this.box2.update(dt);
    this.rope.rope.update(dt);

    this.pushDrawList();
  }

}

function ShadeRay(x, y, ang, scl, life) {
  this.x = x;
  this.y = y;
  this.ang = ang;
  this.angSpd = randRange(-0.02, 0.02);
  this.scl = scl;
  this.lifeMax = life;
  this.life = life;
  this.active = true;

  this.init = function (x, y, ang, scl, life) {
    this.x = x;
    this.y = y;
    this.ang = ang;
    this.angSpd = randRange(-0.02, 0.02);
    this.scl = scl;
    this.lifeMax = life;
    this.life = life;
    this.active = true;
  }

  this.draw = function (ctx) {
    if (!this.active) return;

    var alpha = ctx.globalAlpha;
    const progress = this.life / this.lifeMax;
    const third = 1 / 3;
    var thisAlpha = 1;
    if (progress < third) {
      thisAlpha = tweenIn(progress * 3);
    } else if (progress < third * 2) {
      thisAlpha = 1;
    } else {
      thisAlpha = tweenIn(1 - (progress - third * 2) * 3);
    }

    ctx.globalAlpha = thisAlpha;
    sprites[SPR.SHADE].drawExtRelative(this.x, this.y, 0, this.scl, this.scl, this.ang, 0.5, 0.5);
    ctx.globalAlpha = alpha;
  }

  this.update = function (dt) {
    if (this.life > 0) {
      this.ang += this.angSpd * dt;
      this.life -= dt;
    } else {
      this.active = false;
    }

  }


}


function BlackHole(x, y, scl) {
  this.x = x;
  this.y = y;
  this.scl = scl;

  this.ang = 0;
  this.angSpd = 0.01;

  this.shadeRays = [];
  this.rayNum = 10;
  for (var i = 0; i < this.rayNum; i++) {
    var ray = new ShadeRay(this.x, this.y, deg2rad(randInt(0, 360)), this.scl, randInt(0, 100));
    this.shadeRays.push(ray);
  }


  this.update = function (dt) {
    for (var i = 0; i < this.shadeRays.length; i++) {
      var ray = this.shadeRays[i];
      if (ray.active) {
        ray.update(dt);
      } else {
        ray.init(this.x, this.y, deg2rad(randInt(0, 360)), this.scl, randInt(50, 100));
      }
    }

    this.ang += this.angSpd * dt;
  }

  this.draw = function (ctx) {


    for (var i = 0; i < this.shadeRays.length; i++) {
      var ray = this.shadeRays[i];
      ray.draw(ctx);
    }

    sprites[SPR.BLACKHOLE].drawExtRelative(this.x, this.y, 0, this.scl * 2, this.scl * 2, this.ang, 0.5, 0.5);
  }


}