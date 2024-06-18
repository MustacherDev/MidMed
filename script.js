
function stateInit(){
  if (input.mouseState[0][1] && (allDataIsLoaded || checkImages())) {
     loadSprites();
     executingState = stateMenu;
     setupMenuState();
 }
}



function setupMenuState(){
  manager.init();
}


function stateMenu(){

  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0,0,roomWidth, roomHeight);

  manager.update(input);
  manager.draw(ctx);

  updateList(OBJECT.GAMEOBJECT);
  drawList(OBJECT.DRAW);

  if(manager.startFrames > 0){
    manager.startFrames--;
    ctx.fillStyle = "rgba(0,0,0," + (manager.startFrames/manager.startFramesMax) + ")";
    ctx.fillRect(0,0,roomWidth, roomHeight);
  }

}


var executingState = stateInit;

function step() {

  canvas.style.cursor = 'default';

  ctx.fillStyle = "rgb(10, 10, 10)";
  ctx.fillRect(0,0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(canvasOffsetX, canvasOffsetY);
  ctx.scale(canvasSclX, canvasSclY);

  //scaleCanvasContent();

  executingState();

  // Input Handling
  input.update();

  ctx.restore();


  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
