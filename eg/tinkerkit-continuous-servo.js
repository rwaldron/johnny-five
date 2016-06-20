var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var servo = new five.Servo({
    pin: "O0",
    type: "continuous"
  });

  new five.Sensor("I0").scale(0, 1).on("change", function() {
    servo.cw(this.value);
  });
});
