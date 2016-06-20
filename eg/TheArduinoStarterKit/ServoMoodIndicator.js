five = require("johnny-five");
Edison = require("edison-io");
board = new five.Board({io: new Edison()});

board.on("ready", function(){
  potentiometer = new five.Sensor("A0");
  servo = new five.Servo(9);
  potentiometer.on('data',function(){
    console.log(this.value, this.scaleTo(0,179));
    servo.to(this.scaleTo(0,179))
  })
})
