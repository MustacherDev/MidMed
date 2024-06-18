


class Losango {
  constructor(x, y, id){
    this.x = x;
    this.y = y;
    this.angle = deg2rad(45);
    this.id = id;

    this.xScl = 1;
    this.yScl = 1;

    this.hspd = 0;
    this.vspd = 0;

    this.width = manager.losWid/Math.sqrt(2);
    this.height = manager.losHei/Math.sqrt(2);

    this.boxWid = (this.width + manager.losWid)/4;
    this.boxHei = (this.height + manager.losHei)/4;

    this.boxCollider = new Block(this.x, this.y, this.boxWid*2, this.boxHei*2);
    this.boxCollider.centerX = this.boxWid;
    this.boxCollider.centerY = this.boxHei;

    this.prevX = 0;
    this.prevY = 0;

    this.holdX = 0;
    this.holdY = 0;
    this.holded = false;

    this.boundingBox = new BoundingBox(this.x - this.boxWid/2, this.y - this.boxHei/2, this.boxWid, this.boxHei);


    this.flipPhase = 0;
    this.flipTargetPhase = 0;
    this.flipping = false;
    this.flipSpd = 0.1;
    this.isFront = false;
    this.isHFlip = true;

    this.rotating = false;
    this.rotateSpd = 0.025;
    this.isTilted = true;

    this.frames = 0;

    this.frontColor = new Color(255,255,255);
    this.backColor = new Color(200, 200, 200);

    this.linePerc = 0.1;

    this.hovered = false;

    this.useAltName = false;
    this.minesweeper = false;

    this.updatePacket = null;
    this.updateList = [];

    this.attached = true;
    this.locked = false;
    this.open = false;
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

  draw(ctx){

    ctx.save(); // Save the current state
    ctx.translate(this.x, this.y); // Move to the center of the rectangle
    ctx.scale(this.xScl, this.yScl); // Scale the x-axis
    ctx.rotate(this.angle); // Rotate the canvas context


    // Draw the rectangle centered at (0, 0) after translation and scaling
    var tempColor = new Color(255, 255, 255);
    if(this.xScl > 0){
      tempColor = this.frontColor.copy();
    } else {
      tempColor = this.backColor.copy();
    }

    if(this.hovered || (manager.winSoundCharging && this.id == NAME.VICTORIA)){
      tempColor = new Color(Math.floor(tempColor.r*0.75), Math.floor(tempColor.g*0.75), Math.floor(tempColor.b*0.75));
    }

    var resultColor = tempColor.toHex();

    ctx.fillStyle = resultColor;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    ctx.fillStyle = 'rgb(200, 200, 200)';


    var perc = this.linePerc;


    if(this.attached){
      ctx.fillRect(-this.width / (2+2*perc), -this.height / (2-2*perc), this.width*(1-perc), 2);
      ctx.fillRect(-this.width / (2+2*perc), +this.height / (2-2*perc) -2, this.width*(1-perc), 2);
      ctx.fillRect(-this.width / (2-2*perc), -this.height / (2+2*perc), 2, this.height*(1-perc));
      ctx.fillRect(+this.width / (2-2*perc)-2, -this.height / (2+2*perc), 2, this.height*(1-perc));
    }

    if(this.isFront){
      ctx.rotate(-this.angle); // Rotate the canvas context

      ctx.font = '14px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      if(this.useAltName){
        ctx.fillText(nameMan.names[this.id][1], 0, 0);
      } else {
        ctx.fillText(nameMan.names[this.id][0], 0, 0);
      }

      if(this.minesweeper){
          if(manager.minesweeper.gridFlag[this.id]){
              sprites[SPR.NUMBERS].draw(0,0,10,this.boxWid/16, this.boxHei/16, true);
          }
      }

      ctx.rotate(this.angle); // Rotate the canvas context
    } else {
      if(this.minesweeper){
        ctx.rotate(-this.angle); // Rotate the canvas context
        ctx.scale(-1, 1); // Scale the x-axis

        if(manager.minesweeper.grid[this.id] == -1){
          sprites[SPR.BOMB].draw(0,0,0,this.boxWid/16, this.boxHei/16, true);
        } else if (manager.minesweeper.grid[this.id] == 0){

        } else {
          sprites[SPR.NUMBERS].draw(0,0,manager.minesweeper.grid[this.id],this.boxWid/16, this.boxHei/16, true);
          // ctx.fillStyle = manager.minesweeperNumColor[manager.minesweeperGrid[this.id]];
          // ctx.textAlign = 'center';
          // ctx.fillText(manager.minesweeperGrid[this.id], 0, 0);
        }

        ctx.scale(-1, 1); // Scale the x-axis
        ctx.rotate(this.angle); // Rotate the canvas context
      }
    }

    ctx.restore(); // Restore the original state



    //this.boxCollider.strokeBounds();
  }



  effect(rightClick){
    if(this.minesweeper){
      if(rightClick){
        manager.flagMinesweeper(this.id);
        return;
      }


      if(!this.locked){
        this.flip(1);
        this.locked = true;
        //this.open = true;
        manager.exposeMinesweeper(this.id);
      }

      if(this.id == NAME.LUIS){
        manager.minesweeper.exposeAll();
      }
      return;
    }


    if(this.id == NAME.WILLISTON){
      manager.altNames = !manager.altNames;
      for(var i = 0; i < manager.losangos.length; i++){
          var id = manager.losangos[i].id;
          if(nameMan.names[id][1] != nameMan.names[id][0]){
            var updatePacket = new UpdateLosango([new PropertyObject("useAltName", manager.altNames)]);
            updatePacket.isFront = true;
            manager.losangos[i].updateList.push(updatePacket);
          }
      }
    } else if(this.id == NAME.LUIS){
      manager.initMinesweeper(this.id);
    } else if(this.id == NAME.JOAS){
      if(chance(0.2)){
        var coinX = randInt(0, roomWidth);
        var coinY = -100;
        addObject(new Bitcoin(coinX, coinY, randInt(25, 40)), OBJECT.BITCOIN);
        playSound(SND.COINNOISE);
      }
    } else if(this.id == NAME.VICTORIA){
      if(winSounds[manager.winSoundId].paused){
        playSound(SND.POP);
        var newWinSound = randInt(0, WINSND.TOTAL);
        manager.winSoundId = (newWinSound == manager.winSoundId) ? (newWinSound+1)%WINSND.TOTAL : newWinSound;
        winSounds[manager.winSoundId].play();
      }
    } else if(this.id == NAME.CAIO){
      if(this.useAltName){
        playSound(SND.FALL);
      }
      manager.fall();
    } else if (this.id == NAME.ALICE){
      manager.sortGrid();
    } else {
      this.flip();
    }
  }

  startFlipping(){
    playSound(SND.PAGESLIP);
    this.flipping = true;
  }

  flip(flipAmount = 2){
    this.startFlipping();
    this.flipping = true;
    this.flipAmount = flipAmount;
    this.flipTargetPhase = this.flipPhase + this.flipAmount * Math.PI;
  }


  phaseAngleToSide(angle) {
    // Normalize the angle to the range [0, 2*Pi)
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
      angle += 2 * Math.PI;
    }

    return (angle > Math.PI / 2 && angle <= 3 * Math.PI / 2) ? false : true;
  }

  getHold(){
    if(this.hovered && !this.holded && input.mouseState[0][1] && manager.holding == false){
      manager.holding = true;
      manager.holdingContent = 1;
      this.holded = true;
      this.holdX = input.mouseX - this.x;
      this.holdY = input.mouseY - this.y;
      this.hspd = 0;
      this.vspd = 0;
    }
  }

  updateHold(){
    if(this.holded){
      manager.holding = true;
      this.x = input.mouseX - this.holdX;
      this.y = input.mouseY - this.holdY;

      if(!input.mouseState[0][0]){
        manager.losangosPhy[this.id].state.pos.x = this.x;
        manager.losangosPhy[this.id].state.pos.y = this.y;

        this.holded = false;

        let totalXDiff = 0;
        let totalYDiff = 0;

        for (const mousePos of manager.prevMousePos) {
          totalXDiff += (this.x + this.holdX) - mousePos.x;
          totalYDiff += (this.y + this.holdY) - mousePos.y;
        }

        var throwForce = 1;
        this.hspd = (totalXDiff / manager.prevMousePos.length) * throwForce;
        this.vspd = (totalYDiff / manager.prevMousePos.length) * throwForce;

        manager.attachLosangoMouse(this.id);
      }
    }
  }



  update(input){
    this.hovered = false;

    this.frames++;

    if(this.isInside(input.mouseX, input.mouseY)){
      this.hovered = true;
      canvas.style.cursor = 'pointer';
    }

    if(this.attached){
      var targetPos = manager.getPosGrid(manager.losangosGrid[this.id]);

      if(Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 5){
        this.x = targetPos.x;
        this.y = targetPos.y;
      } else {
        var pos = new Vector(this.x, this.y);
        var dist = targetPos.sub(pos).mag();
        var dir = targetPos.sub(pos).unit();

        var spd = Math.max((dist*dist)/100000, 0.1);

        this.hspd += dir.x*spd;
        this.vspd += dir.y*spd;
      }
    } else {


      if(!this.holded){

        this.getHold();

        // this.vspd += 0.1;

        var posPhy = manager.losangosPhy[this.id].state.pos;
        this.x = posPhy.x;
        this.y = posPhy.y;

        this.angle = (manager.losangosPhy[this.id].state.angular.pos)%(Math.PI*2);
      } else {
        manager.losangosPhy[this.id].state.pos.x = this.x;
        manager.losangosPhy[this.id].state.pos.y = this.y;
        this.updateHold();
      }
    }

    this.hspd = clamp(this.hspd, -20, 20);
    this.vspd = clamp(this.vspd, -20, 20);
    this.hspd *= 0.98;
    this.vspd *= 0.98;

    this.prevX = this.x;
    this.prevY = this.y;
    this.x += this.hspd;
    this.y += this.vspd;

    this.updateBox();



    this.linePerc = 0.1 + Math.cos(this.frames/40)*0.05;

    if(this.hovered){
      if(input.mouseState[0][1]){

        if(this.attached){
          if(!this.flipping){
            this.effect(false);
          }
        } else {

        }
      } else {
        if(input.mouseState[2][1]){

          if(this.attached){
            if(!this.flipping){
              this.effect(true);
            }
          }
        }
      }
    }

    if(this.minesweeper){
      if(manager.minesweeper.gridOpen[this.id] && this.isFront && !this.flipping){
        this.flip(1);
      }
    }


    // FLIPPING
    if(this.flipping){
      this.flipPhase += this.flipSpd;


      // We should update the object properties as soon as it changes front-back
      if(this.flipPhase >= this.flipTargetPhase - Math.PI/2){
        if(this.updatePacket != null){
          for(var i = 0; i < this.updatePacket.propertyList.length; i++){
            var prop = this.updatePacket.propertyList[i];
            this[prop.propertyName] = prop.value;
          }

          this.updatePacket = null;
        }
      }

      // Flipping stops when it reaches target Phase
      if(this.flipPhase >= this.flipTargetPhase){
        this.flipping = false;
        this.isFront = this.phaseAngleToSide(this.flipPhase);
        this.flipPhase = Math.PI * (1 - this.isFront);


      }
    }

    this.isFront = this.phaseAngleToSide(this.flipPhase);

    // Rotating/ Tilting
    if(this.rotating){
      if(this.isTilted){
        this.angle -= this.rotateSpd;
        if(this.angle <= 0){
          this.isTilted = false;
          this.rotating = false;
          this.angle = 0;
        }
      } else {
        this.angle += this.rotateSpd;
        if(this.angle >= deg2rad(45)){
          this.isTilted = true;
          this.rotating = false;
          this.angle = deg2rad(45);
        }
      }
    }

    this.xScl = Math.cos(this.flipPhase);



    // Packet processing
    if(!this.flipping){
      if(this.updateList.length > 0){
        if(this.updateList[0].waitTime > 0){
          this.updateList[0].waitTime--;
        } else {
          this.updatePacket = this.updateList.shift();
          this.startFlipping();
          this.flipAmount = (this.isFront == this.updatePacket.isFront) ? 2 : 1;
          this.flipTargetPhase = this.flipPhase + Math.PI * this.flipAmount;
        }
      }
    }
  }
}
