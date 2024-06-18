

class Minesweeper {
  constructor(){
    this.rows = 5;
    this.cols = 10;
    this.grid = [];
    this.gridFlag = [];
    this.gridOpen = [];
    this.gridOpenTiming = [];

    this.exposing = false;
    this.gameover = false;
    this.finished = false;
  }

  init(firstCell){
    this.exposing = false;
    this.gameover = false;
    this.finished = false;

    // Blank grid
    this.grid = [];
    this.gridFlag = [];
    this.gridOpen = [];
    this.gridOpenTiming = [];

    for(var i = 0; i < this.cols*this.rows; i++){
        this.grid.push(0);
        this.gridOpen.push(false);
        this.gridOpenTiming.push(-1);
        this.gridFlag.push(false);
    }

    // Placing Bombs
    var bombsToPlace = Math.floor(this.grid.length*0.2);
    while(bombsToPlace > 0){
      var randomIndex = Math.floor(Math.random() * this.grid.length);
      if(this.grid[randomIndex] != -1 && randomIndex != firstCell){
        this.grid[randomIndex] = -1;
        bombsToPlace--;
      }
    }

    // Generating Numbers
    for(var col = 0; col < this.cols; col++){
      for(var row = 0; row < this.rows; row++){
        var ind = col + this.cols*row;
        if (this.grid[ind] === -1) { // Skip processing if it's already a bomb
          continue;
        }

        let bombCount = 0;
        // Check surrounding squares for bombs
        for (let i = Math.max(0, row - 1); i <= Math.min(this.rows - 1, row + 1); i++) {
          for (let j = Math.max(0, col - 1); j <= Math.min(this.cols - 1, col + 1); j++) {
            if (this.grid[i*this.cols + j] === -1) {
              bombCount++;
            }
          }
        }
        this.grid[ind] = bombCount;
      }
    }

  }

  expose(cell){
    if(this.exposing) return;

    if(this.gridOpen[cell]) return;

    this.gridOpen[cell] = true;

    if(this.grid[cell] == -1){
      this.gameover = true;
      this.exposeAll();
      return -1;
    } else if(this.grid[cell] == 0){
      var col = cell%this.cols;
      var row = Math.floor(cell/this.cols);

      for (let i = Math.max(0, row - 1); i <= Math.min(this.rows - 1, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(this.cols - 1, col + 1); j++) {
          if (this.gridOpen[i*this.cols + j] == false) {
            this.expose(i*this.cols + j);
          }
        }
      }
    }
    return 0;
  }

  exposeAll(){
    if(this.exposing) return;

    var exposed = 0;
    for(var i = 0; i < this.grid.length; i++){
      if(this.gridOpen[i] == true) continue;

      this.gridOpenTiming[i] = (i%this.cols)*10;
    }
  }

  flag(cell){
    this.gridFlag[cell] = !this.gridFlag[cell];
  }

  update(){

    var allExposed = true;
    var allExposedBombs = true;
    for(var i = 0; i < this.grid.length; i++){
      if(this.gridOpen[i] == false) {
        allExposed = false;

        if(this.grid[i] != -1){
          allExposedBombs = false;
        }
      }

      if(this.gridOpenTiming[i] == -1) continue;

      if(this.gridOpenTiming[i] > 0){
        this.gridOpenTiming[i]--;
      } else {
        this.gridOpenTiming[i] = -1;
        this.gridOpen[i] = true;
      }
    }

    if(allExposedBombs){
      this.finished = true;
    }

    if(this.exposing){
      if(allExposed){
        this.finished = true;
      }
    }
  }
}

// class HDMIScreen(){
//   constructor(){
//     this.whiteBars = [];
//     this.glitchLevel = 0;
//     this.glitchMax = 100;
//   }
//
//   glitch(){
//
//   }
// }







class Manager {
  constructor(){
    this.losWid = 120;
    this.losHei = 120;
    this.cols = Math.floor(roomWidth/this.losWid);
    this.rows = 5;

    this.losangos = [];
    this.losangosGrid = [];
    this.losangosPhy = [];

    this.minesweeper = new Minesweeper();
    this.endingMinesweeper = false;


    this.locked = false;

    this.holding = false;
    this.holdingContent = null;

    this.mode = 0;

    this.altNames = false;

    this.sunAmount = 0;
    this.bitCoinAmount = 0;
    this.moneyAmount = 0;

    this.mouseGrid = -1;

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
    this.endingMinesweeper = false;

    this.minesweeper.init(firstId);

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

    this.minesweeper.expose(firstId);

  }

  exposeMinesweeper(cell){
    if(this.minesweeper.expose(cell) == -1){
      playSound(SND.EXPLOSION);
    }
  }

  endMinesweeper(){
    this.exposingMinesweeper = false;

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

  flagMinesweeper(cell){
    this.minesweeper.flag(cell);
  }


  fall(){
    for(var i = 0; i < this.losangos.length; i++){
      if(this.losangos[i].attached){
        this.deattachLosango(i);
      }
    }
  }

  getPosGrid(ind){
    var initX = this.losWid/2 + (roomWidth/2) - (this.cols*this.losWid)/2;
    var initY = this.losHei;
    var ix = ind%this.cols;
    var iy = Math.floor(ind/this.cols);
    return new Vector(this.losWid*ix + initX, this.losHei*iy + initY);
  }

  getMouseGrid(){
    var initX = (roomWidth/2) - (this.cols*this.losWid)/2;
    var initY = this.losHei/2;

    if(pointInRect(input.mouseX, input.mouseY, initX, initY, initX+this.cols*this.losWid, initY+this.rows*this.losHei)){
      var col = Math.floor((input.mouseX - initX)/this.losWid);
      var row = Math.floor((input.mouseY - initY)/this.losHei);

      return col + row*this.cols;
    }
    return -1;
  }


  // glitch(){
  //
  // }

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
    var initX = (roomWidth/2) - (this.cols*this.losWid)/2;
    var initY = this.losHei/2;

    this.mouseGrid = this.getMouseGrid();
    // if(mouseGrid != -1){
    //   ctx.strokeStyle = "rgb(255, 0, 0)";
    // } else {
    //   ctx.strokeStyle = "rgb(255, 255, 255)";
    // }
    // ctx.strokeRect(initX, initY, this.cols*this.losWid, this.rows*this.losHei);

    if(this.mouseGrid != -1 && this.holding && this.holdingContent == 1){
      var selectedPos = this.getPosGrid(this.mouseGrid);
      var selectedWid = this.losWid;
      var selectedHei = this.losHei;
      ctx.save();
      ctx.translate(selectedPos.x, selectedPos.y);
      ctx.rotate(deg2rad(45));
      ctx.strokeStyle = "rgb(255, 255, 255)";
      ctx.strokeRect(-selectedWid/2, -selectedHei/2, selectedWid, selectedHei);
      ctx.restore();
    }

    for(let i = 0; i < this.losangos.length; i++){
        var pos = this.getPosGrid(i);
        sprites[SPR.PIN].draw(pos.x, pos.y, 0, 4);
    }

    for(let i = 0; i < this.losangos.length; i++){
      this.losangos[i].draw(ctx);
    }

    if(isMobile){
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillText("MOBILE Version", 30, 10);
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
        this.minesweeper.update();
        if(this.minesweeper.finished){
          if(!this.endingMinesweeper){
            if(!this.minesweeper.gameover){
              winSounds[WINSND.WIN1].play();
            }

            this.endingMinesweeper = true;
          } else if(input.mouseState[0][1]){
              this.endMinesweeper();
          }
        }
        break;
    }

    this.winSoundCharging = true;
    if(winSounds[manager.winSoundId].paused){
      this.winSoundCharging = false;
    }

    this.world.step();
  }

  deattachLosango(id){
    const los = this.losangos[id];

    this.losangosPhy[id] = Physics.body('rectangle', {
            width: los.width
            ,height: los.height
            ,x: los.x
            ,y: los.y
            ,vx: los.hspd + randRange(-0.1, 0.1)
            ,vy: los.vspd + randRange(-0.1, 0.1)
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

    this.losangos[id].attached = true;
    this.losangosGrid[id] = this.mouseGrid;
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
