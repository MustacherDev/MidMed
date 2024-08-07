
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
    "YELLOW",
    "PURPLE",
    "TOTAL"
));

class DrMarioObj {
    constructor(type, color, orientation = 0) {
        this.type = type;
        this.color = color;
        this.orientation = orientation;
        this.updated = false;
        this.destroying = false;
    }

    copy(marioObj){
        this.type = marioObj.type;
        this.color = marioObj.color;
        this.orientation = marioObj.orientation;
        this.updated = marioObj.updated;
        this.destroying = marioObj.destroying;
    }
}

class DrMarioPlayerPill {
    constructor(color1, color2, orientation, x, y) {
        this.x = x;
        this.y = y;
        this.part1 = new DrMarioObj(DRMARIOTYPE.DOUBLEPILL, color1);
        this.part2 = new DrMarioObj(DRMARIOTYPE.DOUBLEPILL, color2);
        this.orientation = orientation;
    }
}

class DrMarioGame {
    constructor(wid, hei) {
        this.wid = wid;
        this.hei = hei;

        this.grid = [];

        this.colorPool = [];

        this.nextPill = null;
        this.playerPill = null;
        this.pillSpawnX = 0;
        this.fillHeight = 0;


        this.stepAlarm = new Alarm(0, 5);

        this.horizontalTurboAlarm = new Alarm(0, 15);
        this.horizontalTurboMoveCooldown = new Alarm(0, 4);

        this.horizontalTurboAlarm.pause();

        this.pillNormalSpd = 0.1;
        this.pillFastSpd = 2;

        this.gravitySpd = 0.5;

        this.pillSpd = this.pillNormalSpd;

        this.placingPill = false;

        // 0 == PLACING PILL, 1 == CHECKING SEQUENCES, 2 == DESTROYING PILLS, 3 == FALLING PHYSICS
        this.runState = 0;

        this.gameover = false;

        this.ready = false;

        this.toMove = 0;
        this.toTurn = 0;

        this.init(this.wid, this.hei);
    }

    getRandomColor(){
        return this.colorPool[randInt(0, this.colorPool.length)];
    }

    createVirus(color) {
        return new DrMarioObj(DRMARIOTYPE.VIRUS, color);
    }

    createPlayerPill(color1, color2) {
        var newPlayerPill = new DrMarioPlayerPill(0, 0, 0, 0, 0);
        newPlayerPill.x = this.pillSpawnX;
        newPlayerPill.y = 0;
        newPlayerPill.part1 = new DrMarioObj(DRMARIOTYPE.DOUBLEPILL, color1);
        newPlayerPill.part2 = new DrMarioObj(DRMARIOTYPE.DOUBLEPILL, color2);
        return newPlayerPill;
    }

    createRandomPlayerPill() {
        return this.createPlayerPill(this.getRandomColor(), this.getRandomColor());
    }



    init(wid, hei) {
        this.wid = wid;
        this.hei = hei;

        this.pillSpawnX = Math.floor(this.wid / 2) - 1;
        this.fillHeight = Math.floor(this.hei / 2);

        this.colorPool = [DRMARIOCOLOR.BLUE, DRMARIOCOLOR.RED, DRMARIOCOLOR.GREEN, DRMARIOCOLOR.YELLOW, DRMARIOCOLOR.PURPLE];

        for (var i = 0; i < this.hei; i++) {
            var row = [];
            for (var j = 0; j < this.wid; j++) {
                if (chance(0.4) && i > this.fillHeight) {
                    row.push(this.createVirus(this.getRandomColor()));
                } else {
                    row.push(new DrMarioObj(0, 0));
                }
            }
            this.grid.push(row);
        }


        this.playerPill = this.createRandomPlayerPill();
        this.ready = true;
    }

    placePlayerPill() {
        var pill1 = this.playerPill.part1;
        var pill2 = this.playerPill.part2;
        var vertical = this.playerPill.orientation;

        this.grid[this.playerPill.y][this.playerPill.x] = new DrMarioObj(pill1.type, pill1.color, vertical ? 1 : 0);
        var addX = 1;
        var addY = 0;
        if (this.playerPill.orientation == 1) {
            addX = 0;
            addY = -1;
        }

        if (this.playerPill.y + addY >= 0) {
            this.grid[this.playerPill.y + addY][this.playerPill.x + addX] = new DrMarioObj(pill2.type, pill2.color, (vertical ? 1 : 0) + 2);
        }

        this.runState = 1;

        this.playerPill = this.createRandomPlayerPill();
    }

    inputMovePress(dir) {
        if (this.runState != 0) return;

        this.horizontalTurboAlarm.start();
        this.stepMove(dir);
    }

    inputMoveRelease(dir) {
        this.horizontalTurboAlarm.stop();
    }

    inputMoveHold(dir) {
        if (this.runState != 0) return;

        if (this.horizontalTurboAlarm.finished) {
            if (this.horizontalTurboMoveCooldown.finished) {
                this.stepMove(dir);
                this.horizontalTurboMoveCooldown.restart();
            }
        }
    }

    inputTurn() {
        if (this.runState == 0) {
            this.toTurn = true;
            this.stepTurn();
        }
    }

    inputDown() {
        if(this.runState == 0){
            this.pillSpd = this.pillFastSpd;
        }
    }

    stepMove(dir) {
        if (dir == 0) return;

        var vertical = this.playerPill.orientation;
        var pillWid = vertical ? 1 : 2;

        if(this.playerPill.x + dir < 0){
            return;
        }

        if(this.playerPill.x + dir > this.wid - pillWid){
            return;
        }

        if(this.checkPillCollision(this.playerPill.x + dir, this.playerPill.y, this.playerPill.orientation)){
            return;
        }

        this.playerPill.x += dir;
    }

    stepTurn(dir) {
        if (this.playerPill.orientation == 0) {

            if (this.checkPillCollision(this.playerPill.x, this.playerPill.y, 1)) {
                if (!this.checkPillCollision(this.playerPill.x - 1, this.playerPill.y, 1)) {
                    this.playerPill.x--;
                    this.playerPill.orientation = 1;
                }
            } else {
                this.playerPill.orientation = 1;
            }



        } else {
            if (this.checkPillCollision(this.playerPill.x, this.playerPill.y, 0)) {
                if (!this.checkPillCollision(this.playerPill.x - 1, this.playerPill.y, 0)) {
                    this.playerPill.x--;
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
        }
    }


    checkPillCollision(x, y, ori) {
        var oriAdd = [new Vector(1, 0), new Vector(0, -1)];

        var pill1 = new Vector(x, y);
        var pill2 = new Vector(x + oriAdd[ori].x, y + oriAdd[ori].y);

        if (pill1.x < 0 || pill1.x >= this.wid) {
            return true;
        }


        if (pill1.y >= this.hei) {
            return true;
        }

        if(pill1.y != -1){
            if (this.grid[pill1.y][pill1.x].type != DRMARIOTYPE.EMPTY) {
                return true;
            }
        }



        if (pill2.x < 0 || pill2.x >= this.wid) {
            return true;
        }


        if (pill2.y >= this.hei) {
            return true;
        }

        if(pill2.y != -1){
            if (this.grid[pill2.y][pill2.x].type != DRMARIOTYPE.EMPTY) {
                return true;
            }
        }


        return false;
    }


    update(dt) {
        if (!this.ready) return;

        if(this.runState == 0){
            this.stepAlarm.update(dt*this.pillSpd);
        } else {
            this.stepAlarm.update(dt);
        }

        this.pillSpd = this.pillNormalSpd;

        this.horizontalTurboAlarm.update(dt);
        this.horizontalTurboMoveCooldown.update(dt);



        if (this.stepAlarm.finished) {
            this.stepAlarm.start();

            

            if (this.runState == 0) {
                if (this.playerPill.y == this.hei - 1) {
                    this.placePlayerPill();
                } else {
                    if(this.checkPillCollision(this.playerPill.x, this.playerPill.y+1, this.playerPill.orientation)){
                        this.placePlayerPill();
                    } else {
                        this.playerPill.y++;
                    }
                }
            } else if (this.runState == 1) {
                this.sequenceMarking();
            } else if (this.runState == 2) {
                this.sequenceErasing();
            } else if (this.runState == 3) {
                this.doFalling();
            }
        }


    }










    sequenceMarking(){
        var sequences = 0;

        // HORIZONTAL SEQUENCES
        for (var i = 0; i < this.hei; i++) {
            var lastColor = -1;
            var count = 0;
            var startIndex = -1;
            for (var j = 0; j < this.wid; j++) {
                var type = this.grid[i][j].type;
                var color = this.grid[i][j].color;



                if (type == DRMARIOTYPE.EMPTY) {
                    if (count >= 4) {
                        for (var k = startIndex; k < j; k++) {
                            this.grid[i][k].destroying = true;
                        }
                        sequences++;
                    }

                    count = 0;
                    lastColor = -1;
                    startIndex = -1;


                    continue;
                }

                if (lastColor == -1) {
                    lastColor = color;
                    count = 1;
                    startIndex = j;
                    continue;
                } else {
                    if (lastColor == color) {
                        count++;
                    } else {
                        if (count >= 4) {
                            for (var k = startIndex; k < j; k++) {
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


            if (count >= 4) {
                for (var k = startIndex; k < this.wid; k++) {
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


        if (sequences == 0) {
            this.runState = 0;
        } else {
            this.runState = 2;
        }
    }

    sequenceErasing(){
        for (var i = 0; i < this.hei; i++) {
            for (var j = 0; j < this.wid; j++) {
                if (this.grid[i][j].destroying) {
                    this.grid[i][j] = new DrMarioObj(0, 0);
                }
            }
        }

        var or2Vec = [new Vector(1, 0), new Vector(0, -1), new Vector(-1, 0), new Vector(0, 1)];

        for (var i = 0; i < this.hei; i++) {
            for (var j = 0; j < this.wid; j++) {
                if (this.grid[i][j].type == DRMARIOTYPE.DOUBLEPILL) {
                    var vec = or2Vec[this.grid[i][j].orientation];

                    if (this.grid[i + vec.y][j + vec.x].type == DRMARIOTYPE.EMPTY) {
                        this.grid[i][j].type = DRMARIOTYPE.PILL;
                        this.grid[i][j].orientation = 0;
                    }
                }
            }
        }
        this.runState = 3;
    }

    doFalling(){
        // CHECKING BOTTOM FIRST
        // FALLING SAND PHYSICS
        var moved = false;
        for (var i = this.hei - 2; i > 0; i--) {
            for (var j = 0; j < this.wid; j++) {
                var type = this.grid[i][j].type;
                if (type == DRMARIOTYPE.EMPTY || type == DRMARIOTYPE.VIRUS) continue;
                if (type == DRMARIOTYPE.PILL) {
                    if (this.grid[i + 1][j].type == DRMARIOTYPE.EMPTY) {
                        this.grid[i + 1][j] = this.grid[i][j];
                        this.grid[i][j] = new DrMarioObj(DRMARIOTYPE.EMPTY, 0);
                    }
                }
                if(type == DRMARIOTYPE.DOUBLEPILL){
                    var orientation = this.grid[i][j].orientation;
                    if(orientation == 0){
                        if(this.grid[i][j+1].type == DRMARIOTYPE.DOUBLEPILL){
                            if (this.grid[i + 1][j].type == DRMARIOTYPE.EMPTY) {
                                if (this.grid[i + 1][j+1].type == DRMARIOTYPE.EMPTY) {

                                    var pillHead = new DrMarioObj(0,0);
                                    pillHead.copy(this.grid[i][j]);
                                    var pillTail = new DrMarioObj(0,0);
                                    pillTail.copy(this.grid[i][j+1]);

                                    this.grid[i + 1][j] = pillHead;
                                    this.grid[i + 1][j+1] = pillTail;
                                    this.grid[i][j] = new DrMarioObj(DRMARIOTYPE.EMPTY, 0);
                                    this.grid[i][j+1] = new DrMarioObj(DRMARIOTYPE.EMPTY, 0);
                                }
                            }
                        }
                    } else if(orientation == 1){
                        if(this.grid[i-1][j].type == DRMARIOTYPE.DOUBLEPILL){
                            if (this.grid[i + 1][j].type == DRMARIOTYPE.EMPTY) {

                                var pillHead = new DrMarioObj(0,0);
                                pillHead.copy(this.grid[i][j]);
                                var pillTail = new DrMarioObj(0,0);
                                pillTail.copy(this.grid[i-1][j]);

                                this.grid[i+1][j] = pillHead;
                                this.grid[i][j] = pillTail;
                                this.grid[i-1][j] = new DrMarioObj(DRMARIOTYPE.EMPTY, 0);
                            }
                        }
                    }
                }
            }
        }

        // CHECK IF NEXT STEP WILL HAVE PILL FALLING UPDATES
        for (var i = this.hei - 2; i > 0; i--) {
            for (var j = 0; j < this.wid; j++) {
                var type = this.grid[i][j].type;
                if (type == DRMARIOTYPE.EMPTY || type == DRMARIOTYPE.VIRUS) continue;
                if (type == DRMARIOTYPE.PILL) {
                    if (this.grid[i + 1][j].type == DRMARIOTYPE.EMPTY) {
                        moved = true;
                        break;
                    }
                }
            }
        }

        if (!moved) this.runState = 1;
    }


    

    draw(xx, yy, ww, hh) {
        var x = xx;
        var y = yy;
        var w = ww / this.wid;
        var h = hh / this.hei;
        var scl = w / sprites[SPR.DRMARIOSHEET].width;

        ctx.fillStyle = "rgb(0,0,0)";
        ctx.fillRect(x, y, ww, hh);

        for (var i = 0; i < this.hei; i++) {
            for (var j = 0; j < this.wid; j++) {
                var obj = this.grid[i][j];

                var type = obj.type;
                var color = obj.color;
                var angle = 0;
                var extraImg = 0;

                if (type == DRMARIOTYPE.DOUBLEPILL) {
                    var or = obj.orientation % 2;
                    angle = -(Math.PI / 2) * or;

                    if (obj.orientation >= 2) {
                        extraImg = 1;
                    }
                }

                if (obj.type != 0) {
                    sprites[SPR.DRMARIOSHEET].drawExt(x + w * j + 4 * scl, y + h * i + 4 * scl, (type + extraImg - 1) + color * 4, scl, scl, angle, 4, 4);
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

        var angle = -(Math.PI / 2) * vertical;


        if (type != DRMARIOTYPE.EMPTY) {
            sprites[SPR.DRMARIOSHEET].drawExt(x + w * px + 4 * scl, y + h * py + 4 * scl, (type - 1) + color * 4, scl, scl, angle, 4, 4);
        }

        type = pill2.type;
        color = pill2.color;

        var addPos = new Vector(1, 0);
        if (vertical) {
            addPos = new Vector(0, -1);
        }

        angle = -(Math.PI / 2) * vertical;
        if (type != DRMARIOTYPE.EMPTY) {
            sprites[SPR.DRMARIOSHEET].drawExt(x + w * (px + addPos.x) + 4 * scl, y + h * (py + addPos.y) + 4 * scl, (type) + color * 4, scl, scl, angle, 4, 4);
        }
    }
}
