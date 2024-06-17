

function setupMenuState(){
  manager.init();
}

class Manager {
  constructor(){
    this.losWid = 120;
    this.losHei = 120;
    this.cols = Math.floor(roomWidth/this.losWid);
    this.rows = 5;

    this.losangos = [];
    this.losangosGrid = [];
    this.losangosPhy = [];

    this.minesweeperGrid = [];
    this.exposingMinesweeper = false;
    this.minesweeperGameover = false;
    this.locked = false;

    this.holding = false;

    this.mode = 0;

    this.altNames = false;

    this.sunAmount = 0;
    this.bitCoinAmount = 0;
    this.moneyAmount = 0;

    this.startFramesMax = 100;
    this.startFrames = this.startFramesMax;

    this.winSoundId = 0;
    this.winSoundCharging = false;

    this.world = Physics();
    this.worldEdgebounce;
  }

  initMinesweeper(firstId){
    if(this.mode == 1){
      return;
    }

    this.mode = 1;
    this.minesweeperGameover = false;

    // Blank grid
    this.minesweeperGrid = [];
    for(var i = 0; i < this.cols*this.rows; i++){
        this.minesweeperGrid.push(0);
    }

    // Placing Bombs
    var bombsToPlace = Math.floor(this.minesweeperGrid.length*0.2);
    while(bombsToPlace > 0){
      var randomIndex = Math.floor(Math.random() * this.minesweeperGrid.length);
      if(this.minesweeperGrid[randomIndex] != -1 && randomIndex != firstId){
        this.minesweeperGrid[randomIndex] = -1;
        bombsToPlace--;
      }
    }

    // Generating Numbers
    for(var col = 0; col < this.cols; col++){
      for(var row = 0; row < this.rows; row++){
        var ind = col + this.cols*row;
        if (this.minesweeperGrid[ind] === -1) { // Skip processing if it's already a bomb
          continue;
        }

        let bombCount = 0;
        // Check surrounding squares for bombs
        for (let i = Math.max(0, row - 1); i <= Math.min(this.rows - 1, row + 1); i++) {
          for (let j = Math.max(0, col - 1); j <= Math.min(this.cols - 1, col + 1); j++) {
            if (this.minesweeperGrid[i*this.cols + j] === -1) {
              bombCount++;
            }
          }
        }

        this.minesweeperGrid[ind] = bombCount;
      }
    }

    for(var i = 0; i < this.losangos.length; i++){

      var updatePacket = new UpdateLosango([new PropertyObject("minesweeper", true), new PropertyObject("rotating", true), new PropertyObject("isTilted", true)]);
      this.losangos[i].updateList.push(updatePacket);
      this.losangos[i].open = false;

      updatePacket.waitTime = (i%this.cols)*10;

      if(this.losangos[i].id != firstId){
        updatePacket.isFront = true;
      } else {
        updatePacket.isFront = false;
        this.losangos[i].open = true;
      }
    }

  }

  exposeMinesweeper(){
    if(this.exposingMinesweeper){
      return;
    }

    this.exposingMinesweeper = true;

    var delay = 0;
    for(var i = 0; i < this.losangos.length; i++){
      if(this.losangos[i].open){
        continue;
      }
      var updatePacket = new UpdateLosango([new PropertyObject("open", true)]);


      this.losangos[i].updateList.push(updatePacket);
      updatePacket.isFront = false;
      updatePacket.waitTime = delay*10;
      this.losangos[i].locked = true;

      delay++;
    }
  }

  checkMinesweeper(){
    var finished = true;
    for(var i = 0; i < this.losangos.length; i++){
      if(!this.losangos[i].open && this.minesweeperGrid[this.losangos[i].id] != -1){
        finished = false;
        break;
      }
    }

    return finished;
  }

  endMinesweeper(){
    this.exposingMinesweeper = false;

    for(var i = 0; i < this.losangos.length; i++){
      if(this.losangos[i].isFront == false){
        continue;
      }
      var updatePacket = new UpdateLosango([]);

      this.losangos[i].updateList.push(updatePacket);
      updatePacket.isFront = false;
    }

    for(var i = 0; i < this.losangos.length; i++){
      var updatePacket = new UpdateLosango([
        new PropertyObject("minesweeper", false),
        new PropertyObject("rotating", true),
        new PropertyObject("isTilted", false)]);

      this.losangos[i].updateList.push(updatePacket);
      updatePacket.isFront = true;
      this.losangos[i].locked = false;
      this.losangos[i].open = false;
    }

    this.mode = 0;
  }


  fall(){
    for(var i = 0; i < this.losangos.length; i++){
      this.deattachLosango(i);
    }
  }

  getPosGrid(ind){
    var initX = this.losWid/2 + (roomWidth/2) - (this.cols*this.losWid)/2;
    var initY = this.losHei;
    var ix = ind%this.cols;
    var iy = Math.floor(ind/this.cols);
    return new Vector(this.losWid*ix + initX, this.losHei*iy + initY);
  }


  init(){
    var initX = this.losWid/2 + (roomWidth/2) - (this.cols*this.losWid)/2;
    var initY = this.losHei;
    for(let i = 0; i < NAME.TOTAL; i++){
      var pos = this.getPosGrid(i);
      this.losangos.push(new Losango(pos.x, pos.y, i));
      this.losangosGrid.push(i);
      this.losangosPhy.push(null);
    }

    this.worldEdgebounce = Physics.behavior('edge-collision-detection', {
       aabb: Physics.aabb(0,0,roomWidth, roomHeight)
       ,restitution: 0.2
       ,cof: 0.8
   });

    this.world.add([
       Physics.behavior('constant-acceleration')
       ,Physics.behavior('body-impulse-response')
       ,Physics.behavior('body-collision-detection')
       ,Physics.behavior('sweep-prune')
       ,this.worldEdgebounce
   ]);
  }

  draw(ctx){

    for(let i = 0; i < this.losangos.length; i++){
        var pos = this.getPosGrid(i);
        sprites[SPR.PIN].draw(pos.x, pos.y, 0, 4);
    }

    for(let i = 0; i < this.losangos.length; i++){
      this.losangos[i].draw(ctx);
    }
  }

  update(input){
    this.holding = false;

    for(let i = 0; i < this.losangos.length; i++){
      this.losangos[i].update(input);
    }

    switch(this.mode){
      case 0:

        break;

      // MINESWEEPER
      case 1:
        if(this.exposingMinesweeper){
          if(this.checkMinesweeper()){
            this.endMinesweeper();
          }
        }
        break;
    }

    this.winSoundCharging = true;
    if(winSounds[manager.winSoundId].paused){
      this.winSoundCharging = false;
    }

    // for(var i = 0; i < this.losangos.length; i++){
    //   this.losangos[i].boxCollider.x = this.losangos[i].x;
    //   this.losangos[i].boxCollider.y = this.losangos[i].y;
    //   this.losangos[i].boxCollider.updatePos();
    //   this.losangos[i].boxCollider.hspd = this.losangos[i].hspd;
    //   this.losangos[i].boxCollider.vspd = this.losangos[i].vspd;
    // }
    //
    // for(var i = 0; i < this.losangos.length; i++){
    //   if(this.losangos[i].attached || this.losangos[i].holded){
    //     continue;
    //   }
    //   for(var j = i; j < this.losangos.length; j++){
    //     if(this.losangos[j].attached || this.losangos[j].holded){
    //       continue;
    //     }
    //
    //     blockCollision(this.losangos[i].boxCollider, this.losangos[j].boxCollider);
    //   }
    //
    //   this.losangos[i].vspd = this.losangos[i].boxCollider.vspd;
    //   this.losangos[i].hspd = this.losangos[i].boxCollider.hspd;
    //   this.losangos[i].y = this.losangos[i].boxCollider.y;
    //   this.losangos[i].x = this.losangos[i].boxCollider.x;
    // }

    this.world.step();
  }

  deattachLosango(id){
    const los = this.losangos[id];

    this.losangosPhy[id] = Physics.body('rectangle', {
            width: los.width
            ,height: los.height
            ,x: los.x
            ,y: los.y
            ,vx: los.hspd
            ,vy: los.vspd
            ,cof: 0.99
            ,restitution: 0.99
        });
    this.losangosPhy[id].state.angular.pos = deg2rad(45);
    this.world.add(this.losangosPhy[id]);

    this.losangos[id].attached = false;
  }

  attachLosango(id){
    if(this.losangosPhy[id] != null){
      this.world.remove(this.losangosPhy[id]);
    }
  }
}

var manager = new Manager();

class PropertyObject{
  constructor(propertyName, value){
    this.propertyName = propertyName;
    this.value = value;
  }
}

class UpdateLosango{
  constructor(propertyList){
    this.propertyList = propertyList;
    this.isFront = true;
    this.waitTime = 0;
  }
}

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

    ctx.fillStyle = resultColor;

    var perc = this.linePerc;

    ctx.fillRect(-this.width / (2+2*perc), -this.height / (2-2*perc), this.width*(1-perc), 1);
    ctx.fillRect(-this.width / (2+2*perc), +this.height / (2-2*perc), this.width*(1-perc), 1);
    ctx.fillRect(-this.width / (2-2*perc), -this.height / (2+2*perc), 1, this.height*(1-perc));
    ctx.fillRect(+this.width / (2-2*perc), -this.height / (2+2*perc), 1, this.height*(1-perc));

    if(this.isFront){
      ctx.rotate(-this.angle); // Rotate the canvas context
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      if(this.useAltName){
        ctx.fillText(nameMan.names[this.id][1], 0, 0);
      } else {
        ctx.fillText(nameMan.names[this.id][0], 0, 0);
      }

      ctx.rotate(this.angle); // Rotate the canvas context
    } else {
      if(this.minesweeper){
        ctx.rotate(-this.angle); // Rotate the canvas context
        ctx.scale(-1, 1); // Scale the x-axis

        if(manager.minesweeperGrid[this.id] == -1){
          sprites[SPR.BOMB].draw(0,0,0,this.boxWid/16, this.boxHei/16, true);
        } else if (manager.minesweeperGrid[this.id] == 0){

        } else {
          sprites[SPR.NUMBERS].draw(0,0,manager.minesweeperGrid[this.id],this.boxWid/16, this.boxHei/16, true);
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



  effect(){
    if(this.minesweeper){

      if(!this.locked){
        this.flip(1);
        this.locked = true;
        this.open = true;

        if(manager.minesweeperGrid[this.id] == -1){
          manager.minesweeperGameover = true;
          manager.exposeMinesweeper();
        } else {
          if(manager.checkMinesweeper()){
            manager.exposeMinesweeper();
          }
        }
      }

      if(this.id == NAME.LUIS){
        manager.exposeMinesweeper();
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
      var coinX = randInt(0, roomWidth);
      var coinY = -100;
      addObject(new Bitcoin(coinX, coinY, randInt(25, 40)), OBJECT.BITCOIN);
    } else if(this.id == NAME.VICTORIA){
      if(winSounds[manager.winSoundId].paused){
        sounds[SND.POP].play();
        var newWinSound = randInt(0, WINSND.TOTAL);
        manager.winSoundId = (newWinSound == manager.winSoundId) ? (newWinSound+1)%WINSND.TOTAL : newWinSound;
        winSounds[manager.winSoundId].play();
      }
    } else if(this.id == NAME.CAIO){
      if(this.useAltName){
        sounds[SND.FALL].play();
      }
      manager.fall();
    } else {
      this.flip();
    }
  }

  startFlipping(){
    sounds[SND.PAGEFLIP].pause();
    sounds[SND.PAGEFLIP].currentTime = 0;
    sounds[SND.PAGEFLIP].play();
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
        this.hspd = this.x - this.prevX;
        this.vspd = this.y - this.prevY;
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

      if(Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 50){
        this.x = targetPos.x;
        this.y = targetPos.y;
      } else {
        var pos = new Vector(this.x, this.y);
        var dir = targetPos.sub(pos).unit();
        this.hspd = dir.x;
        this.vspd = dir.y;
      }
    } else {


      if(!this.holded){

        this.getHold();

        // this.vspd += 0.1;

        var posPhy = manager.losangosPhy[this.id].state.pos;
        this.x = posPhy.x;
        this.y = posPhy.y;

        this.angle = manager.losangosPhy[this.id].state.angular.pos;

        //
        // // Physiscs
        // if (this.boundingBox.x + this.boundingBox.width > roomWidth) {
        //     this.boundingBox.x = roomWidth - this.boundingBox.width;
        //     this.hspd *= -0.5;
        // } else if (this.boundingBox.x < 0) {
        //     this.boundingBox.x = 0;
        //     this.hspd *= -0.5;
        // }
        //
        // if (this.boundingBox.y + this.boundingBox.height > roomHeight) {
        //     this.boundingBox.y = roomHeight - this.boundingBox.height;
        //     this.vspd *= -0.5;
        // } else  if (this.boundingBox.y < 0) {
        //     this.boundingBox.y = 0;
        //     this.vspd *= -0.5;
        // }


        //var newPos = this.boundingboxToPos();
      //  this.x = newPos.x;
        //this.y = newPos.y;
      } else {
        this.updateHold();
      }
    }

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
            this.effect();
          }
        } else {

        }
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


function stateMenu(){

  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0,0,roomWidth, roomHeight);

  manager.update(input);
  manager.draw(ctx);

  updateList(OBJECT.GAMEOBJECT);
  drawList(OBJECT.DRAW);

  if(manager.startFrames > 0){
    manager.startFrames--;
    ctx.fillStyle = "rgba(0,0,0," + (manager.startFrames/manager.startFramesMax) + ")";
    ctx.fillRect(0,0,roomWidth, roomHeight);
  }

}
