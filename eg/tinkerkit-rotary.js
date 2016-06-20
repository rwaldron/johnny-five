var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var servo = new five.Servo("O0");

  new five.Sensor("I1").scale(0, 180).on("change", function() {
    servo.to(this.value);
  });
});
