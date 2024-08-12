var canvas = document.getElementById('Canvas');
var ctx = canvas.getContext('2d');

var roomWidth = 1280;
var roomHeight = 720;
var canvasSclX = 1;
var canvasSclY = 1;
var canvasOffsetX = 0;
var canvasOffsetY = 0;
var pageFocused = true;
var pageFocusChange = false;
var pageUnfocusedStart = new Date();

var camX = 0;
var camY = 0;

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);



function resizeCanvas(){

  if(isMobile){
    roomWidth = 1450;
    roomHeight = 720;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style.left = 0+"px";
    canvas.style.top  = 1+"px";
    canvas.style.position = "absolute";


  } else {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style.left = 0+"px";
    canvas.style.top  = 0+"px";
    canvas.style.position = "absolute";
  }

 



  var sclX = canvas.width/roomWidth;
  var sclY = canvas.height/roomHeight;

  if(sclX < sclY){
    canvasSclX = sclX;
    canvasSclY = sclX;
  } else {
    canvasSclX = sclY;
    canvasSclY = sclY;
  }

  canvasOffsetX = (canvas.width -(roomWidth*canvasSclX))/2;
  canvasOffsetY = (canvas.height -(roomHeight*canvasSclY))/2;



  // Anti-alising deactivator
  ctx.webkitImageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  // Set the font properties
  ctx.font = '14px Arial'; // font size and family
  // Set the fill color
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

var isFullScreen = false;
function openFullscreen() {
  if(isFullScreen) return;
  if(!isMobile) return;

  let elem = document.documentElement;
  isFullScreen = true;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}


canvas.addEventListener('contextmenu', preventContextMenu);
function preventContextMenu(event) {
  event.preventDefault();
}

function checkPageFocus() {
  const visibilityState = document.visibilityState;
  if (visibilityState === "visible") {
    pageFocused = true;
    pageFocusChange = true;
  } else {
    pageFocused = false;
    pageFocusChange = true;
    pageUnfocusedStart =  new Date();
  }
}

// Check on initial load
checkPageFocus();

// Listen for visibility changes
window.addEventListener("visibilitychange", checkPageFocus);


class Camera {
  constructor(x, y, scale, ang){
    this.x = x;
    this.y = y;
    this.xOff = 0;
    this.yOff = 0;
    // X AND Y THAT GET SET TO 0 EACH FRAME
    this.xAdd = 0;
    this.yAdd = 0;

    this.xAddTemp = 0;
    this.yAddTemp = 0;

    this.scale = scale;
    this.angle = ang;
    this.width = roomWidth;
    this.height = roomHeight;
  }

  worldPos(canvasX, canvasY){
    var dx = (canvasX);
    var dy = (canvasY);
  
    var vec = new Vector(dx, dy);

    vec.x -= + this.width/2;
    vec.y -= + this.height/2;

    vec.x /= this.scale;
    vec.y /= this.scale;

    vec.rotate(-this.angle);

    vec.x += this.x + this.xOff + this.xAdd;
    vec.y += this.y + this.yOff + this.yAdd;

    return vec;
    
  }

  addPos(x, y){
    this.xAddTemp += x;
    this.yAddTemp += y;
  }

  lateUpdate(dt){
    this.xAdd = this.xAddTemp;
    this.yAdd = this.yAddTemp;
    this.xAddTemp = 0;
    this.yAddTemp = 0;
  }

  applyTransform(ctx){
    ctx.translate(this.width/2, this.height/2);
    ctx.rotate(this.angle);
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.x -this.xOff - this.xAdd, -this.y - this.yOff - this.yAdd);
  }

  removeTransform(ctx){
    // NOT RIGHT
    ctx.translate(this.width/2, this.height/2);
    ctx.scale(1/this.scale, 1/this.scale);
    ctx.rotate(-this.angle);
    ctx.translate(-this.x - this.xOff, -this.y - this.yOff);
  }
}

var mainCam = new Camera(roomWidth/2, roomHeight/2, 1, 0);