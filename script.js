
function stateInit(){
  if (input.mouseState[0][1] && (allDataIsLoaded || checkImages())) {
     loadSprites();
     executingState = stateMenu;
     setupMenuState();
 }
}





var executingState = stateInit;

function step() {

  canvas.style.cursor = 'default';

  ctx.fillStyle = "rgb(10, 10, 10)";
  ctx.fillRect(0,0, canvas.width, canvas.height);

  ctx.save();
  ctx.scale(canvasSclX, canvasSclY);
  ctx.translate(canvasOffsetX, canvasOffsetY);

  //scaleCanvasContent();

  executingState();

  // Input Handling
  input.update();

  ctx.restore();


  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
