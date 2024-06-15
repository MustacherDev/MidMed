

function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.checkCollision = function (otherBoundingBox) {
        if (this.x < otherBoundingBox.x + otherBoundingBox.width &&
            this.x + this.width > otherBoundingBox.x &&
            this.y < otherBoundingBox.y + otherBoundingBox.height &&
            this.y + this.height > otherBoundingBox.y) {
            return true; // Collision detected
        }
        return false; // No collision
    };

    this.isPointInside = function(x,y){
      return pointInRect(x, y, this.x, this.y, this.x + this.width, this.y + this.height);
    }

    this.show = function () {
        // Draw the rectangle border
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    };
}
// Block Collisions
function aabbCollision(a, b) {
    if (b.x2 - a.x1 > a.width + b.width || a.x2 - b.x1 > a.width + b.width) {
        return false;
    } else if (b.y2 - a.y1 > a.height + b.height || a.y2 - b.y1 > a.height + b.height) {
        return false;
    }
    return true;
}

function blockCollision(a, b) {
    if (aabbCollision(a, b)) {
        var dx = a.x1 - b.x2;
        var dx2 = a.x2 - b.x1;
        var dy = a.y1 - b.y2;
        var dy2 = a.y2 - b.y1;

        if (Math.abs(dx2) < Math.abs(dx)) {
            dx = dx2;
        }

        if (Math.abs(dy2) < Math.abs(dy)) {
            dy = dy2;
        }

        var rest = a.weight / (a.weight + b.weight);
        if (Math.abs(dx) < Math.abs(dy)) {
            dx /= 2;
            a.x -= (1 - rest) * dx;
            b.x += rest * dx;

            a.hspd = (a.hspd + b.hspd) * (1 - rest);
            b.hspd = (a.hspd + b.hspd) * (rest);
        } else {
            dy /= 2;
            a.y -= (1 - rest) * dy;
            b.y += rest * dy;

            a.vspd = (a.vspd + b.vspd) * (1 - rest);
            b.vspd = (a.vspd + b.vspd) * (rest);
        }
    }
}

function collisions() {
    var _len = objectLists[OBJECT.BLOCK].length;

    for (var i = 0; i < _len; i++) {
        objectLists[OBJECT.BLOCK][i].updatePos();
    }

    for (var i = 0; i < _len; i++) {
        var blockA = objectLists[OBJECT.BLOCK][i];
        for (var j = i + 1; j < _len; j++) {
            var blockB = objectLists[OBJECT.BLOCK][j];
            blockCollision(blockA, blockB);
        }
    }
}


// Base Object
function GameObject(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.hspd = 0;
    this.vspd = 0;
    this.angSpd = 0;

    this.sprite = sprite;
    this.depth = 0;
    this.ang = 0;
    this.xScl = 1;
    this.yScl = 1;

    this.active = true;
}

GameObject.prototype.show = function () {
    this.sprite.drawSimple(this.x, this.y, 0, this.xScl);
};

GameObject.prototype.update = function () {
    this.x += this.hspd;
    this.y += this.vspd;
    this.ang += this.angSpd;
};




function TextObject(x, y, text) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.active = true;
    this.timer = 40;

    this.update = function () {
        this.y -= 1;
        this.timer--;

        if (this.timer == 0) {
            this.active = false;
        }
    }

    this.show = function () {
        ctx.font = "20px Fixedsys";

        let hue = Math.random() * 360;
        ctx.fillStyle = "hsl(" + hue + ", 100%, 50%)";
        ctx.fillText(this.text, this.x + 2, this.y + 2);
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText(this.text, this.x, this.y);
    }
}



function Block(x, y, wid, hei) {
    GameObject.call(this, x, y, sprites[SPR.BOMB]);

    this.width = wid;
    this.height = hei;
    this.centerX = 0;
    this.centerY = 0;

    this.x1 = this.x - this.centerX;
    this.x2 = this.x - this.centerX + this.width;
    this.y1 = this.y - this.centerY;
    this.y2 = this.y - this.centerY + this.height;

    this.weight = 1;


    //   pos =  x1, y1, x2, y2
    //this.pos = [0, 0, wid, hei];

    this.show = function () {
        this.strokeBounds();
    }

    this.strokeBounds = function () {
        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.strokeRect(this.x - this.centerX, this.y - this.centerY, this.width, this.height);
    }

    this.updatePos = function () {
        // Updates Bounding Points
        this.x1 = this.x - this.centerX;
        this.x2 = this.x - this.centerX + this.width;
        this.y1 = this.y - this.centerY;
        this.y2 = this.y - this.centerY + this.height;
    }

    this.update = function () {
        this.x += this.hspd;
        this.y += this.vspd;

        this.vspd += 0.1;

        this.hspd = clamp(this.hspd, -40, 40);
        this.vspd = clamp(this.vspd, -40, 40);

        if (this.x + this.width > width) {
            this.x = width - this.width;
            this.hspd *= -0.9;

        } else if (this.x < 0) {
            this.x = 0;
            this.hspd *= -0.9;
        }

        if (this.y + this.height > height) {
            this.y = height - this.height;
            this.vspd *= -0.9;
        } else if (this.y < 0) {
            this.y = 0;
            this.vspd *= -0.9;
        }

    }
}






function BallCollider(x, y, r, m) {
    this.pos = new Vector(x, y);
    this.r = r;
    this.vel = new Vector(0, 0);
    this.acc = new Vector(0, 0);

    this.m = m;
    if (this.m === 0) {
        this.inv_m = 0;
    } else {
        this.inv_m = 1 / this.m;
    }

    this.dampening = 0.9;
    this.elasticity = 1;
    this.acceleration = 1;
    this.player = false;

    this.updatePos = function () {
        this.vel = this.vel.add(this.acc).mult(this.dampening);
        this.pos = this.pos.add(this.vel);
    }

    this.show = function () {
        if (this.player) {
            ctx.fillStyle = "rgb(200, 40, 0)";
        } else {
            if (this.inv_m == 0) {
                ctx.fillStyle = "rgb(70, 60, 100)";
            } else {
                ctx.fillStyle = "rgb(100, 150, 0)";
            }
        }
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgb(220, 220, 220)";
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.pos.x + this.r, this.pos.y);
        ctx.stroke();
    }
}




function WallCollider(x1, y1, x2, y2) {
    this.pos1 = new Vector(x1, y1);
    this.pos2 = new Vector(x2, y2);

    this.normal = this.pos2.sub(this.pos1).unit();
    this.len = this.pos2.sub(this.pos1).mag();
    this.r = 0;

    this.elasticity = 1;

    this.show = function () {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgb(200, 200, 200)";
        ctx.beginPath();
        ctx.moveTo(this.pos1.x, this.pos1.y);
        ctx.lineTo(this.pos2.x, this.pos2.y);
        ctx.stroke();
    }
}
























function Ball(x, y, radius, sprite) {
    Block.call(this, x, y, radius * 2, radius * 2);
    GameObject.call(this, x, y, sprite);

    this.r = radius;

    this.boundingBox = new BoundingBox(this.x, this.y, this.r*2, this.r*2);

    this.hovered = false;
    this.holded = false;
    this.holdX = 0;
    this.holdY = 0;

    this.prevX = 0;
    this.prevY = 0;

    this.hspdMax = 40;
    this.vspdMax = 40;

    this.angDamp = 0.99;
    this.linDamp = 0.999;

    this.vLoss = 0.8;
    this.hLoss = 0.9;

    this.gravity = 0.1;
    this.floorY = roomHeight - 20;

    this.onGround = false;

    this.tick = 0;

    this.show = function () {
        //this.strokeBounds();
        this.sprite.drawRot(this.x, this.y, 0, this.xScl, this.xScl, this.ang, true);

        //this.boundingBox.show();
    }

    this.getHold = function(){
      if(this.hovered && !this.holded && input.mouseState[0][1] && manager.holding == false){
        manager.holding = true;
        this.holded = true;
        this.holdX = input.mouseX - this.x;
        this.holdY = input.mouseY - this.y;
        this.hspd = 0;
        this.vspd = 0;
      }
    }

    this.updateHold = function(){
      if(this.holded){
        manager.holding = true;
        this.x = input.mouseX - this.holdX;
        this.y = input.mouseY - this.holdY;

        if(!input.mouseState[0][0]){
          this.holded = false;
          this.hspd = this.x - this.prevX;
          this.vspd = this.y - this.prevY;
        }
      }
    }



    this.parameterStep = function(){
      // Gravity
      this.vspd += this.gravity;

      this.hspd *= this.linDamp;
      this.vspd *= this.linDamp;

      this.hspd = clamp(this.hspd, -this.hspdMax, this.hspdMax);
      this.vspd = clamp(this.vspd, -this.vspdMax, this.vspdMax);
      this.angSpd = clamp(this.angSpd, -0.5, 0.5);

      this.angSpd *= this.angDamp;

      this.prevX = this.x;
      this.prevY = this.y;
      this.x += this.hspd;
      this.y += this.vspd;
      this.ang += this.angSpd;

      this.boundingBox.x = this.x  - (this.boundingBox.width / 2);
      this.boundingBox.y = this.y  - (this.boundingBox.height/ 2);

    }

    this.update = function () {

        this.parameterStep();

        this.hovered = false;
        if(this.boundingBox.isPointInside(input.mouseX, input.mouseY)){
          this.hovered = true;
        }

        this.getHold();

        // Wall Collisions
        if (!this.holded) {
            this.tick++;

            if (this.x + this.r > roomWidth) {
                this.x = roomWidth - this.r;
                this.angSpd += this.vspd / 40;
                this.hspd *= -this.hLoss;

            } else if (this.x - this.r < 0) {
                this.x = this.r;

                this.angSpd += this.vspd / 40;

                this.hspd *= -this.hLoss;
            }


            if (this.y + this.r > roomHeight + 200) {
                this.vspd = -15;
                this.angSpd = -0.25 + Math.random()*0.5;
            }

            if (this.y + this.r > this.floorY) {
                this.y = this.floorY - this.r;
                if (Math.abs(this.vspd) > this.gravity * 3) {
                    this.angSpd += this.hspd / 40;
                }
                this.vspd *= -this.vLoss;
                this.hspd *= this.linDamp;
            }
        }

        if(this.y + this.r + 1 > this.floorY){
          this.onGround = true;
        } else {
          this.onGround = false;
        }

        if(this.onGround){
          this.angSpd = this.hspd/40;
        }

        this.updateHold();
    }
}

function Bitcoin(x, y, radius) {
  Ball.call(this, x, y, radius, sprites[SPR.BITCOIN]);
  this.xScl = (2*radius)/this.sprite.width;
  this.yScl = (2*radius)/this.sprite.height;
  this.hovered = false;
}


function Dust(x, y) {
    GameObject.call(this, x, y, sprites[SPR.BOMB]);
    this.life = randInt(100, 400);

    this.xScl = randInt(4, 10);
    this.yScl = this.xScl;

    this.hspd = randInt(-1, 2);
    this.vspd = randInt(-1, 2);

    this.update = function () {
        if (this.life > 0) {
            this.life--;
        } else {
            this.active = false;
        }

        this.x += this.hspd;
        this.y += this.vspd;


    }
}

Dust.prototype = Object.create(GameObject.prototype);
