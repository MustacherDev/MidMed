var canvas = document.getElementById('Canvas');
var ctx = canvas.getContext('2d');

canvas.style.left = ((window.innerWidth - canvas.width)/2)+"px";
canvas.style.top  = ((window.innerHeight - canvas.height)/2)+"px";
canvas.style.position = "absolute";

// Set the font properties
ctx.font = '14px Arial'; // font size and family

// Anti-alising deactivator
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

// Set the fill color
ctx.fillStyle = 'black';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

var roomWidth = canvas.width;
var roomHeight = canvas.height;


const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
