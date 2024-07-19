

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
      
      //if(chance(this.glitchLevel/this.glitchMax)){
        playSound(SND.GLITCHHIT);
      //} else {
      //  
      //}
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

    if(!this.hdmi){
      if(this.glitchLevel >= this.glitchMax){
        this.hdmi = true;

        //playSound(SND.STATICHIT);
      }
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
      var screenLines = 100;
      var lineSpace = roomHeight/screenLines;
      for(var i = 0; i < screenLines; i++){
        ctx.fillRect(0, i*lineSpace, roomWidth, 2);
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


      if(manager.drMarioPlaying){
        var wid = manager.drMario.wid;
        var hei = manager.drMario.hei;
        var ratio = wid/hei;

        var screenRatio = roomWidth/roomHeight;

        var finalWid = 0;
        var finalHei = 0;
        if(screenRatio > ratio){
          finalHei = roomHeight;
          finalWid = ratio*finalHei;
        } else {
          finalWid = roomWidth;
          finalHei = finalWid/ratio;
        }
        manager.drMario.draw(roomWidth/2 - finalWid/2, 0, finalWid, finalHei);
      }
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
    var prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = tweenOut(this.yOff/this.height);
    sprites[SPR.SUNDISPLAY].drawSimple(this.x, this.y + this.yOff, 0, scl);
    sprites[SPR.SUN].drawRot(this.x + wid/2, this.y + this.yOff + wid/2, 0, 1, 1, 0, true);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "48px Fixedsys";
    ctx.fontAlign = "center";
    ctx.fontBaseline = "middle";
    ctx.fillText(this.sun, this.x + wid/2, this.y + this.yOff + this.height*0.8);

    ctx.globalAlpha = prevAlpha;


    // ctx.fillRect(this.x, this.y + this.yOff, this.width, this.height);
    // ctx.fillStyle = "rgb(0,0,0)";
    // ctx.fillRect(this.x, this.y + this.yOff, this.width, this.height);
  }
}

class InventorySlot{
  constructor(){
    this.valid = false;
    this.object = null;
  }
}

class Inventory{
  constructor(){
    this.x = 0;
    this.y = roomHeight;
    this.height = 200;
    this.width = roomWidth;

    this.slotsX = 10;
    this.slotsY = 2;

    this.slotWid = this.width/this.slotsX;
    this.slotHei = this.height/this.slotsY;

    this.inAlarm = new Alarm(0, 100);
    this.outAlarm = new Alarm(0, 100);


    // 0 = INNACTIVE, 1 = IN, 2 = ACTIVE, 3= OUT
    this.state = 0;

    this.slots = [];
    for(var i = 0; i < this.slotsY; i++){
      var row = [];

      for(var j = 0 ; j < this.slotsX; j++){
        row.push(new InventorySlot());
      }
      this.slots.push(row);
    }

    this.boundingBox = new BoundingBox(this.x, this.y, this.width, this.height);
    this.closeBoundingBox = new BoundingBox(this.x, this.y - this.slotHei, this.slotWid, this.slotHei);
  }


  update(dt){

    if(this.state == 1){
      this.inAlarm.update(dt);
    } else if (this.state == 3){
      this.outAlarm.update(dt);
    }

    if(this.outAlarm.finished){
      this.active = false;
      this.state = 0;
      this.outAlarm.restart();
    }

    if(this.inAlarm.finished){
      this.state = 2;
      this.inAlarm.restart();
    }

    if(this.state == 0) return;


    if(this.boundingBox.isPointInside(input.mouseX, input.mouseY)){
      var slotInd = 0;
      var dx = input.mouseX - this.x;
      var dy = input.mouseY - this.y;

      var indX = Math.floor(dx/this.slotWid);
      var indY = Math.floor(dy/this.slotHei);
    }

    if(this.closeBoundingBox.isPointInside(input.mouseX, input.mouseY)){
      if(input.mouseState[0][1]){
        manager.closeInventory();
      }

    }
  }



      

  draw(ctx){

    if(this.state == 0) return;

    var scl = this.height/sprites[SPR.SUNDISPLAY].height
    var wid = sprites[SPR.SUNDISPLAY].width*scl;
    var prevAlpha = ctx.globalAlpha;

    var perc = 1;

    if(this.state == 1){
      perc = this.inAlarm.percentage();
    } else if(this.state == 3){
      perc = 1-this.outAlarm.percentage();
    }

    ctx.globalAlpha = tweenOut(perc);

    ctx.fillStyle = "rgb(150, 150, 150)";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    for(var i = 0; i < this.slotsY; i++){
      for(var j = 0 ; j < this.slotsX; j++){

        var slot = this.slots[i][j];

        var xx= this.x + j*this.slotWid;
        var yy = this.y + i*this.slotHei;

      
        ctx.fillStyle = "rgb(100, 100, 100)";
        var perc = 0.8;
        ctx.fillRect(xx +this.slotWid*(1-perc)/2, yy + this.slotHei*(1-perc)/2, this.slotWid*perc, this.slotHei*perc);

        if(slot.valid){
          sprites[SPR.INVENTORYITEMS].drawExt(xx + this.slotWid/2, yy + this.slotHei/2, slot.object.type-2, 4,4, 0, 8, 8);
        }
      }
    }

  

    ctx.globalAlpha = prevAlpha;


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


// Temporary Dr Mario object

const DRMARIOTYPE = Object.freeze(new Enum(
  "EMPTY",
  "VIRUS",
  "PILL",
  "DOUBLEPILL",
  "TOTAL"
));

const DRMARIOCOLOR = Object.freeze(new Enum(
  "BLUE",
  "GREEN",
  "RED",
  "TOTAL"
));

class DrMarioObj{
  constructor(type, color, orientation = 0){
    this.type = type;
    this.color = color;
    this.orientation = orientation;
    this.updated = false;
    this.destroying = false;
  }
}

class DrMarioPlayerPill{
  constructor(color1, color2, orientation, x, y){
    this.x = x;
    this.y = y;
    this.part1 = new DrMarioObj(DRMARIOTYPE.DOUBLEPILL, color1);
    this.part2 = new DrMarioObj(DRMARIOTYPE.DOUBLEPILL, color2);
    this.orientation = orientation;
  }
}

class DrMarioGame{
  constructor(wid, hei){
    this.wid = wid;
    this.hei = hei;
    this.grid = [];
    this.nextPill = null;
    this.playerPill = new DrMarioPlayerPill(DRMARIOCOLOR.RED, DRMARIOCOLOR.BLUE, 0, 0, 0);

    this.stepAlarm = new Alarm(0, 20);
    this.inputStepAlarm = new Alarm(0, 1);

    this.placingPill = false;

    // 0 == PLACING PILL, 1 == CHECKING SEQUENCES, 2 == DESTROYING PILLS, 3 == FALLING PHYSICS
    this.runState = 0;

    this.gameover = false;

    this.ready = false;

    this.toMove = 0;
    this.toTurn = 0;
  }

  init(wid, hei){
    this.wid = wid;
    this.hei = hei;
    for(var i = 0; i < this.hei; i++){
      var row = [];
      for(var j = 0; j < this.wid; j++){
        if(chance(0.4) && i > this.hei/2){
          row.push(new DrMarioObj(1, randInt(0, 3)));
        } else {
          row.push(new DrMarioObj(0,0));
        }
      }
      this.grid.push(row);
    }
    this.ready = true;
  }

  placePlayer(){
    var pill1 = this.playerPill.part1;
    var pill2 = this.playerPill.part2;
    var vertical = this.playerPill.orientation;

    var type = pill1.type;
    var color = pill1.color;

    this.grid[this.playerPill.y][this.playerPill.x] = new DrMarioObj(pill1.type, pill1.color, vertical ? 1:0);
    var addX = 1;
    var addY = 0;
    if(this.playerPill.orientation == 1){
      addX = 0;
      addY = -1;
    }

    if(this.playerPill.y + addY >= 0){
      this.grid[this.playerPill.y + addY][this.playerPill.x + addX] = new DrMarioObj(pill2.type, pill2.color, (vertical ? 1:0)+2);
    }

    this.runState = 1;

    this.playerPill.x = Math.floor(this.wid/2)-1;
    this.playerPill.y = 0;
    this.playerPill.part1 = new DrMarioObj(DRMARIOTYPE.DOUBLEPILL, randInt(0,3));
    this.playerPill.part2 = new DrMarioObj(DRMARIOTYPE.DOUBLEPILL, randInt(0,3));
    this.orientation = randInt(0, 2);
  }

  inputMove(dir){
    if(this.runState == 0){
      this.toMove = dir;
    }
  }

  inputTurn(){
    if(this.runState == 0){
      this.toTurn = true;
    }
  }

  stepMove(){
    if(this.toMove == 0) return;

    this.playerPill.x += this.toMove;
    var vertical = this.playerPill.orientation;

    this.playerPill.x = clamp(this.playerPill.x, 0, this.wid-1-(1-vertical));

    var xx = this.playerPill.x;
    var yy = this.playerPill.y;

    if(this.grid[yy][xx].type != DRMARIOTYPE.EMPTY){
      this.playerPill.x -= this.toMove;
      return;
    }



    if(vertical){
      if(yy-1 >= 0){
        if(this.grid[yy - 1][xx].type != DRMARIOTYPE.EMPTY){
          this.playerPill.x -= this.toMove;
          return;
        }
      }
    } else {
      if(this.grid[yy][xx+1].type != DRMARIOTYPE.EMPTY){
        this.playerPill.x -= this.toMove;
        return;
      }
    }


    this.toMove = 0;
  }

  stepTurn(){

    if(!this.toTurn) return;

    if(this.playerPill.orientation == 0){
      this.playerPill.orientation = 1;
    } else {
      this.playerPill.orientation = 0;

      var temp = this.playerPill.part1;
      this.playerPill.part1 = this.playerPill.part2;
      this.playerPill.part2 = temp;
    }

    this.toTurn = false;
  }

  update(dt){
    if(!this.ready) return;

    this.inputStepAlarm.update(dt);

    if(this.inputStepAlarm.finished){
      this.inputStepAlarm.start();

      if(this.runState == 0){

        this.stepMove();
        this.stepTurn();
      }
    }

    this.stepAlarm.update(dt);
    if(this.stepAlarm.finished){
      this.stepAlarm.start();

      if(this.runState == 0){

        this.stepMove();
        this.stepTurn();

        if(this.playerPill.y == this.hei-1){
          this.placePlayer();
        }
        if(this.grid[this.playerPill.y+1][this.playerPill.x].type == DRMARIOTYPE.EMPTY){
          if(this.playerPill.orientation == 0){
            if(this.grid[this.playerPill.y+1][this.playerPill.x+1].type == DRMARIOTYPE.EMPTY){
              this.playerPill.y++;
            } else {
              this.placePlayer();
            }
          } else{
            this.playerPill.y++;
          }
        } else {
          this.placePlayer();
        }
      } else if (this.runState == 1){
        var sequences = 0;

        // HORIZONTAL SEQUENCES
        for(var i = 0; i < this.hei; i++){
          var lastColor = -1;
          var count = 0;
          var startIndex = -1;
          for(var j = 0; j < this.wid; j++){
            var type = this.grid[i][j].type;
            var color = this.grid[i][j].color;



            if(type == DRMARIOTYPE.EMPTY){
              if(count >= 4){
                for(var k = startIndex; k < j; k++){
                  this.grid[i][k].destroying = true;
                }
                sequences++;
              }

              count = 0;
              lastColor = -1;
              startIndex = -1;


              continue;
            }

            if(lastColor == -1){
              lastColor = color;
              count++;
              startIndex = j;
              continue;
            } else {
              if(lastColor == color){
                count++;
              } else {
                if(count >= 4){
                  for(var k = startIndex; k < j; k++){
                    this.grid[i][k].destroying = true;
                  }
                  sequences++;
                }

                lastColor = color;
                count = 1;
                startIndex = j;


              }
            }
          }


          if(count >= 4){
            for(var k = startIndex; k < this.wid; k++){
              this.grid[i][k].destroying = true;
            }
            sequences++;
          }
        }

        // VERTICAL SEQUENCES
        for(var j = 0; j < this.wid; j++){
          var lastColor = -1;
          var count = 0;
          var startIndex = -1;
          for(var i = 0; i < this.hei; i++){
            var type = this.grid[i][j].type;
            var color = this.grid[i][j].color;



            if(type == DRMARIOTYPE.EMPTY){
              if(count >= 4){
                for(var k = startIndex; k < i; k++){
                  this.grid[k][j].destroying = true;
                }
                sequences++;
              }

              count = 0;
              lastColor = -1;
              startIndex = -1;


              continue;
            }

            if(lastColor == -1){
              lastColor = color;
              count++;
              startIndex = i;
              continue;
            } else {
              if(lastColor == color){
                count++;
              } else {
                if(count >= 4){
                  for(var k = startIndex; k < j; k++){
                    this.grid[k][j].destroying = true;
                  }
                  sequences++;
                }

                lastColor = color;
                count = 1;
                startIndex = i;


              }
            }
          }


          if(count >= 4){
            for(var k = startIndex; k < this.hei; k++){
              this.grid[k][j].destroying = true;
            }
            sequences++;
          }
        }

        if(sequences == 0) {
          this.runState = 0;
        } else {
          this.runState = 2;
          //console.log(this.grid);
        }


      } else if (this.runState == 2){
        for(var i = 0; i < this.hei; i++){
          for(var j = 0; j < this.wid; j++){
            if(this.grid[i][j].destroying){
              this.grid[i][j] = new DrMarioObj(0,0);
            }
          }
        }

        var or2Vec = [new Vector(1,0), new Vector(0,-1), new Vector(-1,0), new Vector(0, 1)];

        for(var i = 0; i < this.hei; i++){
          for(var j = 0; j < this.wid; j++){
            if(this.grid[i][j].type == DRMARIOTYPE.DOUBLEPILL){
              var vec = or2Vec[this.grid[i][j].orientation];

              if(this.grid[i+vec.y][j+vec.x].type == DRMARIOTYPE.EMPTY){
                this.grid[i][j].type = DRMARIOTYPE.PILL;
                this.grid[i][j].orientation = 0;
              }
            }
          }
        }
        this.runState = 3;
      } else if (this.runState == 3){
        // CHECKING BOTTOM FIRST
        // FALLING SAND PHYSICS
        var moved = false;
        for(var i = this.hei-2; i > 0; i--){
          for(var j = 0; j < this.wid; j++){
            var type = this.grid[i][j].type;
            if(type == DRMARIOTYPE.EMPTY || type == DRMARIOTYPE.VIRUS) continue;
            if(type == DRMARIOTYPE.PILL){
              if(this.grid[i+1][j].type == DRMARIOTYPE.EMPTY){
                this.grid[i+1][j] = this.grid[i][j];
                this.grid[i][j] = new DrMarioObj(DRMARIOTYPE.EMPTY,0);
                moved = true;
              }
            }
          }
        }

        if(!moved) this.runState = 1;
      }
    }
  }

  draw(xx,yy,ww,hh){
    var x = xx;
    var y = yy;
    var w = ww/this.wid;
    var h = hh/this.hei;
    var scl = w/sprites[SPR.DRMARIOSHEET].width;

    for(var i = 0; i < this.hei; i++){
      for(var j = 0; j < this.wid; j++){
        var obj = this.grid[i][j];

        var type = obj.type;
        var color = obj.color;
        var angle = 0;
        var extraImg = 0;

        if(type == DRMARIOTYPE.DOUBLEPILL){
          var or = obj.orientation%2;
          angle = -(Math.PI/2)*or;

          if(obj.orientation >= 2){
            extraImg = 1;
          }
        }

        if(obj.type != 0){
          sprites[SPR.DRMARIOSHEET].drawExt(x+w*j +4*scl, y+h*i +4*scl, (type+extraImg-1) + color*4, scl,scl,angle,4,4);
        }
      }
    }

    var px = this.playerPill.x;
    var py = this.playerPill.y;
    var pill1 = this.playerPill.part1;
    var pill2 = this.playerPill.part2;

    var vertical = this.playerPill.orientation;

    var type = pill1.type;
    var color = pill1.color;

    var angle = -(Math.PI/2)*vertical;


    if(type != DRMARIOTYPE.EMPTY){
      sprites[SPR.DRMARIOSHEET].drawExt(x+w*px+ 4*scl, y+h*py+ 4*scl, (type-1) + color*4, scl,scl,angle,4,4);
    }

    type = pill2.type;
    color = pill2.color;

    var addPos = new Vector(1, 0);
    if(vertical){
      addPos = new Vector(0, -1);
    }

    angle = -(Math.PI/2)*vertical;
    if(type != DRMARIOTYPE.EMPTY){
      sprites[SPR.DRMARIOSHEET].drawExt(x+w*(px+addPos.x) + 4*scl, y+h*(py+addPos.y) + 4*scl, (type) + color*4, scl,scl,angle,4,4);
    }
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
