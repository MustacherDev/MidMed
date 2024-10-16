
function Vector(x, y) {
    this.x = x;
    this.y = y;

    this.set = function(x, y){
      this.x = x;
      this.y = y;
    }

    this.setVec = function(vec){
      this.x = vec.x;
      this.y = vec.y;
    }

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

    this.angle = function(){
      return Math.atan2(this.y, this.x);
    }

    this.setAngle = function(ang){
      this.x = Math.cos(ang);
      this.y = Math.sin(ang);
    }

    this.rotate = function(ang){
      const cosTheta = Math.cos(ang);
      const sinTheta = Math.sin(ang);
      var xRot = this.x*cosTheta - this.y*sinTheta;
      var yRot = this.x*sinTheta + this.y*cosTheta;
      this.x = xRot;
      this.y = yRot;
    }

    this.getCopy = function(){
      return new Vector(this.x, this.y);
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

function randAmp(amp){
  return randRange(-amp, amp);
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

function choose(options){
  var ind = randInt(0,options.length);
  return options[ind];
}

function tweenIn(percentage){
  return percentage*percentage;
}

function tweenOut(percentage){
  return 1 - (1-percentage)*(1-percentage);
}

function tweenInOut(percentage){
  return -(Math.cos(Math.PI * percentage) - 1) / 2;
}

function zigzag(percentage){
  return (1- Math.abs(percentage*2 -1));
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

function normalizeAngle(ang) {
  // Handle zero or negative angles
  var angle = ang;
  angle = angle % (2 * Math.PI); // Wrap to 0 to 2*PI range
  if (angle < 0) {
    angle += Math.PI * 2;
  }
  return angle;
}

function rotatePoint(x, y, ang) {
  const cosTheta = Math.cos(ang);
  const sinTheta = Math.sin(ang);
  var xRot = x*cosTheta - y*sinTheta;
  var yRot = x*sinTheta + y*cosTheta;
  return new Vector(xRot, yRot);
}

function transformPoint(x, y, ctx) {
  const matrix = ctx.getTransform(); // Get the current transformation matrix
  const a = matrix.a;
  const b = matrix.b;
  const c = matrix.c;
  const d = matrix.d;
  const e = matrix.e;
  const f = matrix.f;

  const xPrime = a * x + c * y + e;
  const yPrime = b * x + d * y + f;

  return new Vector(xPrime - camX, yPrime - camY);
}

function phaseAngleToSide(angle) {
  // Normalize the angle to the range [0, 2*Pi]
  angle = angle % (2 * Math.PI);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }

  return (angle > Math.PI / 2 && angle <= 3 * Math.PI / 2) ? false : true;
}
