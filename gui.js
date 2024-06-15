
function pointInside(point, x, y, wid, hei){
  if(point.x < x || point.x >= x+wid) return false;
  if(point.y < y || point.y >= y+hei) return false;
  return true;
}

function Button(x, y, wid, hei){
    this.x = x;
    this.y = y;
    this.wid = wid;
    this.hei = hei;

    this.hovered = false;
    this.clicked = false;
    this.down    = false;

    this.holding = false;

    this.label    = "";
    this.subLabel = "";

    this.labelColor    = new Color(255,255,255);
    this.subLabelColor = new Color(0,0,0);

    this.boxColor      = new Color(200,100,100);
    this.outlineColor  = new Color(0,0,0);



    this.update = function(mouseX, mouseY, mouseState, mouseClick) {
        this.hovered = false;
        this.clicked = false;
        this.down = false;

        if (pointInside({x:mouseX, y:mouseY}, this.x, this.y, this.wid, this.hei)) {
            this.hovered = true;
        }

        if (mouseClick) {
            if (this.hovered) {
                this.clicked = true;
                this.down = true;
            }
            else {
                this.down = false;
            }
        }

        if (this.down) {
            if (!mouseState) {
                this.down = false;
            }
        }
    }


    this.draw = function() {
        let col = this.boxColor.copy();

        // Darkening The button
        if (this.down) {
            col.b = Math.max(col.b*0.5, 0);
            col.r = Math.max(col.r*0.5, 0);
            col.g = Math.max(col.g*0.5, 0);
        }

        if (this.hovered) {
            col.b = Math.max(col.b*0.5, 0);
            col.r = Math.max(col.r*0.5, 0);
            col.g = Math.max(col.g*0.5, 0);
        }

        ctx.fillStyle = col.toCSS();
        ctx.strokeStyle = this.outlineColor.toCSS();

        ctx.fillRect(this.x, this.y, this.wid, this.hei);

        // Label
        ctx.fillStyle = this.labelColor.toCSS();
        let fontSize = this.hei / 1.4;
        ctx.font = "Arial " + Math.floor(fontSize) + "px";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(this.label, this.x + this.wid / 2, this.y + this.hei / 2);

        // SubLabel
        ctx.fillStyle = this.subLabelColor.toCSS();
        fontSize = this.hei / 1.4;
        ctx.font = "Arial " + Math.floor(fontSize) + "px";
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        ctx.fillText(this.subLabel, this.x, this.y + this.hei);
    }
}
