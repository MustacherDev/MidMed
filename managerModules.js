

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

      this.gridOpenTiming[i] = 5 + (i%this.cols)*10;
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

class JoystickButton{
  constructor(x, y, wid, hei, type){
    this.x = x;
    this.y = y;
    this.width = wid;
    this.height = hei;

    this.clickBox = new BoundingBox(this.x, this.y, this.width, this.height);
    this.clickBox.xOffset = this.width/2;
    this.clickBox.yOffset = this.height/2;

    this.hovered = false;

    this.pressed = false;
    this.released = false;
    this.clicking = false;

    this.type = type;
  }

  update(x, y){
    this.hovered = false;

    this.pressed = false;
    this.released = false;
    this.clicking = false;


    var joyX = x || 0;
    var joyY = y || 0;

    this.clickBox.x = joyX + this.x;
    this.clickBox.y = joyY + this.y;


    if(this.clickBox.isPointInside(input.mouseX, input.mouseY)){
      this.hovered = true;
    }

    if(this.hovered){
      if(input.mouseState[0][0]){
        this.clicking = true;
      }

      if(input.mouseState[0][1]){
        this.pressed = true;
      }

      if(input.mouseState[0][2]){
        this.released = true;    
      }
    }
  }

  draw(ctx, x, y){
    var joyX = x || 0;
    var joyY = y || 0;

    var xx = this.x + joyX;
    var yy = this.y + joyY;

    var spr = sprites[SPR.JOYBUTTONS];

    var xScl = spr.width/this.width;
    var yScl = spr.height/this.height;

    sprites[SPR.JOYBUTTONS].drawExtRelative(xx, yy, this.type, xScl, yScl, 0, 0.5, 0.5);
  }
}

class ScreenJoystick{
  constructor(){
    this.x = 0;
    this.y = 0;
    
    this.buttons = [];

    this.buttonsState = [];
  }
}

class HDMIScreen{
  constructor(){
    this.whiteBars = [];
    this.glitchLevel = 0;
    this.glitchMax = 100;
    this.hdmi = false;
    this.barTick = 0;

    this.state = 0;


    this.reconnectTime = 500;
    this.reconnectTimer = 0;
    this.reconnectLag = 0;
    this.reconnectLagTimer = 0;
    this.reconnectStatus = 0;

    this.joystick = new ScreenJoystick();
  }

  glitch(){
    this.glitchLevel += 20;
    if(chance(this.glitchLevel/this.glitchMax)){
      var barNum = 1 + randInt(1, 3);
    
      playSound(SND.GLITCHHIT);

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
        this.state = 1;
        manager.losangos[NAME.JP].connector = true;
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
        this.state = 0;
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

    if(this.state == 0){
      ctx.fillStyle = "rgb(255,255,255)";

      for(var i = 0; i < this.whiteBars.length; i++){
        ctx.fillRect(0,this.whiteBars[i].x, roomWidth, this.whiteBars[i].y);
      }
    } else if(this.state == 1){

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
      }
    } else if (this.state == 2){
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
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
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
    ctx.textBaseline = "middle";
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
    this.height = 120;
    this.x = roomWidth/4;
    this.y = -this.height;
    this.displacement = this.height;
    

    this.state = 0;

    this.inTime = 50;
    this.stayTime = 400;
    this.outTime = 50;

    this.timer = 0;


    this.displayText = [];
    for(var i = 0 ; i < 3; i++){
      this.displayText.push("");
    }

    
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
        this.displayText[0] = "Cheat";
        this.displayText[1] = "on";
        this.displayText[2] = "Minesweeper";
      } else {
        this.displayText[0] = "Trapaceando";
        this.displayText[1] = "no";
        this.displayText[2] = "Campo Minado";
      }
    } else if (type == ACHIEVEMENT.FIRSTTRADE){
      this.displayIcon = 1;

      if(manager.altNames){
        this.displayText[0] = "";
        this.displayText[1] = "PIX $$$";
        this.displayText[2] = "";
      } else {
        this.displayText[0] = "";
        this.displayText[1] = "PIX R$";
        this.displayText[2] = "";
      }
    }else if (type == ACHIEVEMENT.FULLMETAL){
      this.displayIcon = 2;

      if(manager.altNames){
        this.displayText[0] = "";
        this.displayText[1] = "Fullmetal Alchemist";
        this.displayText[2] = "";
      } else {
        this.displayText[0] = "";
        this.displayText[1] = "METALISTA";
        this.displayText[2] = "";
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
    ctx.textBaseline = "top";
    
    for(var i = 0 ; i < 3; i++){
      ctx.fillText(this.displayText[i], this.x - wid/2 + slotSize + 32*scl, this.y + this.yOff + (hei/3)*i);
    }

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



class Curtain{
  constructor(orientation){

    this.progress = 0;
    this.orientation = orientation;

    this.wid = 0;
    this.hei = 0;
  }

  draw(ctx){

    var curtainExtraHei = 20;
    var curtainWid = (window.innerWidth - canvasSclX*roomWidth)/2;
    var curtainHei = window.innerHeight + curtainExtraHei;
    var curtainScl = curtainHei/sprites[SPR.CURTAIN].height;
    var curtainExtraX = 20;
  
    var canvasSpace = window.innerWidth - curtainWid*2;
  
    var curtainsState = this.progress;
  
    
    if(this.orientation == 0){
      sprites[SPR.CURTAIN].drawExt(curtainWid + curtainExtraX + (canvasSpace/2)*curtainsState,-curtainExtraHei/2, 0, curtainScl, curtainScl, 0, sprites[SPR.CURTAIN].width, 0);
    } else {
      sprites[SPR.CURTAIN].drawExt(window.innerWidth - curtainWid - curtainExtraX - (canvasSpace/2)*curtainsState,-curtainExtraHei/2, 0, curtainScl, curtainScl, 0, 0, 0);
    }
  }
}

class CurtainManager{
  constructor(){
    this.curtainRight = new Curtain(0);
    this.curtainLeft  = new Curtain(1);
  }
}

class OpeningSequence{
  constructor(){
    // OPENING SEQUENCE
    this.curtainSpotlight = new Spotlight();
    this.curtainSpotlight.width = 500;
    this.curtainSpotlight.height = 500;
    this.curtainSpotlight.screenWidth = window.innerWidth;
    this.curtainSpotlight.screenHeight = window.innerHeight;
    this.curtainSpotlight.x = this.curtainSpotlight.screenWidth/2;
    this.curtainSpotlight.y = this.curtainSpotlight.screenHeight/2;
    this.curtainSpotlight.active = true;

    this.openingAlarm = new Alarm(0, 300);
    this.openingCooldownAlarm = new Alarm(0, 25);
    this.openingAlarm.paused = true;
    this.spotWobbleAlarm = new Alarm(0, 400);

    this.finished = false;
  }

  update(dt){
    this.spotWobbleAlarm.update(dt);
    this.openingCooldownAlarm.update(dt);
    
    this.openingAlarm.update(dt);
    this.curtainSpotlight.update(dt);

    if(this.spotWobbleAlarm.finished){
      this.spotWobbleAlarm.restart();
    }

    if(this.openingAlarm.paused){
      if(this.openingCooldownAlarm.finished){
        if(input.mouseState[0][1]){
          this.openingAlarm.start();
        }
      }
    }

    this.curtainSpotlight.x = (window.innerWidth/2) + 100*(Math.cos(this.spotWobbleAlarm.percentage()*Math.PI*2));
    this.curtainSpotlight.y = (window.innerHeight/2) - 50 + 50*(1+Math.sin(this.spotWobbleAlarm.percentage()*Math.PI*4));

    manager.curtainState = 1-tweenInOut(this.openingAlarm.percentage());
    this.curtainSpotlight.width = 500 + 2000*this.openingAlarm.percentage();
    this.curtainSpotlight.height = this.curtainSpotlight.width;


    if(this.openingAlarm.finished){
      this.curtainSpotlight.active = false;
      this.finished = true;
    }

  }
}

class ScreenShaker{
  constructor() {
    this.intensity = 0;
    this.duration = 0;
    this.elapsedTime = 0;
    this.shaking = false;
  }

  startShake(intensity, duration) {
    this.intensity = intensity;
    this.duration = duration;
    this.elapsedTime = 0;
    this.shaking = true;
  }

  update(dt, camera) {
    if (this.shaking) {
      this.elapsedTime += dt;
      if (this.elapsedTime >= this.duration) {
        this.shaking = false;
        this.intensity = 0;
      } else {
        // Calculate shake offset based on intensity, elapsed time, and frequency
        const t = this.elapsedTime / this.duration;
        const amplitude = this.intensity * (1 - t); 
        const angle = Math.random() * Math.PI * 2;
        const offsetX = amplitude * Math.cos(angle);
        const offsetY = amplitude * Math.sin(angle);

        // Apply offset to camera or game world
        camera.addPos(offsetX,offsetY);
      }
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

    this.colors = [new Color(255,255,255), new Color(100, 100, 200), new Color(80, 80, 80)];
    

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
      this.finished = true;
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

    if(this.finished){
      var finishText = "GAME WON!";
      if(this.gameover){
        finishText = "GAMEOVER";
      }
      manager.particles.push(particleCodenamesHint(roomWidth/2, roomHeight/2, finishText));
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

    manager.particles.push(particleCodenamesHint(roomWidth/2, roomHeight/2, hintText));

    return hintText;
  }

  getGrid(){
    this.gameover = false;
    this.finished = false;
    this.guessing = false;
    this.guessNum = 0;

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

// class DataVisualizer{
//   constructor(){
//     this.x = 0;
//     this.y = 0;
//     this.width = 100;
//     this.height = 100;
//     this.textLines = [];
//     this.lastObj = null;
//   }

//   getObjectData(obj){
//     if(this.lastObj === obj) return;

//     this.textLines = [];
//     if(obj.type == OBJECT.LOSANGO){
//       this.textLines.push("x:" + obj.x + " y:" + obj.y);
//       this.textLines.push("ang:" + obj.angle);
//       this.textLines.push("CdName:" + obj.codenamesMode);
//       this.textLines.push("Hover:" + obj.hovered);
//       this.textLines.push("Front:" + obj.flipActor.isFront);
//     }
//   } 

//   update(dt){

//   }

//   draw(ctx){

//   }


// }





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
