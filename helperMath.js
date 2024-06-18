
function Vector(x, y) {
    this.x = x;
    this.y = y;

    this.add = function (vec) {
        return new Vector(this.x + vec.x, this.y + vec.y);
    }

    this.sub = function (vec) {
        return new Vector(this.x - vec.x, this.y - vec.y);
    }

    this.mult = function (val) {
        return new Vector(this.x * val, this.y * val);
    }

    this.div = function (val) {
        return new Vector(this.x / val, this.y / val);
    }

    this.mag = function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    this.unit = function () {
        var _mag = this.mag();
        if (_mag != 0) {
            return new Vector(this.x / _mag, this.y / _mag);
        }
        return new Vector(0, 0);
    }

    this.dot = function (vec) {
        return this.x * vec.x + this.y * vec.y;
    }

    this.normal = function () {
        return new Vector(-this.y, this.x);
    }

    this.cross = function (v) {
        return this.x * v.y - this.y * v.x;
    }
}


// Helper Functions
function clamp(val, min, max) {
    if (val < min) return min;
    else if (val > max) return max;
    return val;
}

function sign(val) {
    if (val > 0) return 1;
    else if (val < 0) return -1;
    return 0;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function randRange(min, max){
  return (Math.random() * (max - min)) + min;
}

function distance(dx, dy) {
    return Math.sqrt((dx * dx) + (dy * dy));
}

function sqrDist(dx, dy) {
    return (dx * dx) + (dy * dy);
}

function manhattanDist(dx, dy){
  return dx + dy;
}

function chance(val){
  return (Math.random() < val);
}

function pointInRect(x, y, x1, y1, x2, y2) {
    if (x > x1 && x < x2 && y > y1 && y < y2) {
        return true;
    }
    return false;
}

function rectCollision(x1, y1, wid1, hei1, x2, y2, wid2, hei2) {
    if (!(x2 + wid2 - x1 > 0 && x1 + wid1 - x2 > 0)) {
        return 0;
    }

    if (!(y2 + hei2 - y1 > 0 && y1 + hei1 - y2 > 0)) {
        return 0;
    }

    return 1;
}

// Convert radians to degrees
function rad2deg(radians) {
  return radians * (180 / Math.PI);
}

// Convert degrees to radians
function deg2rad(degrees) {
  return degrees * (Math.PI / 180);
}
