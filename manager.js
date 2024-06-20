

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

class HDMIScreen{
  constructor(){
    this.whiteBars = [];
    this.glitchLevel = 0;
    this.glitchMax = 100;
    this.hdmi = false;
    this.barTick = 0;


    this.reconnectTime = 500;
    this.reconnectTimer = 0;
    this.reconnectLag = 0;
    this.reconnectLagTimer = 0;
    this.reconnectStatus = 0;
  }

  glitch(){
    this.glitchLevel += 20;
    if(chance(this.glitchLevel/this.glitchMax)){
      var barNum = 1 + randInt(1, 3);
      for(var i = 0; i < barNum; i++){
        if(this.whiteBars.length > 5) break;
        var barY = randInt(0, roomHeight);
        var barHei = randInt(10, 200);
        this.whiteBars.push(new Vector(barY, barHei));
      }
    }
  }

  update(){

    if(this.glitchLevel > 0){
      this.glitchLevel--;
    }

    if(this.glitchLevel >= this.glitchMax){
      this.hdmi = true;
    }

    this.barTick++;
    if(this.barTick > 5){
      this.barTick = 0;

      if(this.whiteBars.length > 0){
        this.whiteBars.shift();
      }
    }

    if(this.hdmi){
      if(this.reconnectTimer > this.reconnectTime){
        this.hdmi = false;
        this.reconnectTimer = 0;
      } else {

        if(this.reconnectLag <= 0){

          this.reconnectStatus = Math.floor((this.reconnectTimer/this.reconnectTime)*100)/100;

          if(this.reconnectLagTimer <= 0){
            this.reconnectLag = Math.min(randInt(0, 80), (this.reconnectTime - this.reconnectTimer) - 20);
          } else {
            this.reconnectLagTimer--;
          }
        } else {
          this.reconnectLag--;
          if(this.reconnectLag <= 0){
            this.reconnectLagTimer = randInt(10, 200);
          }
        }
        this.reconnectTimer++;
      }
    }
  }

  draw(ctx){
    ctx.fillStyle = "rgb(255,255,255)";

    for(var i = 0; i < this.whiteBars.length;i++){
      ctx.fillRect(0,this.whiteBars[i].x, roomWidth, this.whiteBars[i].y);
    }

    if(this.hdmi){
      ctx.fillStyle = "rgb(0,0,255)";
      ctx.fillRect(0,0,roomWidth, roomHeight);

      ctx.fillStyle = "rgb(0,0,230)";
      for(var i = 0; i < 100; i++){
        ctx.fillRect(0, i*8, roomWidth, 2);
      }

      var barWid = roomWidth/2;
      var barHei = 120;

      var barX = roomWidth/2 - barWid/2;
      var barY = roomHeight/2 - barHei/2;

      ctx.fillStyle = "rgb(255,255,255)";
      ctx.fillRect(barX-2, barY-2, barWid+4, barHei+4);
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.fillRect(barX, barY, barWid, barHei);

      ctx.fillStyle = "rgb(255,255,255)";
      var noSignalText = (manager.altNames) ? "No signal." : "Sem sinal.";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '40px Arial';
      ctx.fillText(noSignalText, roomWidth/2, roomHeight/2);

      ctx.fillStyle = "rgb(0,0,0)";
      ctx.fillRect(40, roomHeight - 40, roomWidth - 60, 20);
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.fillRect(40, roomHeight - 40, (roomWidth - 60)*this.reconnectStatus, 20);
    }
  }
}


class SunDisplay{
  constructor(){
    this.x = 40;
    this.y = -200;
    this.yOff = 0;
    this.height = 200;
    this.sun = 0;

    this.state = 0;

    this.inTime = 50;
    this.stayTime = 400;
    this.outTime = 50;

    this.timer = 0;
  }

  updateSun(){
    if(this.state == 0){
      this.state = 1;
      this.timer = 0;
    } else if (this.state == 2){
      this.timer = 0;
    } else if (this.state == 3){
      this.state = 1;
      this.timer = (1-(this.timer/this.outTime))*this.inTime;
    }
  }

  update(){
      switch(this.state){
        // HIDDEN
        case 0:
          this.yOff = 0;
          break;

        // ENTERING
        case 1:
          this.timer++;
          this.yOff = 0.9*this.height*tweenOut(this.timer/this.inTime);
          if(this.timer > this.inTime){
            this.timer = 0;
            this.state = 2;
          }
          break;

        // STAYING
        case 2:
          this.timer++;
          this.yOff = 0.9*this.height;
          if(this.timer > this.stayTime){
            this.timer = 0;
            this.state = 3;
          }
          break;

        // LEAVING
        case 3:
          this.timer++;
          this.yOff = 0.9*this.height*tweenOut(1-(this.timer/this.outTime));
          if(this.timer > this.outTime){
            this.timer = 0;
            this.state = 0;
          }
          break;
      }
  }

  draw(ctx){

    var scl = this.height/sprites[SPR.SUNDISPLAY].height
    var wid = sprites[SPR.SUNDISPLAY].width*scl;
    sprites[SPR.SUNDISPLAY].drawSimple(this.x, this.y + this.yOff, 0, scl);
    sprites[SPR.SUN].drawRot(this.x + wid/2, this.y + this.yOff + wid/2, 0, 1, 1, 0, true);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "48px Fixedsys";
    ctx.fontAlign = "center";
    ctx.fontBaseline = "middle";
    ctx.fillText(this.sun, this.x + wid/2, this.y + this.yOff + this.height*0.8);


    // ctx.fillRect(this.x, this.y + this.yOff, this.width, this.height);
    // ctx.fillStyle = "rgb(0,0,0)";
    // ctx.fillRect(this.x, this.y + this.yOff, this.width, this.height);
  }
}







class Manager {
  constructor(){
    this.losWid = 120;
    this.losHei = 120;

    this.verticalSpace = this.losHei;

    if(isMobile){
      this.losWid = 140;
      this.losHei = 140;
      this.verticalSpace = this.losHei/2;
    }

    this.cols = Math.floor(roomWidth/this.losWid);
    this.rows = 5;




    this.losangos = [];
    this.losangosGrid = [];
    this.losangosPhy = [];

    this.minesweeper = new Minesweeper();
    this.endingMinesweeper = false;

    this.hdmiScreen = new HDMIScreen();


    this.locked = false;

    this.holding = false;
    this.holdingContent = null;

    this.mode = 0;

    this.altNames = false;

    this.sunAmount = 0;
    this.bitCoinAmount = 0;
    this.moneyAmount = 0;

    this.sunDisplay = new SunDisplay();

    this.quietTimer = 0;

    this.mouseGrid = -1;
    this.mouseGridTime = 25;
    this.mouseGridTimer = 0;

    this.startFramesMax = 100;
    this.startFrames = this.startFramesMax;

    this.winSoundId = 0;
    this.winSoundCharging = false;

    this.world = Physics();
    this.worldEdgebounce;

    this.prevMousePos = [];
    this.prevMouseLength = 2;
    if(isMobile){
      this.prevMouseLength = 5;
    }


    this.particles = [];
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

  sortGrid(){
    playSound(SND.WHISTLE);

    for(var i = 0; i < this.losangos.length; i++){
      if(!this.losangos[i].attached){
        this.attachLosango(i, i);
      } else {
        this.losangosGrid[i] = i;
      }

      var updatePacket = new UpdateLosango([
        new PropertyObject("rotating", true),
        new PropertyObject("isTilted", false)]);

      this.losangos[i].updateList.push(updatePacket);
      updatePacket.isFront = true;

    }
  }

  explosionImpulse(x, y, amp){
    var pos = new Vector(x, y);
    for(var i = 0 ; i < this.losangos.length; i++){
      var diff = new Vector(this.losangos[i].x, this.losangos[i].y);
      diff = diff.sub(pos);
      var dist = Math.max(diff.mag(), 1);
      var dir = diff.unit();

      this.losangos[i].x += amp*10*dir.x/dist;
      this.losangos[i].y += amp*10*dir.y/dist;
      this.losangos[i].hspd += 10*amp*dir.x/dist;
      this.losangos[i].vspd += 10*amp*dir.y/dist;
    }
  }

  glitch(){
    this.hdmiScreen.glitch();
  }

  collectSun(){
    this.sunAmount += 25;
    this.sunDisplay.sun = this.sunAmount;
    this.sunDisplay.updateSun();
  }



  getPosGrid(ind){
    var initX = this.losWid/2 + (roomWidth/2) - (this.cols*this.losWid)/2;
    var initY = this.verticalSpace;
    var ix = ind%this.cols;
    var iy = Math.floor(ind/this.cols);
    return new Vector(this.losWid*ix + initX, this.losHei*iy + initY);
  }

  getMouseGrid(){

    var initPos = this.getPosGrid(0);

    var cornerX = initPos.x - this.losWid/2;
    var cornerY = initPos.y - this.losHei/2;

    if(pointInRect(input.mouseX, input.mouseY, cornerX, cornerY, cornerX+this.cols*this.losWid, cornerY+this.rows*this.losHei)){
      var col = Math.floor((input.mouseX - cornerX)/this.losWid);
      var row = Math.floor((input.mouseY - cornerY)/this.losHei);

      return col + row*this.cols;
    }
    return -1;
  }

  init(){
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

    if(this.mouseGrid != -1 && this.holding && this.holdingContent == 1){
      var selectedPos = this.getPosGrid(this.mouseGrid);
      var selectedWid = this.losWid;
      var selectedHei = this.losHei;
      ctx.save();
      ctx.translate(selectedPos.x, selectedPos.y);
      ctx.rotate(deg2rad(45));
      if(this.mouseGridTimer > this.mouseGridTime){
        ctx.strokeStyle = "rgb(50, 255, 50)";
        ctx.strokeRect(-selectedWid/1.8, -selectedHei/1.8, selectedWid*1.125, selectedHei*1.125);
      } else {
        ctx.strokeStyle = "rgb(255, 255, 255)";
      }
      ctx.strokeRect(-selectedWid/2, -selectedHei/2, selectedWid, selectedHei);
      ctx.restore();
    }

    for(let i = 0; i < this.losangos.length; i++){
        var pos = this.getPosGrid(i);
        sprites[SPR.PIN].draw(pos.x -4, pos.y -4, 0, 4);
    }

    for(let i = 0; i < this.losangos.length; i++){
      this.losangos[i].draw(ctx);
    }

    // DRAWING PARTICLES
    for (var i = 0; i < this.particles.length; i++) {
        if (this.particles[i].active) {
            this.particles[i].draw();
        }
    }


    this.hdmiScreen.draw(ctx);

    this.sunDisplay.draw(ctx);

    if(isMobile){
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.font = '14px Arial';
      ctx.fillText("MOBILE Version", 30, 10);
    }
  }

  winSoundReady(){
    // VICTORY SOUND COOLDOWN
    if(winSounds[manager.winSoundId].paused){
      return true;
    }
    return false;
  }

  update(input){
    this.holding = false;

    var newMouseGrid = this.getMouseGrid();

    for(let i = 0; i < this.losangos.length; i++){
      this.losangos[i].update(input);
    }

    this.mouseGridTimer++;

    if(!this.holding){
      this.mouseGridTimer = 0;
    }

    if(this.mouseGrid != newMouseGrid){
      this.mouseGrid = newMouseGrid;
      this.mouseGridTimer = 0;
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

      case 2:
        if(!this.hdmiScreen.hdmi) this.mode = 0;
        break;

    }



    this.hdmiScreen.update();
    if(this.hdmiScreen.hdmi){
      this.mode = 2;
    }

    this.world.step();


    // MOUSE PREVIOUS POSITIONS
    this.prevMousePos.push(new Vector(input.mouseX, input.mouseY));

    if(this.prevMousePos.length > this.prevMouseLength){
      this.prevMousePos.shift();
    }

    // UPDATING PARTICLES
    for (var i = 0; i < this.particles.length; i++) {
        if (this.particles[i].active) {
            this.particles[i].update();
        } else {
          this.particles.splice(i, 1);
          i--;
        }
    }

    // SLEEP
    if(this.quietTimer > 2050){
      this.quietTimer -= 50;

      var sleepX = this.losangos[NAME.ISRAEL].x;
      var sleepY = this.losangos[NAME.ISRAEL].y;

      this.particles.push(new SleepText(sleepX, sleepY));
    }

    if(this.mode == 0){
      this.quietTimer++;
    }

    this.sunDisplay.update();
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

  attachLosango(id, gridCell){
    if(this.losangosPhy[id] != null){
      this.world.remove(this.losangosPhy[id]);
    }

    this.losangos[id].attached = true;
    this.losangosGrid[id] = gridCell;
  }

  attachLosangoMouse(id){
    if(this.mouseGrid == -1 || this.mouseGridTimer <= this.mouseGridTime) return;
    this.attachLosango(id, this.mouseGrid);
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
