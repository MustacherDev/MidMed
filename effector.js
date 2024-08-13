
class Effector {
    constructor() {

    }

    codenamesEffects(los, rightClick){

        if(manager.codenamesManager.finished) {
            los.endCodenames();
        } else {
            if(los.flipActor.isFront){
                manager.codenamesManager.reveal(los.id);
                los.flip(1);
            }
        }
    }

    shopEffects(los, rightClick) {
        if (!los.flipActor.isFront) {

            if (manager.moneyAmount >= los.priceTag) {
                manager.collectMoney(-los.priceTag);

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
            los.backItem = null;
            los.flip(2);
        }
    }

    minesweeperEffects(los, rightClick) {
        if (rightClick) {
            manager.flagMinesweeper(manager.losangosGrid[los.id]);
            return;
        }


        if (!los.locked) {
            los.flip(1);
            los.locked = true;
            //los.open = true;
            manager.exposeMinesweeper(manager.losangosGrid[los.id]);
        }

        if (los.id == NAME.LUIS) {
            manager.minesweeper.exposeAll();
            if(!manager.achievementManager.achievements[ACHIEVEMENT.CHEATMINESWEEPER]){
                manager.achievementManager.getAchievement(ACHIEVEMENT.CHEATMINESWEEPER);
            }
        }
        return;
    }

    musicEffects(los, rightClick){
       los.playNote();
    }

    effect(los, rightClick) {
        // Redirecting Effects
        if (los.minesweeper) {
            this.minesweeperEffects(los, rightClick);
            return;
        }

        if (los.shopMode) {
            this.shopEffects(los, rightClick);
            return;
        }

        if(los.codenamesMode){
            this.codenamesEffects(los, rightClick);
            return;
        }


        if(manager.musicMode){
            this.musicEffects(los, rightClick);
        }


        // Normal Effects
        if (los.id == NAME.WILLISTON) {
            if (chance(0.01)) {
                los.sneezeActor.sneezing = true;
                return;
            }

            if (los.sneezeActor.sneezing) {
                playSound(SND.KNOCK);
                manager.clickParticle();
                return;
            }

            manager.altNames = !manager.altNames;
            var willAlt = manager.altNames;

            var willEvent = EventCreate.altname(willAlt)
            var willUpdatePacket = willEvent.wrap();
            willUpdatePacket.isFront = true;
            manager.losangos[NAME.WILLISTON].updateList.push(willUpdatePacket);

            for (var i = 0; i < manager.losangos.length; i++) {
                var id = manager.losangos[i].id;

                if(id == NAME.WILLISTON) continue;

                if (nameMan.persons[id].altName != nameMan.persons[id].name) {
                    if(manager.losangos[i].useAltName != willAlt){
                        //var updatePacket = new UpdateLosango([new PropertyObject("useAltName", manager.altNames)]);
                        var event = EventCreate.altname(willAlt)
                        var updatePacket = event.wrap();
                        updatePacket.isFront = true;
                        manager.losangos[i].updateList.push(updatePacket);
                    }
                }
            }
        } else if (los.id == NAME.LUIS) {
            manager.initMinesweeper(manager.losangosGrid[los.id]);
        } else if (los.id == NAME.JOAS) {
            playSound(SND.KNOCK);
            manager.clickParticle();
            if (chance(manager.bitCoinToMine / 10)) {
                manager.bitCoinToMine--;
                var coinX = randInt(0, roomWidth);
                var coinY = -100;
                addObject(new Bitcoin(coinX, coinY, randInt(25, 40)), OBJECT.BITCOIN);
                playSound(SND.COINNOISE);
            }

        } else if (los.id == NAME.MICCHAEL) {
            if(manager.altNames){
                playSound(SND.AUU);
                los.flip();
            } else {
                if(manager.chessMode){
                    manager.pinSlideAlarm.restart();
                    manager.chessState = 3;
                } else{
                    manager.initChess();
                }
                los.flip();
            }
        } else if (los.id == NAME.SHEILA) {
            for(var i = 0 ; i < 4; i++){
                var ang = Math.PI/4 + i*Math.PI/2;
                var xx = Math.cos(ang) * los.width/4;
                var yy = Math.sin(ang) * los.height/4;
                manager.particles.push(particleSoundWave(los.x + xx, los.y + yy, ang));
            }
            if(!manager.losangos[NAME.ISRAEL].inOtherplane){
                var otherLos = manager.losangos[NAME.ISRAEL];
                var dx = otherLos.x - los.x;
                var dy = otherLos.y - los.y;
                var dist = distance(dx, dy);

                if(dist <= 350){
                    manager.quietAlarm.start();
                    otherLos.popInAlarm.start();
                }


            }
            playSound(SND.ALARM);
            los.flip();
        } else if (los.id == NAME.NILTON) {
            if(manager.altNames){
                los.flip();
            } else {
                playSound(SND.POLICE);
                los.flip();
            }
        } else if (los.id == NAME.ARAUJO) {
            manager.finishCodenames();
            manager.cleanCodenames();
            manager.randomizeGrid();
            manager.codenamesManager.getGrid();
            manager.codenamesManager.getHint();
            los.flip();
        } else if (los.id == NAME.NATHALIA) {
            if(manager.altNames){
                playSound(SND.CLAUS);
                los.flip();
            } else {
                var row = manager.gridInd2XY(manager.losangosGrid[los.id]).y;
                if (chance(1 - ((row / manager.rows)))) {
                    var sunX = randInt(0, roomWidth);
                    var sunY = -100;
                    addObject(new Sun(sunX, sunY), OBJECT.SUN);

                    manager.clickParticle();
                    playSound(SND.POP);
                } else {
                    los.flip();
                }
            }
        } else if (los.id == NAME.VICTORIA) {
            if (manager.winSoundReady()) {
                playSound(SND.POP);
                var newWinSound = randInt(0, WINSND.TOTAL);

                if (los.popInAlarm.paused) {
                    los.popInAlarm.start();
                    los.popInAlarm.timer = Math.floor(los.popInAlarm.time / 5);
                }

                los.popParticles();
                var partPos = manager.getPosGrid(los.getGridId());

                manager.winSoundId = (newWinSound == manager.winSoundId) ? (newWinSound + 1) % WINSND.TOTAL : newWinSound;
                //manager.winSoundId = WINSND.SMW;
                winSounds[manager.winSoundId].play();

                if (manager.winSoundId == WINSND.SMW) {
                    manager.spotlight.x = partPos.x;
                    manager.spotlight.y = partPos.y;
                    manager.spotlight.width = 1500;
                    manager.spotlight.height = 1500;

                    var now = new Date();
                    manager.bwoopRealTimeAlarm.time = new Date(now.getTime() + 1000 + 1000 * winSounds[manager.winSoundId].duration);
                    manager.bwoopRealTimeAlarm.active = true;


                    manager.spotlight.spd = manager.spotlight.width / ((sounds[SND.SMWBWOOP].duration() - 0.2) * FRAMERATE);
                    manager.spotlight.active = false;
                }
            }
        } else if (los.id == NAME.LAIS) {
            var directions = [
                new Vector(1, -1),
                new Vector(-1, -1),
                new Vector(-1, 1),
                new Vector(1, 1),
            ];

            for (var i = 0; i < directions.length; i++) {
                var pos = manager.gridInd2XY(los.getGridId());
                pos.x += directions[i].x;
                pos.y += directions[i].y;

                if (manager.checkValidGridPos(pos.x, pos.y)) {
                    var sideInd = manager.gridXY2Ind(pos.x, pos.y);
                    var sideGridObj = manager.grid[GRID.MIDDLE][sideInd];
                    if (sideGridObj.valid) {
                        if (sideGridObj.object.type == OBJECT.LOSANGO) {
                            var sideId = sideGridObj.object.id;

                            sideGridObj.object.shop();
                        }
                    }
                }
            }
            los.flip(1);
            los.startBlackHole();

        } else if (los.id == NAME.IKARO) {
            if(manager.musicMode){
                los.headphones = false;
                manager.musicMode = false;
                los.flip();
            } else {
                los.headphones = true;
                manager.musicMode = true;
                los.flip();
            }
        } else if (los.id == NAME.CAIO) {
            if (los.useAltName) {
                //playSound(SND.FALL);
                manager.fall();
            } else {

                los.flipActor.freeMoveSpd += 0.05;
                //los.flip(0.2, false, 0.1);
                
                if (input.mouseState[0][1]) {
                    manager.clickParticle();
                }
            }

        } else if (los.id == NAME.ALICE) {
            manager.finishCodenames();
            manager.cleanCodenames();
            manager.sortGrid();

        } else if (los.id == NAME.LILIAN) {
            var balloon = new Balloon(randInt(0, roomWidth), randInt(0, roomHeight), randInt(0, 4));
            addObject(balloon, OBJECT.BALLOON);
        } else if (los.id == NAME.FGOIS) {
            manager.finishCodenames();
            manager.cleanCodenames();
            manager.randomizeGrid();
        } else if (los.id == NAME.JP) {
            playSound(SND.KNOCK);
            manager.clickParticle();
            manager.glitch();

        } else if (los.id == NAME.THALIA) {
            if(los.useAltName){
                playSound(SND.FUNICULI);
                los.flip(6);
            } else {
                los.flip();
            }
        } else if (los.id == NAME.HENRIQUE) {
            playSound(SND.RAPAZ);
            if (manager.pageScrolled) {
                window.scrollTo(0, 0);
                manager.pageScrolled = false;
            } else {
                window.scrollTo(0, 1);
                manager.pageScrolled = true;
            }
            los.flip();
        } else if (los.id == NAME.JVROCHA) {

            playSound(SND.KNOCK);
            manager.clickParticle();
            if (objectLists[OBJECT.ROCK].length > 0) return;
            var rockX = roomWidth / 2;
            var rockY = -2500;
            addObject(new Rock(rockX, rockY, 300, 100), OBJECT.ROCK);
            playSound(SND.FALLINGROCK);
        } else if (los.id == NAME.ISRAEL) {
            if (manager.sleeping && manager.mode == 0) {
                if (los.attached) {
                    manager.deattachObject(los.getGridId(), GRID.MIDDLE);
                    playSound(SND.POP);
                }
            } else {
                los.flip();
            }
        } else if (los.id == NAME.EUDA) {
            manager.openInventory();
            los.flip();
        } else if (los.id == NAME.BERNAD) {
            if (los.useAltName) {
                if (!manager.losangos[NAME.ISRAEL].inOtherplane) {
                    var pos = new Vector(manager.losangos[NAME.ISRAEL].x, manager.losangos[NAME.ISRAEL].y);
                    manager.addParticles(createParticlesInRect(particleLock, 20, pos.x, pos.y, 0, 0));
                    manager.quietAlarm.timer = manager.quietAlarm.time;
                    playSound(SND.POOF);
                }
            }
            los.flip();
        } else if (los.id == NAME.SAMUEL) {

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

            for (var i = 0; i < directions.length; i++) {
                var pos = manager.gridInd2XY(los.getGridId());
                pos.x += directions[i].x;
                pos.y += directions[i].y;

                if (manager.checkValidGridPos(pos.x, pos.y)) {
                    var sideInd = manager.gridXY2Ind(pos.x, pos.y);
                    var sideGridObj = manager.grid[GRID.MIDDLE][sideInd];
                    if (sideGridObj.valid) {
                        if (sideGridObj.object.type == OBJECT.LOSANGO) {
                            var sideId = sideGridObj.object.id;

                            var validIds = [NAME.JOAS, NAME.ANDRE, NAME.LUIS, NAME.MATHEUS, NAME.HENRIQUE, NAME.GABRIEL, NAME.BERNAD, NAME.FSANCHEZ, NAME.RAFAEL];
                            var canSlap = false;
                            for (var j = 0; j < validIds.length; j++) {
                                if (sideId == validIds[j]) {
                                    canSlap = true;
                                    break;
                                }
                            }

                            if (canSlap) {
                                sideGridObj.object.hspd += 10 * directions[i].x;
                                sideGridObj.object.x += 10 * directions[i].x;
                                sideGridObj.object.vspd += 10 * directions[i].y;
                                sideGridObj.object.y += 10 * directions[i].y;
                                manager.particles.push(particleSmack(sideGridObj.object.x, sideGridObj.object.y));
                                playSound(SND.SLAP);
                            }
                        }
                    }
                }
            }
            los.flip();

        } else if (los.id == NAME.DANILO) {

            if (los.flipActor.isFront && chance(0.1) && objectLists[OBJECT.DART].length == 0) {
                var pos = manager.getPosGrid(los.getGridId());
                var ang = Math.random() * Math.PI * 2;
                var spd = randRange(5, 10);
                var dart = new Dart(pos.x, pos.y, ang);
                dart.hspd = Math.cos(ang) * spd;
                dart.vspd = Math.sin(ang) * spd;
                dart.depth = 10;

                los.backItem = dart;

                los.flip(1);
            } else if (!los.flipActor.isFront) {
                if (los.backItem != null) {

                    if (los.backItem.type == OBJECT.DART) {

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
                for(var i = 0 ; i < 4; i++){
                    var angle = Math.PI/4 + (Math.PI/2) * i;
                    var miniDart = new MiniDart(los.x, los.y, i, angle);
                    addObject(miniDart, OBJECT.MINIDART);
                }
                los.popInAlarm.start();
                playSound(SND.DARTBLOW);
                //los.effectCooldownAlarm.start(0);
            }
        } else if (los.id == NAME.MARCELO) {

            playSound(SND.AUMENTAOSOM);
            los.flip(4);
            return;

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

            for (var i = 0; i < directions.length; i++) {
                var pos = manager.gridInd2XY(los.getGridId());
                pos.x += directions[i].x;
                pos.y += directions[i].y;

                if (manager.checkValidGridPos(pos.x, pos.y)) {
                    var sideInd = manager.gridXY2Ind(pos.x, pos.y);
                    var sideGridObj = manager.grid[GRID.MIDDLE][sideInd];
                    if (sideGridObj.valid) {
                        if (sideGridObj.object.type == OBJECT.LOSANGO) {
                            manager.metalize(pos.x, pos.y, 1, 1);
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
