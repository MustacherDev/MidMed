var canvas = document.getElementById('Canvas');
var ctx = canvas.getContext('2d');

var roomWidth = 1280;
var roomHeight = 720;
var canvasSclX = 1;
var canvasSclY = 1;
var canvasOffsetX = 0;
var canvasOffsetY = 0;

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);



const curtainsDiv = document.querySelectorAll(".curtain");

for (const curtainDiv of curtainsDiv) {
  curtainDiv.addEventListener("touchend", function handleTouchEndCurtain(event) {
    event.preventDefault();
  }, false);
}

function resizeCanvas(){

  if(isMobile){
    roomWidth = 1450;
    roomHeight = 720;
  }

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  canvas.style.left = 0+"px";
  canvas.style.top  = 0+"px";
  canvas.style.position = "absolute";

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


  for(var i = 0; i < curtainsDiv.length; i++){
    curtainsDiv[i].style.width = (2+(Math.floor(100*canvasOffsetX/canvas.width)))+"%";
  }

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





canvas.addEventListener('contextmenu', preventContextMenu);
function preventContextMenu(event) {
  event.preventDefault();
}
