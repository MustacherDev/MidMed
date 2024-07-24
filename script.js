
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
  ctx.translate(camX, camY);


  //scaleCanvasContent();


  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0,0,roomWidth, roomHeight);

  manager.update(dt);

  updateList(OBJECT.GAMEOBJECT, dt);

  manager.draw(ctx);


  sortDepth();
  drawList(OBJECT.DRAW);


  manager.drawGUI();

  objectLists[OBJECT.DRAW] = [];
  cleanAllLists();






  if(!manager.fadeInAlarm.paused){
    ctx.fillStyle = "rgba(0,0,0," + (1 - manager.fadeInAlarm.percentage()) + ")";
    ctx.fillRect(0,0,roomWidth, roomHeight);
  }

  ctx.restore();
  
  var curtainExtraHei = 20;
  var curtainWid = (window.innerWidth - canvasSclX*roomWidth)/2;
  var curtainHei = window.innerHeight + curtainExtraHei;
  var curtainScl = curtainHei/sprites[SPR.CURTAIN].height;
  var curtainExtraX = 20;

  var canvasSpace = window.innerWidth - curtainWid*2;

  var curtainsState = manager.curtainsState;

  
  sprites[SPR.CURTAIN].drawExt(curtainWid + curtainExtraX + (canvasSpace/2)*curtainsState,-curtainExtraHei/2, 0, curtainScl, curtainScl, 0, sprites[SPR.CURTAIN].width, 0);
  sprites[SPR.CURTAIN].drawExt(window.innerWidth - curtainWid - curtainExtraX - (canvasSpace/2)*curtainsState,-curtainExtraHei/2, 0, curtainScl, curtainScl, 0, 0, 0);


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

  // if(elapsedTime < 1000/FRAMERATE){
  //   window.requestAnimationFrame(step);
  //   return;
  // }

  thenTimeDate = new Date(nowTimeDate);
  var dt = elapsedTime/(1000/FRAMERATE);
  //console.log(dt)

  canvas.style.cursor = 'default';


  ctx.fillStyle = "rgb(10, 10, 10)";
  ctx.fillRect(0,0, canvas.width, canvas.height);


  executingState(dt);

  // Input Handling
  input.update();




  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
