
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
  //scaleCanvasContent();

  executingState();

  // Input Handling
  input.update();

  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
