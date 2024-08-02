

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
    this.yOff = 0;
    this.height = 200;
    this.y = -this.height;
    this.displacement = this.height*0.9;
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
        this.yOff = this.displacement*tweenOut(this.timer/this.inTime);
        if(this.timer > this.inTime){
          this.timer = 0;
          this.state = 2;
        }
        break;

      // STAYING
      case 2:
        this.timer+= dt;
        this.yOff = this.displacement;
        if(this.timer > this.stayTime){
          this.timer = 0;
          this.state = 3;
        }
        break;

      // LEAVING
      case 3:
        this.timer+= dt;
        this.yOff = this.displacement*tweenOut(1-(this.timer/this.outTime));
        if(this.timer > this.outTime){
          this.timer = 0;
          this.state = 0;
        }
        break;
    }
  }

  draw(ctx){

    if(this.state == 0) return;

    var scl = this.height/sprites[SPR.SUNDISPLAY].height
    var wid = sprites[SPR.SUNDISPLAY].width*scl;
    var prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = tweenOut(this.yOff/this.displacement);
    sprites[SPR.SUNDISPLAY].drawExt(this.x, this.y + this.yOff, 0, scl, scl, 0, 0, 0);
    sprites[SPR.SUN].drawExtRelative(this.x + wid/2, this.y + this.yOff + wid/2, 0, 1, 1, 0, 0.5,0.5);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "48px Fixedsys";
    ctx.fontAlign = "center";
    ctx.fontBaseline = "middle";
    ctx.fillText(this.sun, this.x + wid/2, this.y + this.yOff + this.height*0.8);

    ctx.globalAlpha = prevAlpha;

  }
}

class WeatherManager{
  constructor(){
    this.season = 0;


  }

  update(dt){
    if(this.season == 0){
      
    }
  }

  draw(ctx){

  }
}



class MoneyDisplay{
  constructor(){

    this.yOff = 0;
    this.height = 100;
    this.x = roomWidth-550;
    this.y = -this.height;
    this.displacement = this.height*0.9;
    this.money = 0;

    this.state = 0;

    this.inTime = 50;
    this.stayTime = 400;
    this.outTime = 50;

    this.timer = 0;
  }

  updateMoney(){
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
        this.yOff = this.displacement*tweenOut(this.timer/this.inTime);
        if(this.timer > this.inTime){
          this.timer = 0;
          this.state = 2;
        }
        break;

      // STAYING
      case 2:
        this.timer+= dt;
        this.yOff = this.displacement;
        if(this.timer > this.stayTime){
          this.timer = 0;
          this.state = 3;
        }
        break;

      // LEAVING
      case 3:
        this.timer+= dt;
        this.yOff = this.displacement*tweenOut(1-(this.timer/this.outTime));
        if(this.timer > this.outTime){
          this.timer = 0;
          this.state = 0;
        }
        break;
    }
  }

  draw(ctx){

    if(this.state == 0) return;

    var scl = this.height/sprites[SPR.MONEYDISPLAY].height
    var wid = sprites[SPR.MONEYDISPLAY].width*scl;
    var hei = sprites[SPR.MONEYDISPLAY].height*scl;
    var prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = tweenOut(this.yOff/this.displacement);
    sprites[SPR.MONEYDISPLAY].drawExt(this.x, this.y + this.yOff, 0, scl, scl, 0, 0, 0);
    sprites[SPR.MONEY].drawExtRelative(this.x + hei/2, this.y + this.yOff + hei/2, 0, 1, 1, 0, 0.5,0.5);
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "48px Fixedsys";
    ctx.textAlign = "left";
    ctx.fontBaseline = "middle";
    ctx.fillText(zeroPad(this.money, 12), this.x + hei*1.2, this.y + this.yOff + hei/2);

    ctx.globalAlpha = prevAlpha;
  }
}


const ACHIEVEMENT = Object.freeze(new Enum(
  "CHEATMINESWEEPER",
  "FIRSTTRADE",
  "FULLMETAL",
  "TOTAL"
));




class AchievementManager{
  constructor(){

    this.yOff = 0;
    this.height = 200;
    this.x = roomWidth/2;
    this.y = -this.height;
    this.displacement = this.height;
    

    this.state = 0;

    this.inTime = 50;
    this.stayTime = 400;
    this.outTime = 50;

    this.timer = 0;


    this.displayText = "";
    this.displayIcon = 0;

    this.achievements = [];
    for(var i = 0; i < ACHIEVEMENT.TOTAL; i++){
      this.achievements.push(false);
    }

  }

  getAchievement(type){
    if(this.achievements[type]) return;

    if(this.state == 0){
      this.state = 1;
      this.timer = 0;
    } else if (this.state == 2){
      this.timer = 0;
    } else if (this.state == 3){
      this.state = 1;
      this.timer = (1-(this.timer/this.outTime))*this.inTime;
    }

    this.achievements[type] = true;

    if(type == ACHIEVEMENT.CHEATMINESWEEPER){
      this.displayIcon = 0;

      if(manager.altNames){
        this.displayText = "Cheat on Minesweeper";
      } else {
        this.displayText = "Trapaceando no Campo minado";
      }
    } else if (type == ACHIEVEMENT.FIRSTTRADE){
      this.displayIcon = 1;

      if(manager.altNames){
        this.displayText = "Pix";
      } else {
        this.displayText = "Pix";
      }
    }else if (type == ACHIEVEMENT.FULLMETAL){
      this.displayIcon = 2;

      if(manager.altNames){
        this.displayText = "Fullmetal Alchemist";
      } else {
        this.displayText = "Metalista";
      }
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
          this.yOff = this.displacement*tweenOut(this.timer/this.inTime);
          if(this.timer > this.inTime){
            this.timer = 0;
            this.state = 2;
          }
          break;

        // STAYING
        case 2:
          this.timer+= dt;
          this.yOff = this.displacement;
          if(this.timer > this.stayTime){
            this.timer = 0;
            this.state = 3;
          }
          break;

        // LEAVING
        case 3:
          this.timer+= dt;
          this.yOff = this.displacement*tweenOut(1-(this.timer/this.outTime));
          if(this.timer > this.outTime){
            this.timer = 0;
            this.state = 0;
          }
          break;
      }
  }

  draw(ctx){

    if(this.state == 0) return;
    var spr = sprites[SPR.ACHIEVEMENTDISPLAY];
    var scl = this.height/spr.height
    var wid = spr.width*scl;
    var hei = spr.height*scl;
    var prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = tweenOut(this.yOff/this.displacement);
    spr.drawExtRelative(this.x, this.y + this.yOff, 0, scl, scl, 0, 0.5, 0);
    var iconSpr = sprites[SPR.ACHIEVEMENTICONS];

    var slotSize = 85 * scl;

    var iconWid = iconSpr.width;
    var iconScl = slotSize/iconWid;

    iconSpr.drawExtRelative(this.x - wid/2 + 16*scl + slotSize/2, this.y + this.yOff + 16*scl + slotSize/2, this.displayIcon, iconScl, iconScl, 0, 0.5, 0.5);
  
    ctx.fillStyle = "rgb(255,255,255)";
    ctx.font = "30px Fixedsys";
    ctx.textAlign = "left";
    ctx.fontBaseline = "middle";
    ctx.fillText(this.displayText, this.x - wid/2 + slotSize + 32*scl, this.y + this.yOff + hei/2);

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
    
  
    this.width = roomWidth;
    
    this.slotsX = 10;
    this.slotsY = 2;

    this.slotWid = this.width/(this.slotsX+1);
    this.slotHei = this.slotWid;

    this.height = this.slotHei*this.slotsY;
    

    this.inAlarm = new Alarm(0, 100);
    this.outAlarm = new Alarm(0, 100);

    this.cooldownAlarm = new Alarm(0, 5);

    this.hoveredSlot =  new Vector(-1, -1);


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

    this.boundingBox = new BoundingBox(this.x, this.y, this.width-this.slotWid, this.height);
    this.closeBoundingBox = new BoundingBox(this.x + this.slotWid*this.slotsX, this.y, this.slotWid, this.slotHei*2);
  }

  attachObjectMouse(obj){
    if(!this.cooldownAlarm.finished) return;

    if(this.hoveredSlot.x == -1 || this.hoveredSlot.y == -1) return;
    
    if(!obj.active) return; 

    if(this.slots[this.hoveredSlot.y][this.hoveredSlot.x].valid) return;

    this.slots[this.hoveredSlot.y][this.hoveredSlot.x].valid = true;

    obj.active = false;
    this.slots[this.hoveredSlot.y][this.hoveredSlot.x].object = obj;

    this.cooldownAlarm.restart();
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

    this.cooldownAlarm.update(dt);

    if(this.boundingBox.isPointInside(input.mouseX, input.mouseY)){
      var slotInd = 0;
      var dx = input.mouseX - this.x;
      var dy = input.mouseY - this.y;

      var indX = Math.floor(dx/this.slotWid);
      var indY = Math.floor(dy/this.slotHei);

      this.hoveredSlot.x = indX;
      this.hoveredSlot.y = indY;

      if(this.cooldownAlarm.finished){
        if(input.mouseState[0][1] && manager.holding == false){
          if(this.slots[this.hoveredSlot.y][this.hoveredSlot.x].valid){
            var obj = this.slots[this.hoveredSlot.y][this.hoveredSlot.x].object;
            obj.active = true;
            
            obj.onRespawn();
            addObject(obj, obj.type);

            this.slots[this.hoveredSlot.y][this.hoveredSlot.x].valid = false;
            this.slots[this.hoveredSlot.y][this.hoveredSlot.x].object = null;

            this.cooldownAlarm.restart();
          }
        }
      }
    } else {
      this.hoveredSlot.x = -1;
      this.hoveredSlot.y = -1;
    }

    if(this.closeBoundingBox.isPointInside(input.mouseX, input.mouseY)){
      if(input.mouseState[0][1] && this.state == 2){
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

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    var closeButtonImg = 0;
    //ctx.fillStyle = "rgb(200, 100, 100)";
    if(this.closeBoundingBox.isPointInside(input.mouseX, input.mouseY)){
      closeButtonImg = 1;
      //ctx.fillStyle = "rgb(150, 50, 50)";
    }
    //ctx.fillRect(this.closeBoundingBox.x, this.closeBoundingBox.y, this.closeBoundingBox.width, this.closeBoundingBox.height);
    var closeScl = this.closeBoundingBox.width/sprites[SPR.CLOSEINVENTORYBUTTON].width;
    sprites[SPR.CLOSEINVENTORYBUTTON].drawExt(this.closeBoundingBox.x, this.closeBoundingBox.y, closeButtonImg, closeScl,closeScl, 0, 0, 0);


    for(var i = 0; i < this.slotsY; i++){
      for(var j = 0 ; j < this.slotsX; j++){

        var slot = this.slots[i][j];

        var xx= this.x + j*this.slotWid;
        var yy = this.y + i*this.slotHei;

      
        ctx.fillStyle = "rgb(100, 100, 100)";
        if(i == this.hoveredSlot.y && j == this.hoveredSlot.x){
          ctx.fillStyle = "rgb(60, 60, 60)";
        }

        var perc = 0.85;
        ctx.fillRect(xx +this.slotWid*(1-perc)/2, yy + this.slotHei*(1-perc)/2, this.slotWid*perc, this.slotHei*perc);

        var frameScl = this.slotWid/sprites[SPR.SCREENFRAMETILE].width;
        sprites[SPR.SCREENFRAMETILE].drawExtRelative(xx + this.slotWid/2, yy + this.slotHei/2, 12, frameScl,frameScl, 0, 0.5, 0.5);
        if(slot.valid){
          sprites[SPR.INVENTORYITEMS].drawExt(xx + this.slotWid/2, yy + this.slotHei/2, slot.object.type-4, 4,4, 0, 8, 8);
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

    this.screenWidth = roomWidth;
    this.screenHeight = roomHeight;

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

    ctx.fillRect(0 - border                    , 0 - border                     , this.screenWidth + border*2, sprPos.y + border*2);
    ctx.fillRect(sprPos.x + this.width - border, sprPos.y - border              , this.screenWidth - (sprPos.x + this.width)+ border*2, this.height+ border*2);
    ctx.fillRect(0 - border                    , sprPos.y - border              , sprPos.x+ border*2, this.height+ border*2);
    ctx.fillRect(0 - border                    , sprPos.y + this.height - border, this.screenWidth+ border*2, this.screenHeight- (sprPos.y + this.height)+ border*2);

  }
}



class BitcoinGraph{
  constructor(){
    this.x = 0;
    this.y = 0;
    this.width  = roomWidth;
    this.height = roomHeight;

    this.value = 1;
    this.maxValue = 10000;
    this.minValue = 1;

    this.tickAlarm = new Alarm(0, 50);
    this.ticks = 0;

    this.variationNum = 5;
    this.variationTickSpread = 8;
    this.variations = [];

    this.prevValueNum = 25;
    this.prevValues = [];

    this.graphLabels = 8;

    this.visible = false;
  }

  init(){
    this.tickAlarm.start();

    for(var i = 0; i < this.variationNum; i++){
      this.variations.push(0);
    }

    for(var i = 0; i < this.prevValueNum; i++){
      this.prevValues.push(Math.floor(this.maxValue/4));
    }

    this.value = this.prevValues[0];

  }

  update(dt){
    //this.width -= this.spd*dt;
    //this.height -= this.spd*dt;

    this.tickAlarm.update(dt);
    if(this.tickAlarm.finished){
      this.tick();
      this.tickAlarm.restart();
    }
  }

  tick(){
    var newValue = this.value;
    for(var i = 0; i < this.variationNum; i++){
      // ADDING CURRENT VARIATION
      newValue += this.variations[i];

      // CALCULATING NEW VARIATION VALUE
      if(this.ticks%((i*this.variationTickSpread) + 1) == 0){
        this.variations[i] = randInt(-100, 100)*((i)+1);
      }
    }

    this.value = clamp(newValue, this.minValue, this.maxValue);

    this.prevValues.shift();
    this.prevValues.push(this.value);
  }

  draw(ctx){
    if(!this.visible) return;
    this.drawGraph(this.x, this.y, this.width, this.height);
  } 

  drawGraph(ctx, x, y, width, height){
    
    ctx.strokeStyle = "rgb(255, 0, 0)";

    ctx.strokeRect(x, y, width, height);
    var lineWid = ctx.lineWidth;
    ctx.lineWidth = 4;
    for(var i = 0; i < this.prevValueNum-1; i++){
      var y1 = y + (1-(this.prevValues[i]/this.maxValue))*height; 
      var y2 = y + (1-(this.prevValues[i+1]/this.maxValue))*height;
      var x1 = x + (i/this.prevValueNum)*width;
      var x2 = x + ((i+1)/this.prevValueNum)*width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.lineWidth = lineWid;
   
    for(var i = 0; i < this.graphLabels; i++){
      //var label = Math.floor(this.minValue + (i/this.graphLabels)*(this.maxValue-this.minValue));
      var labelHei = height/this.graphLabels;
      var yy = y + height*(1 - (i/this.graphLabels));

      ctx.fillStyle = "rgba(0,0,0, " + (1-(i/this.graphLabels))/2 + ")";
      
      ctx.fillRect(x, yy, width, labelHei);
    }
   

    
    for(var i = 0; i < this.graphLabels; i++){
      var label = Math.floor(this.minValue + (i/this.graphLabels)*(this.maxValue-this.minValue));
      var yy = y + height*(1 - (i/this.graphLabels));

      ctx.fillStyle = "rgb(255, 0, 0)";
      ctx.textBaseline = "bottom";
      ctx.font = ((isMobile) ? "22" : "20") + "px Arial";
      ctx.fillText(label, x + width*0.1, y + height*(1 - (i/this.graphLabels)));

      ctx.strokeStyle = "rgb(100, 40, 0)";
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.lineTo(x + width, yy);
      ctx.stroke();
    }
    
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
    this.playerPill = null;

    this.stepAlarm = new Alarm(0,5);
    this.inputStepAlarm = new Alarm(0, 1);

    this.pillSpd = 0.25;
    this.pillStep = 0;

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

    this.playerPill = new DrMarioPlayerPill(DRMARIOCOLOR.RED, DRMARIOCOLOR.BLUE, 0, 0, 0);
    this.playerPill.x = Math.floor(this.wid/2)-1;
    this.playerPill.y = 0;
    this.playerPill.part1 = new DrMarioObj(DRMARIOTYPE.DOUBLEPILL, randInt(0,3));
    this.playerPill.part2 = new DrMarioObj(DRMARIOTYPE.DOUBLEPILL, randInt(0,3));
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

  inputDown(){
    this.pillSpd = 1;
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

    try{
    if(this.playerPill.orientation == 0){

      if(this.checkPillCollision(this.playerPill.x, this.playerPill.y, 1)){
        if(this.checkPillCollision(this.playerPill.x-1, this.playerPill.y, 1)){
          this.playerPill.x --;
          this.playerPill.orientation = 1;
        }
      } else {
        this.playerPill.orientation = 1;
      }



    } else {


      if(this.checkPillCollision(this.playerPill.x, this.playerPill.y, 0)){
        if(this.checkPillCollision(this.playerPill.x-1, this.playerPill.y, 0)){
          this.playerPill.x --;
          this.playerPill.orientation = 0;
          var temp = this.playerPill.part1;
          this.playerPill.part1 = this.playerPill.part2;
          this.playerPill.part2 = temp;
        }
      } else {
        this.playerPill.orientation = 0;
        var temp = this.playerPill.part1;
        this.playerPill.part1 = this.playerPill.part2;
        this.playerPill.part2 = temp;
      }
      //this.playerPill.orientation = 0;

     
    }
    } catch{
      console.log("AGGG");
    }

    this.toTurn = false;
  }


  checkPillCollision(x, y, ori){
    var oriAdd = [new Vector(1,0), new Vector(0, -1)];

    var pill1 = new Vector(x, y);
    var pill2 = new Vector(x + oriAdd[ori].x, y + oriAdd[ori].y);


    try{
    if(pill1.x < 0 || pill1.x >= this.wid){
      return true;
    }

    
    if(pill1.y >= this.hei){
      return true;
    }


    if(this.grid[pill1.y][pill1.x].type != DRMARIOTYPE.EMPTY){
      return true;
    }



    if(pill2.x < 0 || pill2.x >= this.wid){
      return true;
    }

    
    if(pill2.y >= this.hei){
      return true;
    }

    if(this.grid[pill2.y][pill2.x].type != DRMARIOTYPE.EMPTY){
      return true;
    }
  } catch{
    console.log(pill1);
    console.log(pill2);
  }

    return false;
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
              this.pillStep += this.pillSpd;

              if(this.pillStep >= 1){
                this.pillStep--;
                this.playerPill.y++;
              }

              this.pillSpd = 0.25;
            } else {
              this.placePlayer();
            }
          } else{
            this.pillStep += this.pillSpd;

            if(this.pillStep >= 1){
              this.pillStep--;
              this.playerPill.y++;
            }

            this.pillSpd = 0.25;
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
              count = 1;
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
        for (var j = 0; j < this.wid; j++) {
          var lastColor = -1;
          var count = 0;
          var startIndex = -1;

          for (var i = 0; i < this.hei; i++) {
            var type = this.grid[i][j].type;
            var color = this.grid[i][j].color;

            if (type === DRMARIOTYPE.EMPTY) {
              if (count >= 4) {
                for (var k = startIndex; k < i; k++) {
                  this.grid[k][j].destroying = true;
                }
                sequences++;
              }

              count = 0;
              lastColor = -1;
              startIndex = -1;

              continue;
            }

            if (lastColor === -1) {
              lastColor = color;
              count = 1;
              startIndex = i;
              continue;
            } else {
              if (lastColor === color) {
                count++;
              } else {
                if (count >= 4) {
                  for (var k = startIndex; k < i; k++) {
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

          if (count >= 4) {
            for (var k = startIndex; k < this.hei; k++) {
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
              }
            }
          }
        }

        // CHECK IF NEXT STEP WILL HAVE PILL FALLING UPDATES
        for(var i = this.hei-2; i > 0; i--){
          for(var j = 0; j < this.wid; j++){
            var type = this.grid[i][j].type;
            if(type == DRMARIOTYPE.EMPTY || type == DRMARIOTYPE.VIRUS) continue;
            if(type == DRMARIOTYPE.PILL){
              if(this.grid[i+1][j].type == DRMARIOTYPE.EMPTY){
                moved = true;
                break;
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

    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(x,y, ww, hh);

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



// REALLY HARD, NEEDS LOT OF DETERMINATION

// PSEUDOCODE WITH MUSIC
// WE GET A LIST OF NAMES (TO UNCOVER)
// WE ALSO KNOW WHICH OF THOSE NAMES ARE BLUE
// WITH THAT LIST WE SEARCH THROUGH THE HINT LIST
// WE NEED A SCORE SYSTEM
// IF A HINT HAVE 100% ON BLACK DISCARD IT (WHAT IF THERE ARE NO HINTS LEFT???)
// I HAVE TO ANALIZE BASED ON PROBABILITY ORDER
// IF A HINT IS FOR 3 NAMES, I EXPECT TO CLICK ON THE 3 WITH THE HIGHEST PROBABILITY
// BUT WE NEED TO HAVE A ERROR MARGIN (I COULD CLICK FIRST ON A 0.2 PROBABILITY THEN ON A 0.4)
// THE (HINT + NUM) SCORE:
// 3 FIRST PROBABILITIES SUMMED, BUT CONSIDER THAT IF ONE BLANK OR BLACK IS IN THE MIDDLE THEY ANULLATE THE REST
// MINUS OTHER PROBABILITIES (THAT ARE BLANKS)
// MINUS BLACK PROBABILITY 

class CodenamesCell{
  constructor(nameId, team, opened = false){
    this.nameId = nameId;
    this.team = team;
    this.opened = opened;
  }
}

class Codenames{
  constructor(){
   
    this.currentHint = "";
    this.guessNum = 0;

    this.finished = false;
    this.gameover = false;
    this.guessing = false;

    // MAP NAME ONTO GRID
    this.nameMap = [];
  
    this.grid = [];
    

  }

  checkFinish(){
    for(var i = 0; i < this.grid.length; i++){
      var cell = this.grid[i];
      if(!cell.opened){
        if(cell.team == 1) return false;
      }
    }
    return true;
  }

  reveal(nameId){
    var team = this.grid[this.nameMap[nameId]].team;
    if(team == 2){
      this.gameover = true;
    } else if(team == 0){
      this.guessing = false;
    }

    this.grid[this.nameMap[nameId]].opened = true;

    this.guessNum--;

    if(this.guessNum <= 0){
      this.guessing = false;
    }

    if(this.checkFinish()){
      this.finished = true;
    } else {
      if(!this.gameover && !this.guessing){
        this.getHint();
      }
    }


  }

  getHint(){
    var bestScore = 0;
    var bestHintId = 0
    var bestNum = 0;

    var blueLeft = 0;
    for(var i = 0; i < this.grid.length; i++){
      if(this.grid[i].opened) continue;
      if(this.grid[i].team == 1) blueLeft++;
    }

    for(var i = 0; i < nameMan.codenamesHints.length; i++){
      for(var j = 1; j <= blueLeft; j++){
        var score = this.evaluateHint(this.grid, nameMan.codenamesHints[i].probUnits, j);
        //.log(score + " " + nameMan.codenamesHints[i].hint + " " + j);
        if(score > bestScore){
          bestScore = score;
          bestHintId = i;
          bestNum = j;
        }
      }  
    }

    var hintText = nameMan.codenamesHints[bestHintId].hint + " " + bestNum; 
    console.log(hintText);
    this.currentHint = hintText;
    this.guessNum = bestNum;
    this.guessing = true;
    return hintText;
  }

  getGrid(){
    this.nameMap = [];
    for(var i = 0; i < NAME.TOTAL; i++){
      this.nameMap.push(-1);    
    }


    this.grid = [];
    for(var i = 1; i < 5; i++){
      for(var j = 3; j < 7; j++){
        var ind = j + i*manager.cols;
        var gridObj = manager.grid[GRID.MIDDLE][ind];
        if(!gridObj.valid) continue;
        if(gridObj.object.type != OBJECT.LOSANGO) continue;
        this.grid.push(new CodenamesCell(gridObj.object.id, 0));
        this.nameMap[gridObj.object.id] = this.grid.length-1;
        gridObj.object.codenames();
      } 
    }



    var totalCodenames = this.grid.length;

    var blackRand = randInt(0, totalCodenames);
    this.grid[blackRand].team = 2;
    this.finished = false;

    var blueNames = Math.floor(totalCodenames/3);
    for(var i = 0; i < blueNames; i++){
      var randInd = randInt(0, totalCodenames);
      if(this.grid[randInd].team == 0){
        this.grid[randInd].team = 1;
      } else {
        i--;
      }
    }
  }

  draw(ctx){
    ctx.strokeRect();
  }


  // HERE COMES SOME RECURSION
  // what is need?
  // List with hints and 
  
  branchGrid(grid, cell2Open){
    var newGrid = [];
    for(var i = 0; i < grid.length; i++){
      var newCell = new CodenamesCell(grid[i].nameId, grid[i].team, grid[i].opened);
      newGrid.push(newCell);
    }
    newGrid[cell2Open].opened = true;
    return newGrid;
  }

  branchUnits(units, removeId){
    var newUnits = [];
    for(var i = 0; i < units.length; i++){
      var nameList = [];
      for(var j = 0; j < units[i].nameList.length; j++){
        nameList.push(units[i].nameList[j]);
      }
      var newUnit = new CodenamesProbUnit(nameList, units[i].prob);
      newUnits.push(newUnit);
    }
    newUnits.splice(removeId, 1);
    return newUnits;
  }

  evaluateHint(grid, probUnits, num){
    var score = 0;

    if(num == 0){
      return this.evaluateGrid(grid);
    }

    var childScores = [];
    var minScore = -10;
    for(var i = 0 ; i < probUnits.length; i++){

      var name = probUnits[i].nameList[0];
      var mappedInd = this.nameMap[name];
      if(mappedInd == -1 || mappedInd >= this.grid.length) continue;

      var cell = this.grid[mappedInd];
      
      if(cell.opened) continue;

      if(cell.team == 2){
        childScores.push([minScore, probUnits[i].prob]);
      } else if (cell.team == 0){
        var staticScore = this.evaluateGrid(grid);
        childScores.push([staticScore, probUnits[i].prob]);
      } else {
        var newUnits = this.branchUnits(probUnits, i);
        var newGrid = this.branchGrid(grid, mappedInd);
        var childScore = this.evaluateHint(newGrid, newUnits, num-1);
        childScores.push([childScore, probUnits[i].prob])
      }
    }

    if(childScores.length == 0){
      return this.evaluateGrid(grid);
    }

    var probabilitySum = 0;
    for(var i = 0; i < childScores.length; i++){
      probabilitySum += childScores[i][1];
    }

    for(var i = 0; i < childScores.length; i++){
      score += childScores[i][0]/probabilitySum;
    }


    return score;
  }

  evaluateGrid(grid){
    var score = 0;
    for(var i = 0; i < grid.length; i++){
      if(!grid[i].opened) continue;
      if(grid[i].team != 1) continue;

      score++;
      
    }

    return score;
  }

  hintNumScore(hint, num, walkthrough = false){
    var score = 0;
    var lastProb = 0;
    var whitePenalty = 1;
    var blackPenalty = 1;

    if(walkthrough){
      console.log(hint.hint + " " + num);
    }
    for(var i = 0; i < hint.probUnits.length; i++){
      
      var prob = hint.probUnits[i].prob;
      var extra = ( i >= num) ? true:false;

      
      for(var j = 0; j < hint.probUnits[i].nameList.length; j++){

        var name = hint.probUnits[i].nameList[j];
        var mappedInd = this.nameMap[name];
        if(mappedInd == -1 || mappedInd >= this.grid.length) continue;

        var cell = this.grid[mappedInd];
        
        if(cell.opened) continue;


        // 0 WHITE, 1 BLUE, 2 
        if(walkthrough){
          console.log(nameMan.persons[name].name + " [" + (prob*100) + "%]");
        }

        if(!extra){
          if(cell.team == 0){
            whitePenalty *= (1 - 0.5*prob);
            score -= 0.2*prob;
            if(walkthrough){
              console.log("WHITE (" + whitePenalty + ")   Score " + score);
            }
          } else if (cell.team == 1){
            score += prob*whitePenalty*blackPenalty;
            if(walkthrough){
              console.log("BLUE  Score " + score);
            }
          } else {
            score -= 0.9*prob*whitePenalty;
            blackPenalty *= (1 - 0.9*prob);
            if(walkthrough){
              console.log("BLACK (" + blackPenalty + ")   Score " + score);
            }
          }
        } else {
          // AFTER ALL THE NAMES INDICATED ARE SELECTED
          // THE REST IS RESIDUAL
          // ONLY WORDS ABOVE THE THRESHHOLD WILL BE CONSIDERED
          if(prob + 0.2 >= lastProb){
            if(walkthrough){
              console.log("Extras.. ");
            }
            if(cell.team == 0){
              whitePenalty *= (1 - 0.2*prob); 
              score -= 0.2*prob;
            } else if (cell.team == 1){
              score += prob*whitePenalty*blackPenalty;
            } else {
              score -= 0.2*prob*whitePenalty;
              blackPenalty *= (1 - 0.9*prob);
            }
          }
        }

        if(i < num){
          lastProb = prob;
        }
      
      }

    
    }
    return score;
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
