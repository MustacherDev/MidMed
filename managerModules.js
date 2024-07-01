

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

  update(dt){

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
        this.gridOpenTiming[i] -= dt;
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

  update(dt){

    if(this.glitchLevel > 0){
      this.glitchLevel -= dt;
    }

    if(this.glitchLevel >= this.glitchMax){
      this.hdmi = true;
    }

    this.barTick += dt;
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
            this.reconnectLagTimer -= dt;
          }
        } else {
          this.reconnectLag -= dt;
          if(this.reconnectLag <= 0){
            this.reconnectLagTimer = randInt(10, 200);
          }
        }
        this.reconnectTimer += dt;
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

  update(dt){
      switch(this.state){
        // HIDDEN
        case 0:
          this.yOff = 0;
          break;

        // ENTERING
        case 1:
          this.timer+=dt;
          this.yOff = 0.9*this.height*tweenOut(this.timer/this.inTime);
          if(this.timer > this.inTime){
            this.timer = 0;
            this.state = 2;
          }
          break;

        // STAYING
        case 2:
          this.timer+= dt;
          this.yOff = 0.9*this.height;
          if(this.timer > this.stayTime){
            this.timer = 0;
            this.state = 3;
          }
          break;

        // LEAVING
        case 3:
          this.timer+= dt;
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

class Spotlight{
  constructor(){
    this.x = 0;
    this.y = 0;
    this.width  = 2000;
    this.height = 2000;

    this.active = false;

    this.spd = 0;
  }

  update(dt){
    if(!this.active) return;

    this.width -= this.spd*dt;
    this.height -= this.spd*dt;
  }

  draw(ctx){

    if(!this.active) return;

    var border = 2;

    var scl = this.width/sprites[SPR.HOLE].width;
    var offset = sprites[SPR.HOLE].width/2;

    var sprPos = new Vector(this.x - offset*scl, this.y - offset*scl);

    sprites[SPR.HOLE].drawExt(this.x, this.y, 0, scl, scl, 0, offset, offset);
    ctx.fillStyle = "rgb(0,0,0)";

    ctx.fillRect(0 - border                    , 0 - border                     , roomWidth + border*2, sprPos.y + border*2);
    ctx.fillRect(sprPos.x + this.width - border, sprPos.y - border              , roomWidth - (sprPos.x + this.width)+ border*2, this.height+ border*2);
    ctx.fillRect(0 - border                    , sprPos.y - border              , sprPos.x+ border*2, this.height+ border*2);
    ctx.fillRect(0 - border                    , sprPos.y + this.height - border, roomWidth+ border*2, roomHeight- (sprPos.y + this.height)+ border*2);

  }
}




class LosangoAnimator{
  constructor(){
    this.x = 0;
    this.y = 0;

    this.angle = 0;

    this.xScl = 0;
    this.yScl = 0;

    this.hue = 0;
    this.sat = 0;
    this.bri = 0;
  }
}
