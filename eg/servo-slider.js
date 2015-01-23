var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var servo = new five.Servo(10);
  var slider = new five.Sensor("A0");

  // Scale the slider's value to fit in the servo's
  // movement range. When the slider position changes
  // update the servo's position
  slider.scale([0, 180]).on("slide", function() {
    servo.to(this.value);
  });
});
