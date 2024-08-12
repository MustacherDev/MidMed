

// Event Handlers

const KeyCodes = {
    Backspace: 8,
    Tab: 9,
    Enter: 13,
    Shift: 16,
    Control: 17,
    Alt: 18,
    Pause: 19,
    CapsLock: 20,
    Escape: 27,
    Space: 32,
    ArrowLeft: 37,
    ArrowUp: 38,
    ArrowRight: 39,
    ArrowDown: 40,
    Delete: 46,
    Digit0: 48,
    Digit1: 49,
    Digit2: 50,
    Digit3: 51,
    Digit4: 52,
    Digit5: 53,
    Digit6: 54,
    Digit7: 55,
    Digit8: 56,
    Digit9: 57,
    Equal: 61,
    KeyA: 65,
    KeyB: 66,
    KeyC: 67,
    KeyD: 68,
    KeyE: 69,
    KeyF: 70,
    KeyG: 71,
    KeyH: 72,
    KeyI: 73,
    KeyJ: 74,
    KeyK: 75,
    KeyL: 76,
    KeyM: 77,
    KeyN: 78,
    KeyO: 79,
    KeyP: 80,
    KeyQ: 81,
    KeyR: 82,
    KeyS: 83,
    KeyT: 84,
    KeyU: 85,
    KeyV: 86,
    KeyW: 87,
    KeyX: 88,
    KeyY: 89,
    KeyZ: 90,
    Numpad0: 96,
    Numpad1: 97,
    Numpad2: 98,
    Numpad3: 99,
    Numpad4: 100,
    Numpad5: 101,
    Numpad6: 102,
    Numpad7: 103,
    Numpad8: 104,
    Numpad9: 105,
    NumpadMultiply: 106,
    NumpadAdd: 107,
    NumpadEnter: 108,
    NumpadSubtract: 109,
    NumpadDecimal: 110,
    NumpadDivide: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    NumLock: 144,
    ScrollLock: 145,
    Semicolon: 186,
    Comma: 188,
    Minus: 189,
    Period: 190,
    Slash: 191,
    Backquote: 192,
    BracketLeft: 219,
    Backslash: 220,
    BracketRight: 221,
    Quote: 222,
};


function Input() {
    this.keyState = [];
    this.mouseState = [];
    this.mouseX = 0;
    this.mouseY = 0;

    this.mouseViewX = 0;
    this.mouseViewY = 0;

    this.mouseCanvasX = 0;
    this.mouseCanvasY = 0;

    this.touchX = 0;
    this.touchY = 0;
    this.touchState = [];

    this.init = function () {
        for (var i = 0; i < 256; i++) {
            var vals = [];
            for (var j = 0; j < 3; j++) {
                vals.push(false);
            }
            this.keyState.push(vals);
        }

        for(var i = 0 ; i < 3; i++){
          this.mouseState.push([false, false, false]);
        }

        this.touchState = [false, false, false];
    }

    this.update = function () {
        for (var i = 0; i < 256; i++) {
            this.keyState[i][1] = false;
            this.keyState[i][2] = false;
        }

        for(var i = 0; i < 3; i++){
          this.mouseState[i][1] = false;
          this.mouseState[i][2] = false;
        }

        this.touchState[1] = false;
        this.touchState[2] = false;
    }

}


var input = new Input();
input.init();

canvas.addEventListener("mousemove", function (event) {
  if(isMobile) return;
  input.mouseCanvasX = event.offsetX;
  input.mouseCanvasY = event.offsetY;
  input.mouseViewX = ((input.mouseCanvasX -canvasOffsetX)/canvasSclX);
  input.mouseViewY = ((input.mouseCanvasY -canvasOffsetY)/canvasSclY);
  var worldPos = mainCam.worldPos(input.mouseViewX, input.mouseViewY);
  input.mouseX = worldPos.x;
  input.mouseY = worldPos.y;
});

canvas.addEventListener("mousedown", function (event) {
  if(isMobile) return;
  if(!input.mouseState[event.button][0]){
    input.mouseState[event.button][0] = true;
    input.mouseState[event.button][1] = true;
  }
});

canvas.addEventListener("mouseup", function (event) {
  if(isMobile) return;
  if(input.mouseState[event.button][0]){
    input.mouseState[event.button][0] = false;
    input.mouseState[event.button][2] = true;
  }
});

canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);


function handleTouchStart(event) {
  event.preventDefault();
  // Get the coordinates of the touch event
  input.touchX = event.touches[0].clientX;
  input.touchY = event.touches[0].clientY;

  input.touchState[0] = true;
  input.touchState[1] = true;

  if (isMobile) {
    setTimeout(function() {
     input.mouseState[0][0] = true; // Simulate mouse down
     input.mouseState[0][1] = true;
   }, 5); //
    input.mouseState[0][2] = false; // Ensure clean click (down -> up)
    input.mouseCanvasX = input.touchX;
    input.mouseCanvasY = input.touchY;
    input.mouseViewX = ((input.mouseCanvasX -canvasOffsetX)/canvasSclX);
    input.mouseViewY = ((input.mouseCanvasY -canvasOffsetY)/canvasSclY);
    var worldPos = mainCam.worldPos(input.mouseViewX, input.mouseViewY);
    input.mouseX = worldPos.x;
    input.mouseY = worldPos.y;
  }
}


function handleTouchEnd(event) {
  event.preventDefault();
  // Reset touch coordinates
  input.touchX = 0;
  input.touchY = 0;

  input.touchState[0] = false;
  input.touchState[2] = true;

  if (isMobile) {
    input.mouseState[0][0] = false; // Simulate mouse up
    input.mouseState[0][2] = true;
  }
}



function handleTouchMove(event) {
    // Prevent default touch behavior (e.g., scrolling)
    event.preventDefault();

    // Get the coordinates of the touch event
    input.touchX = event.touches[0].clientX;
    input.touchY = event.touches[0].clientY;

    if(isMobile){
      input.mouseCanvasX = input.touchX;
      input.mouseCanvasY = input.touchY;
      input.mouseViewX = ((input.mouseCanvasX -canvasOffsetX)/canvasSclX);
      input.mouseViewY = ((input.mouseCanvasY -canvasOffsetY)/canvasSclY);
      var worldPos = mainCam.worldPos(input.mouseViewX, input.mouseViewY);
      input.mouseX = worldPos.x;
      input.mouseY = worldPos.y;
    }
}

document.addEventListener('keydown', function (event) {
    const keyCode = event.keyCode || event.which;
    if (!input.keyState[keyCode][0]) {
        input.keyState[keyCode][0] = true; // Set active state
        input.keyState[keyCode][1] = true; // Set pressed state
    }
});

document.addEventListener('keyup', function (event) {
    const keyCode = event.keyCode || event.which;
    input.keyState[keyCode][0] = false; // Set inactive state
    input.keyState[keyCode][2] = true; // Set released state
});
