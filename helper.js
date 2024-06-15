function Enum() {
    for (let i = 0; i < arguments.length; ++i) {
        this[arguments[i]] = i;
    }
    return this;
}


// Function to get canvas transform scale
function getCanvasTransformScale() {
	var style = window.getComputedStyle(canvas);
	var transform = style.getPropertyValue("transform");

	// Parse the matrix values from the transform property
	var matrix = new DOMMatrix(transform);
	var scaleX = matrix.a;
	var scaleY = matrix.d;

	return {
		x: scaleX,
		y: scaleY
	};
}

function scaleCanvasContent() {
	var aspectRatio = canvas.width / canvas.height;
	var windowWidth = window.innerWidth;
	var windowHeight = window.innerHeight;
	var canvasScale;
	//canvasScale = Math.min(windowWidth / canvas.width, windowHeight / canvas.height);
	canvasScale = windowHeight / canvas.height;
	var translateX = (windowWidth / 2) - canvasScale * canvas.width / 2;

	canvas.style.left = translateX + "px";

	canvas.style.transform = "scale(" + canvasScale + ")";
	canvas.style.transformOrigin = "top left";
}
