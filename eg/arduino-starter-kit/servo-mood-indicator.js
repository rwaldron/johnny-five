var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {
  var potentiometer = new five.Sensor("A0");
  var servo = new five.Servo(9);
  potentiometer.on("data", function() {
    console.log(this.value, this.scaleTo(0, 179));
    servo.to(this.scaleTo(0, 179));
  });
});
