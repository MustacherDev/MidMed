

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


    // Contains the id of the losangos attached
    this.grid = [];

    this.losangos = [];
    this.losangosGrid = [];
    this.losangosPhy = [];
    this.losangosAnim = [];

    this.minesweeper = new Minesweeper();
    this.endingMinesweeper = false;

    this.hdmiScreen = new HDMIScreen();


    this.locked = false;

    this.holding = false;
    this.holdingContent = null;

    this.mode = 0;

    this.altNames = false;
    this.birthdayId = -1;

    this.sunAmount = 0;
    this.bitCoinAmount = 0;
    this.bitCoinToMine = 5;
    this.moneyAmount = 0;


    this.sunDisplay = new SunDisplay();

    this.spotlight = new Spotlight();

    this.quietAlarm = new Alarm(0, 2000);
    this.sleepParticleAlarm = new Alarm(0, 50);
    this.sleeping = false;

    this.mouseGrid = -1;
    this.mouseGridAlarm = new Alarm(0, 25);

    this.fadeInAlarm = new Alarm(0, 100);

    this.animAlarm = new Alarm(0, 250);
    this.animWaitAlarm =  new Alarm(0, 2000);


    this.winSoundId = 0;
    this.winSoundCharging = false;
    this.winSoundPool = [];

    this.world = Physics();
    this.worldEdgebounce;

    this.prevMousePos = [];
    this.prevMouseLength = 2;

    if(isMobile){
      this.prevMouseLength = 5;
    }

    this.particles = [];
  }


  init(){
    for(let i = 0; i < NAME.TOTAL; i++){
      var pos = this.getPosGrid(i);
      this.losangos.push(new Losango(pos.x, pos.y, i));
      this.losangosGrid.push(i);
      this.losangosPhy.push(null);
      this.losangosAnim.push(new LosangoAnimator());
      this.grid.push([i]);
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


  update(input){
    this.holding = false;

    var newMouseGrid = this.getMouseGrid();

    for(let i = 0; i < this.losangos.length; i++){
      this.losangos[i].update(input);
    }

    this.mouseGridAlarm.update();

    if(!this.holding){
      this.mouseGridAlarm.restart();
    }

    if(this.mouseGrid != newMouseGrid){
      this.mouseGrid = newMouseGrid;
      this.mouseGridAlarm.restart();
    }

    switch(this.mode){
      case 0:

        this.animWaitAlarm.update();
        this.animAlarm.update();

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



    this.spotlight.update();
    if(this.spotlight.active){
      if(this.spotlight.width <= 0){
        this.fadeInAlarm.start();
        this.spotlight.active = false;
      }
    }

    this.fadeInAlarm.update();
    if(this.fadeInAlarm.finished){
      this.fadeInAlarm.stop();
    }

    //this.spotlight.x = input.mouseX;
    //this.spotlight.y = input.mouseY;

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
    if(this.mode == 0){
      this.quietAlarm.update(1);
    } else {
      this.quietAlarm.update(0);
    }

    if(this.quietAlarm.finished){
      this.sleeping = true;
      this.sleepParticleAlarm.update();
    }

    if(this.sleepParticleAlarm.finished){
      this.sleepParticleAlarm.restart();

      var sleepX = this.losangos[NAME.ISRAEL].x;
      var sleepY = this.losangos[NAME.ISRAEL].y;

      this.particles.push(new SleepText(sleepX, sleepY));
    }


    this.sunDisplay.update();





    for(let i = 0; i < this.losangos.length; i++){
      addList(this.losangos[i], OBJECT.DRAW);
    }


    // DRAWING PARTICLES
    for (var i = 0; i < this.particles.length; i++) {
        if (this.particles[i].active) {
            addList(this.particles[i], OBJECT.DRAW);
        }
    }
  }


  draw(ctx){

    if(this.mouseGrid != -1 && this.holding && this.holdingContent == 1){
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

    for(let i = 0; i < this.losangosGrid.length; i++){
      //if(this.losangosGrid[i].inPlace) continue;

      var pos = this.getPosGrid(i);
      sprites[SPR.PIN].drawExt(pos.x, pos.y, 0, 2, 2, 0, 4, 4);
    }
  }

  drawGUI(){
    this.hdmiScreen.draw(ctx);

    this.sunDisplay.draw(ctx);

    if(isMobile){
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.font = '14px Arial';
      ctx.fillText("MOBILE Version", 30, 10);
    }

    this.spotlight.draw(ctx);

    //drawAlarm(ctx, this.animAlarm, roomWidth/2, 0, 150);

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
        if(this.losangos[i].attached){
          this.deattachLosango(i);
        }
    }

    for(var i = 0; i < this.losangos.length; i++){

      this.attachLosango(i, i);


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

  winSoundReady(){
    // VICTORY SOUND COOLDOWN
    if(winSounds[manager.winSoundId].paused){
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

    findAndRemove(this.grid[this.losangosGrid[id]], id);
    this.losangos[id].attached = false;
  }

  attachLosango(id, gridCell){

    if(this.grid[gridCell].length > 0){
      var copyGrid = [...this.grid[gridCell]];
      for(var i = 0;  i < copyGrid.length; i++){
        if(this.losangos[copyGrid[i]].attached){
          this.deattachLosango(copyGrid[i]);
        }
      }
    }


    if(this.losangosPhy[id] != null){
      this.world.remove(this.losangosPhy[id]);
    }

    this.losangos[id].attached = true;


    this.grid[gridCell].push(id);

    //var temp = this.losangosGrid[id];
    this.losangosGrid[id] = gridCell;
    //this.losangosGrid[gridCell] = temp;
  }





  attachLosangoMouse(id){
    if(this.mouseGrid == -1 || !this.mouseGridAlarm.finished) return;
    this.attachLosango(id, this.mouseGrid);
  }
}

function findAndRemove(arr, value){
  for(var i = 0; i < arr.length; i++){
    if(arr[i] == value){
      arr.splice(i, 1);
      i--;
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
