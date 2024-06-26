

class Alarm {
  constructor(start, end){
    this.timer = start;
    this.time = end;
    this.finished = false;
    this.paused = false;
    this.loop = false;
  }

  update(dt = 1){

    if(!this.paused){
      this.timer += dt;
    }

    if(this.timer >= this.time){
      this.finished = true;

      if(this.loop){
        this.finished = false;
        this.timer = 0;
      }
    }
  }


  restart(){
    this.finished = false;
    this.timer = 0;
  }

  stop(){
    this.restart();
    this.paused = true;
  }

  start(){
    this.restart();
    this.paused = false;
  }

  pause(){
    this.paused = true;
  }

  resume(){
    this.paused = false;
  }

  percentage(){
    return this.timer/this.time;
  }
}



function zeroPad(number, targetLength) {
  // Ensure targetLength is a positive integer
  targetLength = Math.floor(Math.max(targetLength, 0));

  // Convert the number to a string
  var numberString = number.toString();

  // Add leading zeros until the string length reaches the target length
  while (numberString.length < targetLength) {
    numberString = '0' + numberString;
  }

  return numberString;
}


function drawAlarm(ctx, alarm, x, y, height){

  var borderHei = height*0.05;
  ctx.font = Math.floor(height*0.95/2.2) + "px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";



  var alarmTimeString = alarm.time + "";

  var width = ctx.measureText(alarmTimeString).width * 1.2;
  var borderWid = width * 0.05;


  ctx.fillStyle = "rgb(200,200,200)";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(x + borderWid, y + borderHei, width - borderWid*2, height - borderHei*2);

  var hei = height*0.95;

  ctx.fillStyle = alarm.paused ? "rgb(100, 100, 255)" : "rgb(255, 100, 100)";
  ctx.fillText(zeroPad(alarm.timer, alarmTimeString.length) , x + borderWid, y + borderHei + hei/4 );
  ctx.fillText(alarmTimeString , x + borderWid, y + borderHei + hei/2 + hei/4);

}
