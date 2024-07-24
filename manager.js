
const objectsDepth = {
  losango: 0,
  rock: 1,
  bitcoin: 2,
  sun: 3,
  dart: -2,
  usbConnector: -10,
  usbCable: -9
}


class GridObject{
  constructor(gridIndex, object, wid, hei){
    this.index = gridIndex;
    this.object = object;
    this.width = wid;
    this.height = hei;
    this.valid = true;
  }
}


const GRID = Object.freeze(new Enum(
  "MIDDLE",
  "BACK",
  "FRONT",
  "TOTAL"
));

class Manager {
  constructor(){
    this.losWid = 120;
    this.losHei = 120;

    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1; // Months are zero-indexed
    this.day = day;
    this.month = month;

    this.verticalSpace = this.losHei;

    if(isMobile){
      this.losWid = 140;
      this.losHei = 140;
      this.verticalSpace = this.losHei/2;
    }

    this.cols = Math.floor(roomWidth/this.losWid);
    this.rows = 5;


    // Contains the objects in each grid slot
    this.grid      = [];

    this.losangos = [];
    this.losangosGrid = [];
    this.losangosPhy = [];
    this.losangosAnim = [];

    this.minesweeper = new Minesweeper();
    this.endingMinesweeper = false;

    this.hdmiScreen = new HDMIScreen();

    this.drMario = new DrMarioGame();
    this.drMarioPlaying = false;
    this.drMarioScreen = null;


    this.locked = false;

    this.holding = false;
    this.holdingContent = null;
    this.holdingObject = null;

    this.mode = 0;

    this.sortPattern = 0;



    this.altNames = false;
    this.birthdayId = -1;

    this.sunAmount = 0;
    this.bitCoinAmount = 0;
    this.bitCoinToMine = 5;
    this.moneyAmount = 0;





    this.sunDisplay = new SunDisplay();
    this.moneyDisplay = new MoneyDisplay();
    this.inventory = new Inventory();
    this.bitcoinGraph = new BitcoinGraph();

    this.spotlight = new Spotlight();

    this.quietAlarm = new Alarm(0, 2000);
    this.sleepParticleAlarm = new Alarm(0, 50);
    this.sleeping = false;

    this.mouseGrid = -1;
    this.mouseGridAlarm = new Alarm(0, 50);

    this.fadeInAlarm = new Alarm(0, 100);

    this.animAlarm = new Alarm(0, 250);
    this.animWaitAlarm =  new Alarm(0, 2000);

    this.bwoopRealTimeAlarm = new RealTimeAlarm(new Date());

    this.pageScrolled = false;

    this.curtainsState = 1;
    this.curtainsAlarm = new Alarm(0, 300);






    // SOUND MANAGEMENT
    this.winSoundId = 0;
    this.winSoundCharging = false;
    this.winSoundPool = [];

    this.pageSlipStart = Date.now();

    this.poofStart = Date.now();

    this.world = Physics();
    this.worldEdgebounce;
    this.worldGravity; 

    this.prevMousePos = [];
    this.prevMouseLength = 2;


    if(isMobile){
      this.prevMouseLength = 5;
    }

    this.particles = [];
  }


  init(){
    this.curtainsAlarm.start();
    this.bitcoinGraph.init();

    for(let i = 0; i < NAME.TOTAL; i++){
      var pos = this.getPosGrid(i);
      this.losangos.push(new Losango(pos.x, pos.y, i));
      this.losangosGrid.push(i);
      this.losangosPhy.push(null);
      this.losangosAnim.push(new LosangoAnimator());
     

      if(nameMan.persons[i].bday == this.day && nameMan.persons[i].bmonth == this.month){
        this.losangos[i].anniversary = true;
      }

      if(i >= NAME.DIOGO){
        this.losangos[i].inOtherplane = true;
      }
    }

    for(var j = 0 ; j < GRID.TOTAL; j++){
      var subGrid = [];
      for(var i = 0; i < 50; i ++){


        subGrid.push(new GridObject(i, null, 1, 1));
        subGrid[i].valid = false;

      }

      this.grid.push(subGrid);
    }


    for(let i = 0; i < NAME.DIOGO; i++){
      this.grid[GRID.MIDDLE][i] = new GridObject(i, this.losangos[i], 1, 1);
      
    }


    this.worldEdgebounce = Physics.behavior('edge-collision-detection', {
       aabb: Physics.aabb(0,0,roomWidth, roomHeight)
       ,restitution: 0.2
       ,cof: 0.8
   });

   this.worldGravity = Physics.behavior('constant-acceleration');
   this.worldGravity.setAcceleration(new Physics.vector(0, 0.0008));

    this.world.add([
        this.worldGravity
       ,Physics.behavior('body-impulse-response')
       ,Physics.behavior('body-collision-detection')
       ,Physics.behavior('sweep-prune')
       ,this.worldEdgebounce
   ]);

   var screen = new BlockScreen(100, 100, 5, 4);
   //addObject(screen, OBJECT.SCREEN);


   var usbCable = new USBCable(10, 10, 10, 50);
   //addObject(usbCable, OBJECT.USBCABLE);

   
   var motherBoard = new MotherBoard(10, 10);
   //addObject(motherBoard, OBJECT.MOTHERBOARD);

   var midPos = this.getPosGrid(23);
   var midmedlogo = new MedLogo(midPos.x - this.losWid/2, midPos.y - this.losHei/2);
   addObject(midmedlogo, OBJECT.MIDMEDLOGO);
   this.attachObject(midmedlogo, 23, GRID.MIDDLE);

   for(var  i = 0 ; i < this.losangos.length; i++){
      if(!this.losangos[i].attached){
        this.killLosango(i);
      }
   }


  }


  update(dt){

    if(this.holdingObject == null){
      this.holding = false;
    } else if(!this.holdingObject.holder.holded){
      this.holding = false;
    } else if(!this.holdingObject.active){
      this.holding = false;
    }

    var newMouseGrid = this.getMouseGrid();

    for(let i = 0; i < this.losangos.length; i++){
      this.losangos[i].update(dt);
    }

    this.mouseGridAlarm.update(dt);

    if(!this.holding){
      this.mouseGridAlarm.restart();
    }

    if(this.mouseGrid != newMouseGrid){
      this.mouseGrid = newMouseGrid;
      this.mouseGridAlarm.restart();
    }

    

    if(this.drMarioScreen != null){
      if(this.drMarioScreen.cartridge == NAME.BERNAD){
        if(input.keyState[KeyCodes.ArrowLeft][1]){
          this.drMario.inputMove(-1);
        }
    
        if(input.keyState[KeyCodes.ArrowRight][1]){
          this.drMario.inputMove(1);
        }

        if(input.keyState[KeyCodes.ArrowDown][0]){
          this.drMario.inputDown();
        }
    
        if(input.keyState[KeyCodes.Space][1]){
          this.drMario.inputTurn();
        }
    
        this.drMario.update(dt);
      }
    }

    switch(this.mode){
      case 0:

        

        this.animWaitAlarm.update(dt);
        this.animAlarm.update(dt);

        if(this.animWaitAlarm.finished){
          this.animWaitAlarm.stop();
          this.animAlarm.resume();
        }

        if(this.animAlarm.finished){
          this.animWaitAlarm.resume();
          this.animAlarm.stop();
        }

        if(!this.animAlarm.paused){
          var animPerc = this.animAlarm.percentage();
          var animRange = 20;
          var animIndMax = 20;

          for(var i = 0; i < this.losangosAnim.length; i++){
            var row = Math.floor(i / this.cols);
            var col = i % this.cols;

            var animInd = row+col;
            var animStart = -animRange + animPerc*(2*animRange + animIndMax);

            if(animInd > animStart && animInd < animStart + animRange){
              var finalPerc = (animInd - animStart)/animRange;
              var factor = (1 + Math.sin(finalPerc*Math.PI*2 - Math.PI/2))/2;
              factor = factor*factor*factor;
              this.losangosAnim[i].xScl = factor/16;
              this.losangosAnim[i].yScl = factor/16;
            } else {
              this.losangosAnim[i].xScl = 0;
              this.losangosAnim[i].yScl = 0;
            }
          }
        }
        break;

      // MINESWEEPER
      case 1:
        this.minesweeper.update(dt);
        if(this.minesweeper.finished){
          if(!this.endingMinesweeper){
            if(!this.minesweeper.gameover){
              winSounds[WINSND.WIN1].play();

              for(var i = 0; i < 3;i++){
                var coinX = randInt(0, roomWidth);
                var coinY = -100 - randInt(0,500);

                addObject(new Bitcoin(coinX, coinY, randInt(25, 40)), OBJECT.BITCOIN);
              }
              playSound(SND.COINNOISE);
              
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


    this.curtainsAlarm.update(dt);

    this.curtainsState = 1-tweenInOut(this.curtainsAlarm.percentage());


    if(this.bwoopRealTimeAlarm.check()){
      this.bwoopRealTimeAlarm.active = false;
      this.spotlight.active = true;
      playSound(SND.SMWBWOOP);
    }

    this.spotlight.update(dt);
    if(this.spotlight.active){
      if(this.spotlight.width <= -1000){
        this.fadeInAlarm.start();
        this.spotlight.width = 2000;
        this.spotlight.height = 2000;
        this.spotlight.active = false;
      }
    }

    this.fadeInAlarm.update(dt);
    if(this.fadeInAlarm.finished){
      this.fadeInAlarm.stop();
    }

    //this.spotlight.x = input.mouseX;
    //this.spotlight.y = input.mouseY;

    this.hdmiScreen.update(dt);
    if(this.hdmiScreen.hdmi){
      this.mode = 2;
    }

    this.bitcoinGraph.update(dt);

    this.inventory.update(dt);
    if(this.inventory.state == 1){
      camY = -this.inventory.height*this.inventory.inAlarm.percentage();
    } else if(this.inventory.state == 3){
      camY = -this.inventory.height*(1-this.inventory.outAlarm.percentage());
    } else if(this.inventory.state == 2){
      camY = -this.inventory.height;
    } else {
      camY = 0;
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
            this.particles[i].update(dt);
        } else {
          this.particles.splice(i, 1);
          i--;
        }
    }

    // SLEEP
    if(this.mode == 0){
      this.quietAlarm.update(dt);
    } else {
      this.quietAlarm.update(0);
    }

    if(this.quietAlarm.finished){
      this.sleeping = true;
      this.sleepParticleAlarm.update(dt);
    }

    if(this.sleepParticleAlarm.finished){
      this.sleepParticleAlarm.restart();

      var sleepX = this.losangos[NAME.ISRAEL].x;
      var sleepY = this.losangos[NAME.ISRAEL].y;
      if(!this.losangos[NAME.ISRAEL].inOtherplane){
        this.particles.push(new SleepText(sleepX, sleepY));
      }
    }


    this.sunDisplay.update(dt);
    this.moneyDisplay.update(dt);





    for(let i = 0; i < this.losangos.length; i++){
      addList(new DrawRequest(this.losangos[i], this.losangos[i].depth, 0), OBJECT.DRAW);
    }


    // DRAWING PARTICLES
    for (var i = 0; i < this.particles.length; i++) {
        if (this.particles[i].active) {
            addList(new DrawRequest(this.particles[i], this.particles[i].depth, 0), OBJECT.DRAW);
        }
    }
  }


  draw(ctx){

    if(this.mouseGrid != -1 && this.holding && this.holdingContent != null){
      var selectedPos = this.getPosGrid(this.mouseGrid);
      var selectedWid = this.losWid;
      var selectedHei = this.losHei;
      ctx.save();
      ctx.translate(selectedPos.x, selectedPos.y);
      ctx.rotate(deg2rad(45));
      if(this.mouseGridAlarm.finished){
        ctx.strokeStyle = "rgb(50, 255, 50)";
        ctx.strokeRect(-selectedWid/1.8, -selectedHei/1.8, selectedWid*1.125, selectedHei*1.125);
      } else {
        ctx.strokeStyle = "rgb(255, 255, 255)";
      }
      ctx.strokeRect(-selectedWid/2, -selectedHei/2, selectedWid, selectedHei);
      ctx.restore();
    }

    this.inventory.draw(ctx);

    for(let i = 0; i < this.grid[GRID.MIDDLE].length; i++){
      var pos = this.getPosGrid(i);
      sprites[SPR.PIN].drawExt(pos.x, pos.y, 0, 3, 3, 0, 4, 4);
    }
  }

  drawGUI(){
    this.hdmiScreen.draw(ctx);

    this.sunDisplay.draw(ctx);

    this.moneyDisplay.draw(ctx);

    this.bitcoinGraph.draw(ctx);

    this.spotlight.draw(ctx);





    if(isMobile){
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.font = '14px Arial';
      ctx.fillText("MOBILE Version", 30, 10);
    }
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
    for(var i = 0; i < this.grid[GRID.MIDDLE].length; i++){
      this.deattachObject(i, GRID.MIDDLE);
    }
  }

  rockHit(spd){
    if(spd > 5){

      for(var i = 0 ; i < this.grid[GRID.MIDDLE].length; i++){
        if(!this.grid[GRID.MIDDLE][i].valid) continue;
        if(this.grid[GRID.MIDDLE][i].object.type != OBJECT.LOSANGO) continue;

        var dir = new Vector(0,0);
        var amp = spd*randRange(0, 0.2);
        dir.setAngle(deg2rad(randRange(0, 360)));

        this.grid[GRID.MIDDLE][i].object.attachCooldownAlarm.start(randInt(-100, 50));
        this.grid[GRID.MIDDLE][i].object.hspd += 1*amp*dir.x;
        this.grid[GRID.MIDDLE][i].object.vspd += 1*amp*dir.y;
      }

      for(var i = 0; i < objectLists[OBJECT.BITCOIN].length; i++){
        if(objectLists[OBJECT.BITCOIN][i].onGround){
          objectLists[OBJECT.BITCOIN][i].vspd += -spd/2;
        }
      }

      for(var i = 0; i < objectLists[OBJECT.DART].length; i++){
        if(objectLists[OBJECT.DART][i].onGround){
          objectLists[OBJECT.DART][i].vspd += -spd/2;
        }
      }
    }
  }

  sortGrid(){
    playSound(SND.WHISTLE);

    

    for(var i = 0; i < this.grid[GRID.MIDDLE].length; i++){
      if(this.grid[GRID.MIDDLE][i].valid){
        if(this.grid[GRID.MIDDLE][i].object.type == OBJECT.MIDMEDLOGO) continue;
      }
      this.deattachObject(i, GRID.MIDDLE);
    }

    for(var i = 0; i < this.grid[GRID.MIDDLE].length; i++){
      if(this.losangos.length <= i ) continue;
      if(this.losangos[i].inOtherplane) continue;

      this.attachObject(this.losangos[nameMan.orderPattern[this.sortPattern][i]], i, GRID.MIDDLE);

      var updatePacket = new UpdateLosango([
        new PropertyObject("rotating", true),
        new PropertyObject("isTilted", false)]);

      this.losangos[i].updateList.push(updatePacket);
      updatePacket.isFront = true;

    }

    this.sortPattern++;
    if(this.sortPattern >= 4){
      this.sortPattern = 0;
    }
  }

  randomizeGrid(){
    playSound(SND.WHISTLE);


    var losangoIndexes = [];
    for(var i = 0; i < this.grid[GRID.MIDDLE].length; i++){
      if(this.grid[GRID.MIDDLE][i].valid){
        if(this.grid[GRID.MIDDLE][i].object.type == OBJECT.MIDMEDLOGO) continue;
      }
      this.deattachObject(i,GRID.MIDDLE);
    }

    for(var i = 0; i < this.losangos.length; i++){
      if(this.losangos[i].inOtherplane) continue;
      losangoIndexes.push(i);
    }

    var losangoRandomIndexes = [];
    
    for(var i = 0; i < this.grid[GRID.MIDDLE].length; i++){
      var ind = randInt(0, losangoIndexes.length);
      losangoRandomIndexes.push(losangoIndexes[ind]);
      losangoIndexes.splice(ind, 1);
    }
    
    

    for(var i = 0; i < this.grid[GRID.MIDDLE].length; i++){
      if(this.losangos.length <= i ) continue;
      if(this.losangos[i].inOtherplane) continue;

      if(this.grid[GRID.MIDDLE][i].valid) continue;
      if(losangoRandomIndexes.length <= 0) break;

      this.attachObject(this.losangos[losangoRandomIndexes[0]], i, GRID.MIDDLE);
      losangoRandomIndexes.splice(0, 1);

      var updatePacket = new UpdateLosango([
        new PropertyObject("rotating", true),
        new PropertyObject("isTilted", false)]);

      this.losangos[i].updateList.push(updatePacket);
      updatePacket.isFront = true;

    }
  }

  clickParticle(){
    this.particles.push(particleClick(input.mouseX, input.mouseY));
  }

  printGridPattern(){
    var str = "";
    for(var i = 0 ; i < this.grid[GRID.MIDDLE].length; i++){
      if(this.grid[GRID.MIDDLE][i].valid){
        if(this.grid[GRID.MIDDLE][i].object.type == OBJECT.LOSANGO){
          str += this.grid[GRID.MIDDLE][i].object.id;
          if(i != this.grid[GRID.MIDDLE].length-1){
            str += ", ";
          }
        } else {
          console.log("NOT ALL GRID PINS ARE FILLED");
          return;
        }
      } else {
        console.log("NOT ALL GRID PINS ARE FILLED");
        return;
      }
    }

    console.log(str);
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

  metalize(x, y, wid, hei){
    //if(this.screenMaking) return;

    for(var i = 0; i < hei; i++){
      for(var j = 0; j < wid; j++){

        if(!this.checkValidGridPos(x+j, y+i)) continue;

        var gridObj = this.grid[GRID.MIDDLE][this.gridXY2Ind(x+j, y+i)];

        if(gridObj.valid){
          if(gridObj.object.type == OBJECT.LOSANGO){
            var prop = new PropertyObject("screenMode", true);
            var packet = new UpdateLosango([prop]);
            packet.isFront = false;
            packet.waitTime = (i + j)*10;
            gridObj.object.updateList.push(packet);
            if(!gridObj.object.isFullScale && !gridObj.object.scaling){
              gridObj.object.scaling = true;
            }

            if(gridObj.object.isTilted && !gridObj.object.rotating){
              gridObj.object.rotating = true;
            }
          }
        }
      }  
    }
    this.screenMaking = true;
  }

  screenize(startX, startY){

    //console.log("screeninzing");
    var hEnd = false;
    var vEnd = false;
    var hInd = 1;
    var vInd = 1;
    var pos = new Vector(startX-1, startY-1);
    //console.log("Checking " + startX + ", " + startY);
    if (this.checkValidGridPos(pos.x + hInd, pos.y + vInd)) {
      //console.log("Started");
      while (!hEnd || !vEnd) {
        if (!hEnd) {
          for (var i = 0; i < vInd; i++) {
            var xx = pos.x + hInd + 1;
            var yy = pos.y + i    + 1;
            if(this.checkValidGridPos(xx, yy)){
              var newInd = this.gridXY2Ind(xx, yy);
              if (!this.grid[GRID.MIDDLE][newInd].valid || this.grid[GRID.MIDDLE][newInd].object.type != OBJECT.METALBLOCK) {
                hEnd = true;
                break;
              }
            } else {
              hEnd = true;
              break;
            }
          }
          if (!hEnd) hInd++;
        }
    
        if (!vEnd) {
          for (var i = 0; i < hInd; i++) {
            var xx = pos.x + i    + 1;
            var yy = pos.y + vInd + 1;
            if(this.checkValidGridPos(xx, yy)){
              var newInd = this.gridXY2Ind(xx, yy);
              if (!this.grid[GRID.MIDDLE][newInd].valid || this.grid[GRID.MIDDLE][newInd].object.type != OBJECT.METALBLOCK) {
                vEnd = true;
                break;
              }
            } else {
              vEnd = true;
              break;
            }
          }
          if (!vEnd) vInd++;
        }
      }
      //console.log("Results found " + hInd + ", " + vInd);
      if (hInd >= 1 && vInd >= 1) {
        for(var i = 0; i < vInd; i++){
          for(var j = 0; j < hInd; j++){
            var ind = this.gridXY2Ind(startX+j, startY+i);
            this.grid[GRID.MIDDLE][ind].object.active = false;
            this.deattachObject(ind,GRID.MIDDLE);
          }
        }
        var ind = this.gridXY2Ind(startX, startY);
        var screenPos = this.getPosGrid(ind);
        
        if(hInd == 1 || vInd == 1){
          var newPanel = new BlockPanel(screenPos.x - this.losWid/2, screenPos.y - this.losHei/2, hInd, vInd);
          addObject(newPanel, OBJECT.PANEL);
          this.attachObject(newPanel, ind, GRID.BACK);
        } else {
          var newScreen = new BlockScreen(screenPos.x - this.losWid/2, screenPos.y - this.losHei/2, hInd, vInd);
          addObject(newScreen, OBJECT.SCREEN);
          this.attachObject(newScreen, ind, GRID.MIDDLE);
        }

        //screenPos.x -= this.losWid/2;
        //screenPos.y -= this.losHei/2;

        var partPlaces = placesInRect(50*(hInd+vInd), screenPos.x - this.losWid*0.75, screenPos.y - this.losHei*0.75,this.losWid*(hInd+0.5), this.losHei*(vInd+0.5));
        var partList = createParticleWithPlaces(particleLock, partPlaces, 100);
        this.addParticles(partList);

        playSound(SND.POOF);
      }
    }
  }

  startDrMario(screen, wid, hei){
    if(this.drMarioPlaying){
      if(this.drMario.wid != wid || this.drMario.hei != hei){
        this.drMario.init(wid, hei);
      }
      this.drMarioScreen = screen;
    } else {
      this.drMario.init(wid, hei);
      this.drMarioPlaying = true;
      this.drMarioScreen = screen;
    }
  }

  openInventory(){
    this.inventory.state = 1;
    camY = manager.inventory.height;
  }

  closeInventory(){
    this.inventory.state = 3;
    camY = 0;
  }

  breakLogo(logoObj){
    logoObj.active = false;
    this.particles.push(particleLogo(logoObj.x, logoObj.y));
    if(!this.logoBroken){
      for(var i = 2; i < 4; i++){
        for(var j = 3; j < 7; j++){
          var ind = this.gridXY2Ind(j, i);
          this.spawnLosango(ind);
          this.attachObject(this.losangos[ind], ind, GRID.MIDDLE);
          this.losangos[ind].shrinked = true;
          this.losangos[ind].growthAlarm.start();
          this.losangos[ind].growthAlarm.timer = randInt(-150, 0);
        }
      }
      this.logoBroken = true;
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

  collectMoney(amount){
    this.moneyAmount += amount;
    this.moneyDisplay.money = this.moneyAmount;
    this.moneyDisplay.updateMoney();
  }

  winSoundReady(){
    // VICTORY SOUND COOLDOWN
    if(winSounds[this.winSoundId].paused){
      return true;
    }
    return false;
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







  gridInd2XY(ind){
    var x = ind % this.cols;
    var y = Math.floor(ind / this.cols);
    return new Vector(x, y);
  }

  gridXY2Ind(x, y){
    return x + y*this.cols;
  }

  checkValidGridPos(x, y){
    if(x < 0) return false;
    if(x >= this.cols) return false;
    if(y < 0) return false;
    if(y >= this.rows) return false;
    return true;
  }

  checkValidGridArea(x, y, wid, hei){
    if (x < 0 || y < 0) {
      return false;
    }

    if (x + wid > this.cols || y + hei > this.rows) {
      return false;
    }

    return true;
  }


  deattachObject(gridCell, grid){
    //console.log("DEATTACHING OBJECT on " + gridCell);
    if(!this.grid[grid][gridCell].valid) return;

    //console.log(this.grid[gridCell]);
    if(!this.grid[grid][gridCell].object.attached) return;
    
    var wid = this.grid[grid][gridCell].width;
    var hei = this.grid[grid][gridCell].height;
    var ind = this.grid[grid][gridCell].index;
    var pos = this.gridInd2XY(ind);
    var x = pos.x;
    var y = pos.y;

    //console.log("WH(" + wid + ", " + hei + ")");
    //console.log("XY("+ x + ", " + y +")")

    var obj = this.grid[grid][gridCell].object;

    for(var i = 0; i < hei; i++){
      for(var j = 0; j < wid; j++){
        var subInd = this.gridXY2Ind(x + j, y + i);

        if(!this.grid[grid][subInd].valid) continue;

        if(this.grid[grid][subInd].object == obj){
          this.grid[grid][subInd].valid = false;
        }
        
      }
    }

    if(obj.type == OBJECT.LOSANGO){
      this.deattachLosango(obj.id);
    } else {
      obj.attached = false;
    }
    obj.attachGridId = -1;

  }

  killLosango(id){

    if(this.losangos[id].attached){
      this.deattachObject(this.losangos[id].attachGridId, GRID.MIDDLE);
    }

    if(this.losangosPhy[id] != null){
      this.world.remove(this.losangosPhy[id]);
      this.losangosPhy[id] = null;
    }

    
    this.losangos[id].inOtherplane = true;
  }

  spawnLosango(id){
    if(!this.losangos[id].attached){
      var los = this.losangos[id];
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
      this.losangosPhy[id].state.angular.pos = los.angle;
      this.world.add(this.losangosPhy[id]);
    }

    this.losangos[id].inOtherplane = false;
  }

  
  deattachLosango(id){
    const los = this.losangos[id];

    if(this.losangosPhy[id] != null){
      this.world.remove(this.losangosPhy[id]);
      this.losangosPhy[id] = null;
    }

    if(los.inOtherplane){ 
      this.losangos[id].attached = false;
      return;
    }

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

  attachObject(obj, gridCell, grid){

    if(obj.attached) return;

    var wid = 1;
    var hei = 1;

    if(obj.type == OBJECT.SCREEN || obj.type == OBJECT.PANEL){
      wid = obj.hTileNum;
      hei = obj.vTileNum;
      //console.log("SCREEN ATTACH");
    } else if (obj.type == OBJECT.MIDMEDLOGO){
      wid = 4;
      hei = 2;
    }

    var pos = this.gridInd2XY(gridCell);
    var x = pos.x;
    var y = pos.y;

    //console.log("ATTACHING " + obj + " on " + gridCell + " XY("+ x +", "+ y+")");

    // CHECK IF THE OBJECT FITS INSIDE THE SCREEN
    if(!this.checkValidGridArea(x, y, wid, hei)) return false;



    // DEATTACHING THE OBJECTS INSIDE THE AREA OF THE NEW ATTACHMENT
    for(var i = 0; i < hei; i++){
      for(var j = 0; j < wid; j++){
        var subInd = this.gridXY2Ind(x + j, y + i);
        //console.log("DEATTACHING on " + subInd + " TO ATTACH   XY(" + (x+j)+ "," + (y+i) + ")") ;
        this.deattachObject(subInd, grid);
      }
    }

    var gridObj = new GridObject(gridCell, obj, wid, hei);

    // FILLING EACH GRID SQUARE OF THE NEW OBJECT ATTACHMENT AREA
    for(var i = 0; i < hei; i++){
      for(var j = 0; j < wid; j++){
        var subInd = this.gridXY2Ind(x + j, y + i);

        this.grid[grid][subInd] = gridObj;
      }
    }

    if(obj.type == OBJECT.LOSANGO){
      this.attachLosango(obj.id, gridCell);
    } else {
      obj.attached = true;
    }

    obj.attachGridId = gridCell;

   
  }

  attachLosango(id, gridCell){

    if(this.losangosPhy[id] != null){
      this.world.remove(this.losangosPhy[id]);
      this.losangosPhy[id] = null;
    }

    this.losangos[id].attached = true;
    this.losangosGrid[id] = gridCell;
  }


  attachObjectMouse(obj, grid){
    if(this.mouseGrid == -1 || !this.mouseGridAlarm.finished) return;
    //console.log("TRYING TO ATTACH WITH MOUSE " + obj.type);
    this.attachObject(obj, this.mouseGrid, grid);
  }



  addParticles(partList){
    for(var i = 0; i < partList.length; i++){
      this.particles.push(partList[i]);
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
