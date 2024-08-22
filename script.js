
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




function stateMenu(dt){

  ctx.save();
  ctx.translate(canvasOffsetX, canvasOffsetY);
  ctx.scale(canvasSclX, canvasSclY);
  mainCam.applyTransform(ctx);

  musicBox.play(dt);

  // BLACK BACKGROUND
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0,0,roomWidth, roomHeight);

  if(input.keyState[KeyCodes.KeyZ][0]){
    mainCam.scale += 0.01*mainCam.scale;
  }

  if(input.keyState[KeyCodes.KeyX][0]){
    mainCam.scale -= 0.01*mainCam.scale;
  }

  if(input.keyState[KeyCodes.KeyA][0]){
    mainCam.x -= 20;
  }

  if(input.keyState[KeyCodes.KeyD][0]){
    mainCam.x += 20;
  }

  if(input.keyState[KeyCodes.KeyW][0]){
    mainCam.y -= 20;
  }

  if(input.keyState[KeyCodes.KeyS][0]){
    mainCam.y += 20;
  }

  if(input.keyState[KeyCodes.KeyQ][0]){
    mainCam.angle -= 0.01;
  }

  if(input.keyState[KeyCodes.KeyE][0]){
    mainCam.angle += 0.01;
  }

  manager.update(dt);

  updateList(OBJECT.GAMEOBJECT, dt);

  manager.draw(ctx);


  sortDepth();
  drawList(OBJECT.DRAW);




  objectLists[OBJECT.DRAW] = [];
  cleanAllLists();






  if(!manager.fadeInAlarm.paused){
    ctx.fillStyle = "rgba(0,0,0," + (1 - manager.fadeInAlarm.percentage()) + ")";
    ctx.fillRect(0,0,roomWidth, roomHeight);
  }


  ctx.restore();

  manager.curtainLeft.draw(ctx);
  manager.curtainRight.draw(ctx);

  
  ctx.save();
  ctx.translate(canvasOffsetX, canvasOffsetY);
  ctx.scale(canvasSclX, canvasSclY);




  manager.drawGUI();


  
  ctx.restore();
  manager.openingManager.draw(ctx);

  // if(!manager.openingManager.paused){
  //   manager.openingManager.curtainLeft.update(dt);
  //   manager.openingManager.curtainRight.update(dt);
  // }


  mainCam.lateUpdate(dt);
}


var executingState = stateInit;


var elapsedTime = 0;
var thenTimeDate = new Date();
const FRAMERATE = 60;

function step() {


  var nowTimeDate = new Date();
  elapsedTime = nowTimeDate.getTime() - thenTimeDate.getTime();

  var discountTime = 0;
  if(pageFocusChange && pageFocused){
    discountTime = nowTimeDate.getTime() - pageUnfocusedStart.getTime();
    pageFocusChange = false;
  }

  elapsedTime = Math.max(elapsedTime - discountTime, 0);

  thenTimeDate = new Date(nowTimeDate);
  var dt = elapsedTime/(1000/FRAMERATE);

  canvas.style.cursor = 'default';


  ctx.fillStyle = "rgb(10, 10, 10)";
  ctx.fillRect(0,0, canvas.width, canvas.height);


  executingState(dt);

  // Input Handling
  input.update();




  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
