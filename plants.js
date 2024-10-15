


class IdMachine{
    static id = 0;
    static getNewId(){
        this.id++;
        return this.id;
    }
}

class PlantPart{
    constructor(x, y, xRat, yRat, ang, parent, plant){

        this.id = IdMachine.getNewId();

        this.parent = parent;

        // Variables used by the parent object only
        this.parentOffXRat = xRat;
        this.parentOffYRat = yRat;
        this.parentOffAng = ang;

        // Variables relative to self
        this.parentResX = x;
        this.parentResY = y;
        this.parentResAng = this.parentOffAng;

        this.offX = 0;
        this.offY = 0;
        this.offAng = 0;

        // Resulting variables
        this.x = x;
        this.y = y;
        this.depth = 0;
        this.ang = ang;

        this.angDegree = rad2deg(ang);
        
        this.type = 0;

        this.matureState = 0;
        this.age = 0;
        this.matureSpd = 1;

        this.grownWidth = 10
        this.grownHeight = 200;
        this.startWidth = 1;
        this.startHeight = 1;

        this.width = this.startWidth;
        this.height = this.startHeight;
        this.color = new Color(0, 255, 0);
        


        this.trunkGen = 0;

        // Movement Variables
        this.angPhase = 0;
        this.angSpd = 0;
        this.angDamp = 0.03;
        this.angMove = 0;


        this.active = true;


    }

    inactivate(plant){
        this.active = false;
        plant.inactiveParts++;
    }

    updateParams(dt, plant){
        this.x = this.offX + this.parentResX;
        this.y = this.offY + this.parentResY;
        this.ang = this.offAng + this.parentResAng + this.angMove;
        this.angDegree = rad2deg(this.ang);

        this.angPhase += 0.01;
        this.angSpd += 0.0001*dt*(Math.sin(this.angPhase + this.trunkGen/2))

        this.angSpd += -dt*this.angMove/100;
        this.angSpd *= Math.pow(1-this.angDamp, dt);
        this.angMove += this.angSpd;

        this.matureState += dt*this.matureSpd/plant.options.matureTime;
        this.matureState = clamp(this.matureState, 0, 1.1);

        this.age += dt/plant.options.matureTime;
    }

    update(dt, plant){
        this.updateParams(dt, plant);



        this.width  = this.startWidth + this.grownWidth*this.matureState;
        this.height = this.startHeight + this.grownHeight*this.matureState;
    }



    draw(ctx){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.fillRect(-1,-1, this.width+2, this.height+2);
        ctx.fillStyle = this.color.toCSS();
        ctx.fillRect(0,0, this.width, this.height);
       
        ctx.restore();
    }

    pushDrawList() {
        addList((new DrawRequest(this, this.depth, 0)), OBJECT.DRAW);
    }
    
    drawRequest(ctx, parameter) {
        this.draw(ctx);
    }
}




class PlantEnd extends PlantPart{
    constructor(x, y, xRat, yRat, ang, spr, sprImg, sprOffX, sprOffY, parent, plant){
        super(x, y, xRat, yRat, ang, parent, plant);
        this.sprite = spr;
        this.spriteImg = sprImg;
        this.sprOffX = sprOffX;
        this.sprOffY = sprOffY;
        this.sprScl = 1;

        this.attached = true;

        this.hspd = 0;
        this.vspd = 0;
        this.vacc = 0.1;
        
    }

    updatePlantEnd(dt, plant){
        if(this.attached) return;

        this.vspd += this.vacc*dt;
        this.x += this.hspd*dt;
        this.y += this.vspd*dt;

        if(this.y >= roomHeight+100){
            this.inactivate(plant);
        }
        
    }

    draw(ctx){
        this.sprite.drawExt(this.x, this.y, this.spriteImg, this.matureState*this.sprScl, this.matureState*this.sprScl, this.ang, this.sprOffX, this.sprOffY);
    }
}

class PlantBerry extends PlantEnd{
    constructor(x, y, xRat, yRat, ang, parent, plant){
        super(x, y, xRat, yRat, ang, sprites[SPR.PLANTSADDONS], 0, 9, 2, parent, plant);
        this.type = 2;
        this.sprScl = 2;
        this.depth = -1;

        this.angSpd = 0;

        this.matureSpd = 0.25;
    }

    update(dt, plant){
        if(this.attached){
            this.updateParams(dt, plant);
        }

        this.updatePlantEnd(dt, plant);

        this.angSpd += dt*(-this.ang)/200;
        this.offAng += this.angSpd*dt;
        this.angSpd *= Math.pow(0.98, dt);
    }
}

class PlantFlower extends PlantEnd{
    constructor(x, y, xRat, yRat, ang, parent, plant){
        super(x, y, xRat, yRat, ang, sprites[SPR.PLANTSADDONS], 1, 8, 8, parent, plant);
        this.type = 3;
        this.sprScl = 2;
        this.depth = -1;

        this.angSpd = 0;

        this.matureSpd = 0.25;
    }

    update(dt, plant){
        if(this.attached){
            this.updateParams(dt, plant);
        }
        this.updatePlantEnd(dt, plant);
        this.angSpd += dt*(-this.ang)/200;
        this.offAng += this.angSpd*dt;
        this.angSpd *= Math.pow(0.98, dt);
    }
}

class PlantLeaf extends PlantEnd{
    constructor(x, y, xRat, yRat, ang, parent, plant){
        super(x, y, xRat, yRat, ang, sprites[SPR.PLANTSADDONS], 4, 0, 0, parent, plant);
        this.type = 4;
        this.sprScl = 2 * plant.options.leavesScl;
        this.depth = -0.5;

        this.angSpd = 0;

        this.matureSpd = 0.25;

        this.life = randInt(100, 2000);
    }

    update(dt, plant){
        if(this.attached){
            this.updateParams(dt, plant);
        }
        this.updatePlantEnd(dt, plant);

        if(this.age >= this.life){
            //this.parent.removeLeaves(plant);
            this.parent.removeChild(this, plant);
        }
        this.angSpd += dt*(-this.ang)/200;
        this.offAng += this.angSpd*dt;
        this.angSpd *= Math.pow(0.98, dt);
    }
}

class PlantTrunk extends PlantPart{
    constructor(x, y, xRat, yRat, ang, trunkGen, parent, plant){
        super(x, y, xRat, yRat, ang, parent, plant);
       

        this.children = [];

        this.type = 0;

        this.continued = false;

        this.canHaveFruit = chance(plant.options.haveFruitChance);
        this.hasFruit = false;

        this.trunkGen = trunkGen;

        this.grownWidth = plant.options.trunkMaxWid*(1 + randAmp(plant.options.trunkWidVarPerc));
        this.grownHeight = plant.options.trunkMaxHei*(1 + randAmp(plant.options.trunkHeiVarPerc));
        this.startWidth = 1;
        this.startHeight = 1;

        this.width = this.startWidth;
        this.height = this.startHeight;
        //this.color = new Color(0, 255, 0);
        this.color = new Color(255, 255, 0);
        this.growTickAlarm = new Alarm(0, plant.options.growTick);
    }

    pointInside(x,y){
        return isPointInsideRectangle(x, y, this.x, this.y, this.width, this.height, this.angle);
    }

    newTrunkChance(plant){
        return plant.options.trunkGrowChance - plant.options.trunkGrowChanceChildImpact*this.children.length;
    }

    removeChildIndex(childIndex, plant){
        var child = this.children[childIndex];
       
        this.children.splice(childIndex, 1);
        if(child.type == 2 || child.type == 3 || child.type == 4){
            child.attached = false;
            plant.deattached.push(child);
        }
      
    }

    removeChild(child, plant){
        for(var i = 0 ;i < this.children.length; i++){
            if(child === this.children[i]){
                this.children.splice(i, 1);
                if(child.type == 2 || child.type == 3 || child.type == 4){
                    child.attached = false;
                    plant.deattached.push(child);
                }
                return;
            }
        }
      
    }

    removeLeaves(plant){
        for(var i = 0 ;i < this.children.length; i++){
            
            var child = this.children[i];

            if(child.type == 4){
                this.children.splice(i, 1);
                i--;
            
                child.attached = false;
                plant.deattached.push(child);
                
            }
        }
      
    }

    createBranch(plant){
        if(plant.allParts.length > 3000) return; 
        if(chance(this.newTrunkChance(plant)) && this.trunkGen < plant.options.trunkGenMax){
            if(chance(plant.options.trunkTrifurcateProb + plant.options.trunkTrifurcateProbGenImpact*this.trunkGen) && !this.continued){
                var xx = 0;
                var yy = this.height;
                var spreadAng = plant.options.trunkTrifurcateAngSpread;
                var axisAng = plant.options.trunkChildAng + randRange(-plant.options.trunkChildAngSpread, plant.options.trunkChildAngSpread);

                var branch1 = new PlantTrunk(xx, yy, xx/this.width, yy/this.height, axisAng - spreadAng/2, this.trunkGen+1, this, plant);
                var branch2 = new PlantTrunk(xx, yy, xx/this.width, yy/this.height, axisAng              , this.trunkGen+1, this, plant);
                var branch3 = new PlantTrunk(xx, yy, xx/this.width, yy/this.height, axisAng + spreadAng/2, this.trunkGen+1, this, plant);
                
                plant.allParts.push(branch1);
                this.setChildParams(branch1);
                this.children.push(branch1);
                plant.allParts.push(branch2);
                this.setChildParams(branch2);
                this.children.push(branch2);
                plant.allParts.push(branch3);
                this.setChildParams(branch3);
                this.children.push(branch3);

                this.continued = true;
            } else if(chance(plant.options.trunkBifurcateProb + plant.options.trunkBifurcateProbGenImpact*this.trunkGen)){
                var xx = 0;
                var yy = this.height;
                var spreadAng = plant.options.trunkBifurcateAngSpread;
                var axisAng = plant.options.trunkChildAng +randAmp(plant.options.trunkChildAngSpread);
                if(this.continued){
                    axisAng = plant.options.trunkBranchAng +randAmp(plant.options.trunkBranchAngSpread);
                }

                var branch1 = new PlantTrunk(xx, yy, xx/this.width, yy/this.height, axisAng - spreadAng/2, this.trunkGen+1, this, plant);
                var branch2 = new PlantTrunk(xx, yy, xx/this.width, yy/this.height, axisAng + spreadAng/2, this.trunkGen+1, this, plant);
                
                plant.allParts.push(branch1);
                this.setChildParams(branch1);
                this.children.push(branch1);
                plant.allParts.push(branch2);
                this.setChildParams(branch2);
                this.children.push(branch2);

                this.continued = true;
            } else {
                var dir = (chance(0.5) ? 1 : -1);
                var xx = 0;
                var yy = this.height;
                var ang = plant.options.trunkChildAng + randAmp(plant.options.trunkChildAngSpread);

                if(this.continued){
                    ang = plant.options.trunkBranchAng + randAmp(plant.options.trunkBranchAngSpread);
                }

                var branch = new PlantTrunk(xx, yy, xx/this.width, yy/this.height, ang, this.trunkGen+1, this, plant);

                branch.canHaveFruit = chance(plant.options.haveFruitChance);
                plant.allParts.push(branch);
                this.setChildParams(branch);
                this.children.push(branch);
                this.continued = true;
            }
        } else {
            if(!this.hasFruit){
                if(chance(this.trunkGen/4) && chance(0.2) && this.canHaveFruit){
                    this.hasFruit = true;
                    var xx = randRange(-this.width/2, this.width/2);
                    var yy = randRange(this.height*0.9, this.height);

                    var branch;
                    if(chance(0.5)){
                        branch = new PlantBerry(xx, yy, xx/this.width, yy/this.height, randRange(-Math.PI/8, Math.PI/8), this, plant);
                    } else {
                        branch = new PlantFlower(xx, yy, xx/this.width, yy/this.height, randRange(-Math.PI/8, Math.PI/8), this, plant);
                    }

                    plant.allParts.push(branch);
                    this.setChildParams(branch);
                    this.children.push(branch);
                } else if(this.children.length == 0){
                    var xx = randRange(-this.width/2, this.width/2);
                    var yy = this.height;

                    var leaf = new PlantLeaf(xx, yy, xx/this.width, yy/this.height, randRange(-Math.PI/8, Math.PI/8), this, plant);
                    plant.allParts.push(leaf);
                    this.setChildParams(leaf);
                    this.children.push(leaf);
                }
            }
        }

    }


    update(dt, plant){
        this.updateParams(dt, plant);

        this.width  = this.startWidth + (this.grownWidth - plant.options.trunkGenWidImpact*this.trunkGen - plant.options.trunkGenWidImpactSqr*this.trunkGen*this.trunkGen)*this.matureState;
        this.height = this.startHeight + (this.grownHeight - plant.options.trunkGenHeiImpact*this.trunkGen - plant.options.trunkGenHeiImpactSqr*this.trunkGen*this.trunkGen)*this.matureState;

        this.growTickAlarm.update(dt);
        if(this.growTickAlarm.finished){
            this.growTickAlarm.restart();
            this.createBranch(plant);
        }

        if(this.matureState > 1){
            for(var i = 0; i < this.children.length; i++){
                var child = this.children[i];
                if(child.type == 4 && child.matureState >= 1){
                    if(this.trunkGen <= 2){
                        this.removeChildIndex(i, plant);
                        i--;
                    }
                }
            }
        }

        this.updateChildren(dt, plant);
    }

    setChildParams(child){
        child.parentResX = this.x + Math.cos(this.ang)*child.parentOffXRat*this.width - Math.sin(this.ang)*child.parentOffYRat*this.height;
        child.parentResY = this.y + Math.cos(this.ang)*child.parentOffYRat*this.height + Math.sin(this.ang)*child.parentOffXRat*this.width;
        child.parentResAng = this.ang + child.parentOffAng;
    }

    updateChildren(dt, plant){
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            this.setChildParams(child);

            child.update(dt, plant);
        }
    }


    draw(ctx){
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.ang);
        // ctx.fillStyle = "rgb(255,255,255)";
        // ctx.fillRect(-1 -this.width/2,-1, this.width+2, this.height+2);
        ctx.fillStyle = this.color.toCSS();
       
        ctx.fillRect(-this.width/2,0, this.width, this.height);
        ctx.restore();
    }


    pushDrawList(){
        addList(new DrawRequest(this, this.depth, 0), OBJECT.DRAW);
        for(var i = 0; i < this.children.length; i++){
            var child = this.children[i];
            child.pushDrawList();
        }
    }
}

class ValueContainer{
    constructor(initVal, maxVal = initVal, minVal = initVal){
        this.val = initVal;
        this.maxVal = maxVal;
        this.minVal = minVal;
        
        this.variationAmp = 0;
    }

    get(){
        return randRange(this.minVal, this.maxVal) + randRange(-this.variationAmp, this.variationAmp);
    }
}

/*
        this.trunkGenMax = 8;
        this.trunkMaxWid = 8;
        this.trunkGenWidImpact = 1;
        this.trunkGenWidImpactSqr = 0;
        this.trunkMaxHei = 90;
        this.trunkGenHeiImpact = 8;
        this.trunkGenHeiImpactSqr = -0.1;
        this.trunkHeiVarPerc = 0.05;
        this.trunkWidVarPerc = 0.01; 

        this.leavesScl = 1.2;

    
        this.trunkGrowChance = 0.4;
        this.trunkGrowChanceChildImpact = 0.2;

        this.trunkChildAng = 0;
        this.trunkChildAngSpread = Math.PI/8;

        this.trunkBifurcateProb = 0;
        this.trunkBifurcateProbGenImpact = 0.2;
        this.trunkBifurcateAngSpread = Math.PI/4;


        this.trunkTrifurcateProb = 0.05;
        this.trunkTrifurcateProbGenImpact = 0.01;
        this.trunkTrifurcateAngSpread = Math.PI/4;



        this.haveFruitChance = 0.01; 

        this.matureTime = 10;
        this.growTick = 5;
*/

class PlantOptions{
    constructor(){
        this.trunkGenMax = 8;
        this.trunkMaxWid = 8;
        this.trunkGenWidImpact = 1;
        this.trunkGenWidImpactSqr = 0;
        this.trunkMaxHei = 90;
        this.trunkGenHeiImpact = 8;
        this.trunkGenHeiImpactSqr = -0.1;
        this.trunkHeiVarPerc = 0.05;
        this.trunkWidVarPerc = 0.01; 

        this.leavesScl = 1.2;

    
        this.trunkGrowChance = 0.4;
        this.trunkGrowChanceChildImpact = 0.2;

        this.trunkChildAng = 0;
        this.trunkChildAngSpread = Math.PI/50;
        this.trunkBranchAng = Math.PI/40;
        this.trunkBranchAngSpread = Math.PI/6;

        this.trunkBifurcateProb = 0;
        this.trunkBifurcateProbGenImpact = 0.2;
        this.trunkBifurcateAngSpread = Math.PI/4;


        this.trunkTrifurcateProb = 0;
        this.trunkTrifurcateProbGenImpact = 0.01;
        this.trunkTrifurcateAngSpread = Math.PI/4;



        this.haveFruitChance = 0.01; 

        this.matureTime = 10;
        this.growTick = 5;
    }
}



class Plant{
    constructor(x, y, ang){
        this.x = x;
        this.y = y;
        this.ang = ang;

        this.options = new PlantOptions();
        

        this.parts = [new PlantTrunk(this.x, this.y, 1, 1, this.ang, 0, null, this)];

        this.allParts = [this.parts[0]];

        this.inactiveParts = 0;

        this.deattached = [];

        this.age = 0;

        this.creatingBranch = 0;
    }


    update(dt){


        for(var i = 0 ; i < this.parts.length; i++){
            var part = this.parts[i];
            part.parentResX = this.x;
            part.parentResY = this.y;
            part.parentResAng = this.ang + Math.PI;
            part.update(dt, this);
        }

        for(var i = 0 ; i < this.deattached.length; i++){
            var part = this.deattached[i];
            part.update(dt, this);
            if(!part.active){
                this.deattached.splice(i, 1);
                i--;
            }
        }

        if(this.inactiveParts > 50){
            for(var i = 0; i < this.allParts.length; i++){
                if(!this.allParts[i].active){
                    this.allParts.splice(i, 1);
                    i--;
                }
            }
            this.inactiveParts = 0;
        }

    }

    shaveLeaves(){
        for(var i = 0 ; i < this.allParts.length; i++){
            var part = this.allParts[i];
            if(part.type == 4 && chance(0.1)){
                if(part.parent){
                    part.parent.removeLeaves(this);
                }
            }
        }
    }

    createRandomBranch(branchNum){
        this.creatingBranch = branchNum;
        for(var i = 0 ; i < this.parts.length; i++){
            var part = this.parts[i];
            part.createRandomBranch(this);
        }
        this.creatingBranch = 0;
    }

    pushDrawList(){
        for(var i = 0 ; i < this.parts.length; i++){
            var part = this.parts[i];
            part.pushDrawList();
        }

        for(var i = 0 ; i < this.deattached.length; i++){
            var part = this.deattached[i];
            part.pushDrawList();
        }
    }
}


class PlantManager{
    constructor(){
        this.plants = [];
        this.restartBut = new SpriteButton(-100, roomHeight*0.5 - 50, 100, 100, sprites[SPR.RESTART]);
    }

    restart(){
        this.plants = [];
        this.plants.push(new Plant(roomWidth/2, roomHeight, Math.PI));
    }

    update(dt){
        for(var i = 0 ; i < this.plants.length; i++){
            this.plants[i].update(dt);
        }
        this.restartBut.update(input.mouseX, input.mouseY, input.mouseState[0][0], input.mouseState[0][1]);
        if(this.restartBut.clicked){
            this.restart();
        }

        if(input.mouseState[2][1]){
            this.plants[0].shaveLeaves();
        }
    }
    pushDrawList(){
        for(var i = 0 ; i < this.plants.length; i++){
            this.plants[i].pushDrawList();
        }
    }
}