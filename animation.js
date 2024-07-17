

class AnimationObject{
    constructor(){
        this.progress = 0;
        this.step = 0;
        this.stepSpd = 0.1;
        this.tweenMode = 0;
        this.loopMode = 0; 
    }

    updateStep(dt){
        
        if(this.step > 1){
            if(this.loopMode == 1){
                this.step = 0;
            } else if (this.loopMode == 2){
                this.step = 1;
                this.stepSpd *= -1;
            }
        } else if(this.step < 0){
            if(this.loopMode == 1){
                this.step = 1;
            } else if (this.loopMode == 2){
                this.step = 0;
                this.stepSpd *= -1;
            }
        } else {
            this.step += this.stepSpd*dt;
        }

        switch(this.tweenMode){
            case 0:
                this.progress = clamp(this.step, 0, 1);
                break;

            case 1:
                this.progress = tweenIn(clamp(this.step, 0, 1));
                break;

            case 2:
                this.progress = tweenOut(clamp(this.step, 0, 1));
                break;

            case 3:
                this.progress = tweenInOut(clamp(this.step, 0, 1));
                break;
            default:
                this.progress = clamp(this.step, 0, 1);
                break;
        }
    }

    update(dt){
        this.updateStep(dt);
    }

    draw(x, y, xScl, yScl, angle){

    }
}

class AnimationObjectClick extends AnimationObject{
    constructor(){
        super();
    }

    draw(x, y, xScl, yScl, angle){
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(xScl, yScl);
        ctx.rotate(angle);

        var radius = 5 + 5*this.progress;
        var len = 10;
        var wid = 5;
        var barNum = 5;

        var border = 2;

        
        ctx.globalAlpha = tweenOut(this.progress);
       
        for(var i = 0 ; i < barNum; i++){
            ctx.rotate((Math.PI*2/barNum));
            ctx.fillStyle = "rgb(0,0,0)";
            ctx.fillRect(radius - border, -wid/2 - border, len + 2*border, wid + 2*border);
            ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillRect(radius, -wid/2, len, wid);
        }

        ctx.restore();

    }
}