


const LSTATE = Object.freeze(new Enum(
    "MINESWEEPER",
    "SHOPMODE",
    "NAME",
    "TOTAL"
));


class Effector{
  constructor(){
    
  }

  shopEffects(los, rightClick){
    if(!los.isFront){

      if(manager.moneyAmount >= los.priceTag){
        manager.moneyAmount -= los.priceTag;

        var pos = manager.getPosGrid(los.getGridId());
        los.backItem.x = pos.x;
        los.backItem.y = pos.y;
        addObject(los.backItem, los.backItem.type);


        playSound(SND.POP);
        manager.clickParticle();

        los.backItem = null;
      }

      los.shopMode = false;
      los.flip(1);
    } else {

      los.shopMode = false;
      los.flip(2);
    }
  }

  minesweeperEffects(los, rightClick){
    if(rightClick){
      manager.flagMinesweeper(manager.losangosGrid[los.id]);
      return;
    }


    if(!los.locked){
      los.flip(1);
      los.locked = true;
      //los.open = true;
      manager.exposeMinesweeper(manager.losangosGrid[los.id]);
    }

    if(los.id == NAME.LUIS){
      manager.minesweeper.exposeAll();
    }
    return;
  }

  effect(los, rightClick){
    if(los.minesweeper){
      this.minesweeperEffects(los, rightClick);
      return;
    }

    if(los.shopMode){
      this.shopEffects(los, rightClick);
      return;
    }


    if(los.id == NAME.WILLISTON){
      if(chance(0.2)){
        los.sneezing = true;
        return;
      }

      if(los.sneezing){
        playSound(SND.KNOCK);
        manager.clickParticle();
        return;
      } 

      manager.altNames = !manager.altNames;
      for(var i = 0; i < manager.losangos.length; i++){
          var id = manager.losangos[i].id;
          if(nameMan.persons[id].altName != nameMan.persons[id].name){
            var updatePacket = new UpdateLosango([new PropertyObject("useAltName", manager.altNames)]);
            updatePacket.isFront = true;
            manager.losangos[i].updateList.push(updatePacket);
          }
      }
    } else if(los.id == NAME.LUIS){
      manager.initMinesweeper(manager.losangosGrid[los.id]);
    } else if(los.id == NAME.JOAS){
      playSound(SND.KNOCK);
      manager.clickParticle();
      if(chance(manager.bitCoinToMine/10)){
        manager.bitCoinToMine--;
        var coinX = randInt(0, roomWidth);
        var coinY = -100;
        addObject(new Bitcoin(coinX, coinY, randInt(25, 40)), OBJECT.BITCOIN);
        playSound(SND.COINNOISE);
      }
    }else if(los.id == NAME.NATHALIA){
      var row = manager.gridInd2XY(manager.losangosGrid[los.id]).y;
      if(chance(1 -  ((row/manager.rows)))){
        var sunX = randInt(0, roomWidth);
        var sunY = -100;
        addObject(new Sun(sunX, sunY), OBJECT.SUN);
        
        manager.clickParticle();
        playSound(SND.POP);
      } else {
        los.flip();
      }
    } else if(los.id == NAME.VICTORIA){
      if(manager.winSoundReady()){
        playSound(SND.POP);
        var newWinSound = randInt(0, WINSND.TOTAL);

        if(los.popInAlarm.paused){
          los.popInAlarm.start();
          los.popInAlarm.timer = Math.floor(los.popInAlarm.time/5);
        }

        var partPos = manager.getPosGrid(los.getGridId());

        for(var i = 0; i < 50; i++){
          manager.particles.push(particleConfetti(partPos.x, partPos.y));
        }



        manager.winSoundId = (newWinSound == manager.winSoundId) ? (newWinSound+1)%WINSND.TOTAL : newWinSound;
        //manager.winSoundId = WINSND.SMW;
        winSounds[manager.winSoundId].play();

        if(manager.winSoundId == WINSND.SMW){
          manager.spotlight.x = partPos.x;
          manager.spotlight.y = partPos.y;
          manager.spotlight.width = 1500;
          manager.spotlight.height = 1500;

          var now = new Date();
          manager.bwoopRealTimeAlarm.time = new Date(now.getTime() + 1000 + 1000*winSounds[manager.winSoundId].duration);
          manager.bwoopRealTimeAlarm.active = true;


          manager.spotlight.spd = manager.spotlight.width/((sounds[SND.SMWBWOOP].duration() - 0.2)*FRAMERATE);
          manager.spotlight.active = false;
        }
      }
    } else if(los.id == NAME.LAIS){
      var directions = [
        new Vector(1, -1),
        new Vector(-1, -1),
        new Vector(-1, 1),
        new Vector(1, 1),
      ];

      for(var i = 0; i < directions.length; i++){
        var pos = manager.gridInd2XY(los.getGridId());
        pos.x += directions[i].x;
        pos.y += directions[i].y;

        if(manager.checkValidGridPos(pos.x, pos.y)){
          var sideInd = manager.gridXY2Ind(pos.x, pos.y);
          var sideGridObj = manager.grid[GRID.MIDDLE][sideInd];
          if(sideGridObj.valid){
            if(sideGridObj.object.type == OBJECT.LOSANGO){
              var sideId = sideGridObj.object.id;

              sideGridObj.object.shop();
            }
          }
        }
      }
      los.flip(1);
      los.blackHole();
      
    } else if(los.id == NAME.CAIO){
      if(los.useAltName){
        //playSound(SND.FALL);
        manager.fall();
      } else {
        if(input.mouseState[0][1]){
          manager.clickParticle();
        }    
      }

    } else if (los.id == NAME.ALICE){
      manager.sortGrid();
    } else if (los.id == NAME.FGOIS){
      manager.randomizeGrid();
    } else if (los.id == NAME.JP){
      playSound(SND.KNOCK);
      manager.clickParticle();
      manager.glitch();

    } else if(los.id == NAME.HENRIQUE){
      if(manager.pageScrolled){
        window.scrollTo(0, 0);
        manager.pageScrolled = false;
      } else {
        window.scrollTo(0, 1);
        manager.pageScrolled = true;
      }
      los.flip();
    } else if(los.id == NAME.JVROCHA){

      playSound(SND.KNOCK);
      manager.clickParticle();
      if(objectLists[OBJECT.ROCK].length > 0) return;
      var rockX = roomWidth/2;
      var rockY = -2500;
      addObject(new Rock(rockX, rockY, 300, 100), OBJECT.ROCK);
      playSound(SND.FALLINGROCK);
    } else if(los.id == NAME.ISRAEL){
      if(manager.sleeping && manager.mode == 0){
        if(los.attached){
          manager.deattachObject(los.getGridId(), GRID.MIDDLE);
          playSound(SND.POP);
        }
      } else {
        los.flip();
      }
    } else if (los.id == NAME.EUDA){
      manager.openInventory();
      los.flip();
    } else if (los.id == NAME.BERNAD){
      if(los.useAltName){
        if(!manager.losangos[NAME.ISRAEL].inOtherplane){
          var pos = new Vector(manager.losangos[NAME.ISRAEL].x,manager.losangos[NAME.ISRAEL].y);
          manager.addParticles(createParticlesInRect(particleLock, 20, pos.x, pos.y, 0, 0));
          manager.quietAlarm.timer = manager.quietAlarm.time;
          playSound(SND.POOF);
        }
      }
      los.flip();
    } else if (los.id == NAME.SAMUEL){

      var directions = [
        new Vector(1, 0),
        new Vector(1, -1),
        new Vector(0, -1),
        new Vector(-1, -1),
        new Vector(-1, 0),
        new Vector(-1, 1),
        new Vector(0, 1),
        new Vector(1, 1),
      ];

      for(var i = 0; i < directions.length; i++){
        var pos = manager.gridInd2XY(los.getGridId());
        pos.x += directions[i].x;
        pos.y += directions[i].y;

        if(manager.checkValidGridPos(pos.x, pos.y)){
          var sideInd = manager.gridXY2Ind(pos.x, pos.y);
          var sideGridObj = manager.grid[GRID.MIDDLE][sideInd];
          if(sideGridObj.valid){
            if(sideGridObj.object.type == OBJECT.LOSANGO){
              var sideId = sideGridObj.object.id;

              var validIds = [NAME.JOAS, NAME.ANDRE, NAME.LUIS, NAME.MATHEUS, NAME.HENRIQUE, NAME.GABRIEL, NAME.BERNAD, NAME.FSANCHEZ, NAME.RAFAEL];
              var canSlap = false;
              for(var j = 0; j < validIds.length; j++){
                if(sideId == validIds[j]){
                  canSlap = true;
                  break;
                }
              }

              if(canSlap){
                sideGridObj.object.hspd += 10*directions[i].x;
                sideGridObj.object.x += 10*directions[i].x;
                sideGridObj.object.vspd += 10*directions[i].y;
                sideGridObj.object.y += 10*directions[i].y;
                manager.particles.push(particleSmack(sideGridObj.object.x, sideGridObj.object.y));
                playSound(SND.SLAP);
              } 
            }
          }
        }
      }
      los.flip();
      
    } else if (los.id == NAME.DANILO){

      if(los.isFront && chance(0.5) && objectLists[OBJECT.DART].length <= 1){
        var pos = manager.getPosGrid(los.getGridId());
        var ang = Math.random()*Math.PI*2;
        var spd = randRange(5, 10);
        var dart = new Dart(pos.x, pos.y, ang);
        dart.hspd = Math.cos(ang)*spd;
        dart.vspd = Math.sin(ang)*spd;
        dart.depth = 10;

        los.backItem = dart;

        los.flip(1);
      } else if(!los.isFront){
        if(los.backItem != null){

          if(los.backItem.type == OBJECT.DART){

            var pos = manager.getPosGrid(los.getGridId());
            los.backItem.x = pos.x;
            los.backItem.y = pos.y;
            addObject(los.backItem, OBJECT.DART);


            playSound(SND.POP);
            manager.clickParticle();

            los.backItem = null;
          }
        } else {
          los.flip(1);
        }
      } else {
        los.flip();
      }
    } else if (los.id == NAME.MARCELO){

      var directions = [
        new Vector(1, 0),
        new Vector(1, -1),
        new Vector(0, -1),
        new Vector(-1, -1),
        new Vector(-1, 0),
        new Vector(-1, 1),
        new Vector(0, 1),
        new Vector(1, 1),
      ];

      for(var i = 0; i < directions.length; i++){
        var pos = manager.gridInd2XY(los.getGridId());
        pos.x += directions[i].x;
        pos.y += directions[i].y;

        if(manager.checkValidGridPos(pos.x, pos.y)){
          var sideInd = manager.gridXY2Ind(pos.x, pos.y);
          var sideGridObj = manager.grid[GRID.MIDDLE][sideInd];
          if(sideGridObj.valid){
            if(sideGridObj.object.type == OBJECT.LOSANGO){
              manager.metalize(pos.x, pos.y, 1,1);
            }
          }
        }
      }

      los.flip();
    } else {
      los.flip();
    }

  }
}

class Losango {
  constructor(x, y, id){
    this.x = x;
    this.y = y;
    this.depth = 0;
    this.angle = deg2rad(45);
    this.id = id;

    this.type = OBJECT.LOSANGO;

    this.xScl = 1;
    this.yScl = 1;

    this.xSclMult = 1;
    this.ySclMult = 1;

    this.hspd = 0;
    this.vspd = 0;

    this.depthspd = 0;

    this.width = manager.losWid/Math.sqrt(2);
    this.height = manager.losHei/Math.sqrt(2);

    this.boxWid = (this.width + manager.losWid)/4;
    this.boxHei = (this.height + manager.losHei)/4;

    this.boxCollider = new Block(this.x, this.y, this.boxWid*2, this.boxHei*2);
    this.boxCollider.centerX = this.boxWid;
    this.boxCollider.centerY = this.boxHei;

    this.holder = new Holder();
    this.canBeHeld = true;

    this.boundingBox = new BoundingBox(this.x - this.boxWid/2, this.y - this.boxHei/2, this.boxWid, this.boxHei);
    
    
    this.clickingBox = new BoundingBox(this.x, this.y, this.width, this.height);
    this.clickingBox.xOffset = this.boxWid/2;
    this.clickingBox.yOffset = this.boxHei/2;


    this.flipping = false;
    this.flipPhase = 0;
    this.flipTargetPhase = 0;
    this.flipSpd = 0.1;
    this.isFront = false;
    this.isHFlip = true;

    this.rotating = false;
    this.rotateSpd = 0.025;
    this.isTilted = true;

    this.scaling = false;
    this.isFullScale = false;
    this.fullScale = manager.losWid/this.width;
    this.scalingSpd = 0.01;
    this.extraScale = 1;

    this.sneezing = false;
    this.sneezeTries = 0;
    this.sneezePauseTime = 0;
    this.sneezeWait = 0;
    this.sneezeTimer = 0;

    this.shrinked = false;
    this.shrinkAlarm = new Alarm(0, 100);
    this.growthAlarm = new Alarm(0, 100);
    this.shrinkAlarm.pause();
    this.growthAlarm.pause();

    this.popInAlarm = new Alarm(0, 25);
    this.popInAlarm.paused = true;
    this.popOutAlarm = new Alarm(0, 200);
    this.popOutAlarm.paused = true;

    this.frames = 0;

    this.frontColor = new Color(255,255,255);
    this.backColor = new Color(200, 200, 200);

    this.linePerc = 0.1;

    this.hovered = false;

    this.useAltName = false;
    this.minesweeper = false;
    this.anniversary = false;
    this.screenMode = false;

    this.shopMode = false;
    this.priceTag = 0;

    this.inOtherplane = false;

    this.backItem = null;


    this.effector = new Effector();


    this.updatePacket = null;
    this.updateList = [];

    this.attached = true;
    this.attachGridId = -1;

    this.inPlace = true;
    this.attachCooldownAlarm = new Alarm(0, 300);

    this.mouseAlarm = new Alarm(0, 50);

    this.locked = false;
    this.open = false;

    this.active = true;


    // States
    this.states = [];

    this.init();

  }

  init(){
    for(var i = 0; i < LSTATE.TOTAL; i++){
      this.states.push(null);
    }
  }





  


  update(dt){

    if(this.inOtherplane) return;

    this.hovered = false;


    this.xSclMult = 1;
    this.ySclMult = 1;
    this.depth = 0;

    this.frames++;

    if(this.isInside(input.mouseX, input.mouseY) && manager.mode != 2){
      this.hovered = true;
      canvas.style.cursor = 'pointer';
    }

    if(this.attached){
      var targetPos = manager.getPosGrid(manager.losangosGrid[this.id]);

      this.attachCooldownAlarm.update(dt);

      if(Math.abs(targetPos.x - this.x) + Math.abs(targetPos.y - this.y) < 5){

        if(this.attachCooldownAlarm.finished){
          if(!this.inPlace){
            this.hspd = 0;
            this.vspd = 0;

            var pos = new Vector(this.x, this.y);
            var dist = targetPos.sub(pos).mag();
            var dir = targetPos.sub(pos).unit();
            if(dist < 1){
              this.x = targetPos.x;
              this.y = targetPos.y;
              this.inPlace = true;

              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));
              manager.particles.push(particleConfetti(this.x, this.y));


            } else {
              this.x += dir.x/10;
              this.y += dir.y/10;
            }
          }
        }
      } else {
        this.inPlace = false;
        var pos = new Vector(this.x, this.y);
        var dist = targetPos.sub(pos).mag();
        var dir = targetPos.sub(pos).unit();

        var spd = Math.max((dist*dist)/100000, 0.1);

        this.hspd += dir.x*spd*dt;
        this.vspd += dir.y*spd*dt;
      }
    } else {
      if(!this.holder.holded){

        this.holder.getHold(this);

        // this.vspd += 0.1;

        var posPhy = manager.losangosPhy[this.id].state.pos;
        this.x = posPhy.x;
        this.y = posPhy.y;

        this.angle = (manager.losangosPhy[this.id].state.angular.pos)%(Math.PI*2);
      } else {
        manager.losangosPhy[this.id].state.pos.x = this.x;
        manager.losangosPhy[this.id].state.pos.y = this.y;

      
        this.holder.update(this);
      }
    }


    if(this.holder.holded){
      this.depth -= 10;
    }

    if(this.holder.throwEvent){
      manager.losangosPhy[this.id].state.pos.x = this.x;
      manager.losangosPhy[this.id].state.pos.y = this.y;
      manager.attachObjectMouse(this, GRID.MIDDLE);
      this.holder.throwEvent = false;
    }



    this.hspd = clamp(this.hspd, -20, 20);
    this.vspd = clamp(this.vspd, -20, 20);
    this.hspd *= Math.pow(0.98, dt);
    this.vspd *= Math.pow(0.98, dt);

    this.prevX = this.x;
    this.prevY = this.y;

    this.x += this.hspd*dt;
    this.y += this.vspd*dt;

    this.updateBox();



    this.linePerc = 0.1 + Math.cos(this.frames/40)*0.05;

    if(this.hovered){
      if(input.mouseState[0][1]){

        if(this.attached){
          if(!this.flipping){
            this.effector.effect(this, false);
          }
        } else {

        }
      } else {
        if(input.mouseState[2][1]){

          if(this.attached){
            if(!this.flipping){
              this.effector.effect(this, true);
            }
          }
        }
      }
    }

    if(this.minesweeper){
      var gridIndex = manager.losangosGrid[this.id];
      var gridOpen = manager.minesweeper.gridOpen[gridIndex];
      var gridValue = manager.minesweeper.grid[gridIndex];

      if(!this.flipping){
        if(gridOpen && this.isFront){
          this.flip(1);
        } else if (gridValue != this.states[LSTATE.MINESWEEPER] && !this.isFront && this.attached){
          this.flip(1);
        }
      }
    }

    // SNEEZING
    if(this.sneezing){
      if(this.sneezeWait > 0){
        this.sneezeWait -= dt;

        this.sneezeTimer -= dt;

        if(this.sneezeWait <= 0){
          this.sneezeTries++;
          this.sneezePauseTime = this.sneezeTimer + randInt(20, 50)*this.sneezeTries;
        }
      } else {
        this.sneezeTimer+=2*dt;

        if(this.sneezeTimer > this.sneezePauseTime){
          this.sneezeWait = randInt(20, 50);
        }

        if(this.sneezeTimer > 200){
          playSound(SND.SNEEZE);
          manager.explosionImpulse(this.x, this.y, 100);
          this.sneezing = false;
          this.sneezeTries = 0;
          this.sneezePauseTime = 0;
          this.sneezeWait = 0;
        }
      }
    } else {
      if(this.sneezeTimer > 0){
        this.sneezeTimer *= Math.pow(0.9, dt);
      }
    }


    var sneezePerc = (this.sneezeTimer/200);
    this.xSclMult *= 1 + sneezePerc*0.4;
    this.ySclMult *= 1 + sneezePerc*0.4;
    this.depth += sneezePerc*(-10);



    this.popInAlarm.update(dt);
    this.popOutAlarm.update(dt);

    if(this.popInAlarm.finished){
      this.popInAlarm.stop();
      this.popOutAlarm.start();
    }

    if(this.popOutAlarm.finished){
      this.popOutAlarm.stop();
    }

    var poppingPerc = 0;
    if(!this.popInAlarm.paused){
      poppingPerc = tweenOut(this.popInAlarm.percentage());
    } else if (!this.popOutAlarm.paused){
      poppingPerc = 1 - tweenOut(this.popOutAlarm.percentage());
    }

    this.xSclMult *= 1 + poppingPerc*0.4;
    this.ySclMult *= 1 + poppingPerc*0.4;
    this.depth += poppingPerc*(-10);


    if(this.shopMode){
      if(!this.flipping && this.isFront){
        this.shopMode = false;
      }
    }


    // FLIPPING
    if(this.flipping){
      this.flipPhase += this.flipSpd*dt;


      // We should update the object properties as soon as it changes front-back
      if(this.flipPhase >= this.flipTargetPhase - Math.PI/2){
        if(this.updatePacket != null){
          for(var i = 0; i < this.updatePacket.propertyList.length; i++){
            var prop = this.updatePacket.propertyList[i];
            this[prop.propertyName] = prop.value;
          }
          this.updatePacket = null;
        }

        this.states[LSTATE.MINESWEEPER] =  manager.minesweeper.grid[manager.losangosGrid[this.id]];
        this.states[LSTATE.SHOPMODE] = this.shopMode;
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
        this.angle -= this.rotateSpd*dt;
        if(this.angle <= 0){
          this.isTilted = false;
          this.rotating = false;
          this.angle = 0;
        }
      } else {
        this.angle += this.rotateSpd*dt;
        if(this.angle >= deg2rad(45)){
          this.isTilted = true;
          this.rotating = false;
          this.angle = deg2rad(45);
        }
      }
    }

    // Full Scaling
    if(this.scaling){
      if(this.isFullScale){
        this.extraScale -= this.scalingSpd*dt;
        if(this.extraScale <= 1){
          this.isFullScale = false;
          this.scaling = false;
          this.extraScale = 1;
        }
      } else {
        this.extraScale += this.scalingSpd*dt;
        if(this.extraScale >= this.fullScale){
          this.isFullScale = true;
          this.scaling = false;
          this.extraScale = this.fullScale;
        }
      }
    }

    this.xSclMult *= this.extraScale;
    this.ySclMult *= this.extraScale;


    // Shrinking
    this.shrinkAlarm.update(dt);
    this.growthAlarm.update(dt);
    if(this.shrinked){
      this.xSclMult *= this.growthAlarm.percentage();
      this.ySclMult *= this.growthAlarm.percentage();
      if(this.growthAlarm.finished){
        this.shrinked = false;
        this.growthAlarm.stop();
      }
    } else {
      this.xSclMult *= 1- this.shrinkAlarm.percentage();
      this.ySclMult *= 1- this.shrinkAlarm.percentage();
      if(this.shrinkAlarm.finished){
        this.shrinked = true;
        this.shrinkAlarm.stop();
      }
    }


    this.xScl = Math.cos(this.flipPhase);


    if(this.screenMode){
      if(this.isTilted && !this.rotating){
        this.rotating = true;
      }

      if(!this.isFullScale && !this.scaling){
        this.scaling = true;
      }

      if(!this.flipping){
        this.inOtherplane = true;


        var metalBlock = new MetalBlock(this.x, this.y);

        if(this.attached){
          var gridId = manager.losangosGrid[this.id];  
          manager.deattachObject(gridId, GRID.MIDDLE);
          manager.attachObject(metalBlock, gridId, GRID.MIDDLE);
        }
        
        var partPlaces = placesInRect(50, this.x - manager.losWid*0.75, this.y - manager.losHei*0.75, manager.losWid*1.5, manager.losHei*1.5);
        var partList = createParticleWithPlaces(particleLock, partPlaces, 100);
        manager.addParticles(partList);

        addObject(metalBlock, OBJECT.METALBLOCK);

        var playOffset = Date.now() - manager.poofStart;
        if(playOffset > 100){
          playSound(SND.POOF);
          manager.poofStart = Date.now();
        }
        

        
      }
    }



    // Packet processing
    if(!this.flipping){
      if(this.updateList.length > 0){
        if(this.updateList[0].waitTime > 0){
          this.updateList[0].waitTime -= dt;
        } else {
          this.updatePacket = this.updateList.shift();
          this.startFlipping();
          this.flipAmount = (this.isFront == this.updatePacket.isFront) ? 2 : 1;
          this.flipTargetPhase = this.flipPhase + Math.PI * this.flipAmount;
        }
      }
    }
  }

  shop(){
    if(!this.flipping){
      if(this.isFront){
        
        var obj = null;
        if(this.id == NAME.JVROCHA){
          obj = new Rock(this.x, this.y, 100, 100);
          this.priceTag = 100;
        } else if(this.id == NAME.MICCHAEL){
          obj = new MotherBoard(this.x, this.y);
          this.priceTag = 1000;
        } else if (this.id == NAME.DENISE){
          obj = new USBCable(this.x, this.y);
          this.priceTag = 5000;
        } else if (this.id == NAME.MARCELO){
          obj = new MetalBlock(this.x, this.y);
          this.priceTag = 250;
        }

        if(obj != null){
          this.backItem = obj;
          this.shopMode = true;

          this.flip(1);
        }
      } 
    }
  }

  blackHole(){
    this.blackHoleMode = true;
  }

  drawRequest(ctx, parameter){
    this.draw(ctx);
  }


  draw(ctx){

    if(this.inOtherplane) return;

    var anim = manager.losangosAnim[this.getGridId()];

    var xAnim = this.x + anim.x;
    var yAnim = this.y + anim.y;
    var xSclAnim = this.xScl * (1+anim.xScl);
    var ySclAnim = this.yScl * (1+anim.yScl);
    var angAnim = this.angle + anim.angle;



    ctx.save();
    ctx.translate(xAnim, yAnim);
    ctx.scale(xSclAnim*this.xSclMult, ySclAnim*this.ySclMult);
    ctx.rotate(angAnim);

    var resultColor = (this.isFront > 0) ? this.frontColor.copy() : this.backColor.copy();

    if(this.hovered || (!manager.winSoundReady() && this.id == NAME.VICTORIA)){
      resultColor = resultColor.mult(0.75);
    }

    var colorHex = resultColor.toHex();


    // Drawing lines around
    var perc = this.linePerc;

    ctx.fillStyle = "rgb(200, 200, 200)";
    if(this.attached){
      ctx.fillRect(-this.width / (2+2*perc), -this.height / (2-2*perc), this.width*(1-perc), 2);
      ctx.fillRect(-this.width / (2+2*perc), +this.height / (2-2*perc) -2, this.width*(1-perc), 2);
      ctx.fillRect(-this.width / (2-2*perc), -this.height / (2+2*perc), 2, this.height*(1-perc));
      ctx.fillRect(+this.width / (2-2*perc)-2, -this.height / (2+2*perc), 2, this.height*(1-perc));
    }


    // Birthdat Hat
    if(this.anniversary){
      sprites[SPR.BIRTHDAY].drawExtRelative(0,-this.height*0.8,0,1,1,deg2rad(0),0.5,0.5);
    }


    // Drawing Losango
    ctx.fillStyle = colorHex;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);


    // Drawing Losango Contents
    if(this.isFront){
      ctx.rotate(-angAnim); // Rotate the canvas context

      ctx.font = ((isMobile) ? "18" : "14") + "px Arial";
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';

      if(this.useAltName){
        ctx.fillText(nameMan.persons[this.id].altName, 0, 0);
      } else {
        ctx.fillText(nameMan.persons[this.id].name, 0, 0);
        //ctx.fillText(this.depth, 0, 40);
      }

      if(this.minesweeper){
          if(manager.minesweeper.gridFlag[this.getGridId()]){
              sprites[SPR.NUMBERS].drawExtRelative(0,0,10,this.boxWid/16, this.boxHei/16, 0, 0.5,0.5);
          }
      }
      ctx.rotate(angAnim); // Rotate the canvas context

    } else {
      if(this.minesweeper){
        ctx.rotate(-angAnim); // Rotate the canvas context
        ctx.scale(-1, 1); // Scale the x-axis

        if(this.states[LSTATE.MINESWEEPER] == -1){
          sprites[SPR.BOMB].drawExtRelative(0,0,0,this.boxWid/16, this.boxHei/16, 0, 0.5, 0.5);
        } else if (this.states[LSTATE.MINESWEEPER] != 0){
          sprites[SPR.NUMBERS].drawExtRelative(0,0,this.states[LSTATE.MINESWEEPER],this.boxWid/16, this.boxHei/16, 0, 0.5, 0.5);
        }

        ctx.scale(-1, 1); // Scale the x-axis
        ctx.rotate(angAnim); // Rotate the canvas context
      } else {
        
        ctx.rotate(-angAnim); // Rotate the canvas context
        ctx.scale(-1, 1); // Scale the x-axis

        if(this.backItem != null){
          this.backItem.x = 0;
          this.backItem.y = 0;

          this.backItem.draw(ctx);
        }

        
        if(this.states[LSTATE.SHOPMODE]){
          ctx.font = ((isMobile) ? "18" : "14") + "px Arial";
          ctx.fillStyle = 'green';
          ctx.textAlign = 'center';
          //ctx.fillRect();
          ctx.fillText(this.priceTag, 0, 54);
          ctx.fillStyle = 'black';

          ctx.fillText(this.priceTag, 0, 50);

        }
        
        ctx.scale(-1, 1); // Scale the x-axis
        ctx.rotate(angAnim); // Rotate the canvas context
      }


    }

    ctx.restore(); // Restore the original state
  }



  startFlipping(){

    var playOffset = Date.now() - manager.pageSlipStart;
    if(playOffset > 100){
      playSound(SND.PAGESLIP);
      manager.pageSlipStart = Date.now();
    }
 
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

  getGridId(){
    return manager.losangosGrid[this.id];
  }

  show(){
    this.draw(ctx);
  }

}
