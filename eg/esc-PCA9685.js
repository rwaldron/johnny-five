var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  var esc = new five.ESC({
    controller: "PCA9685",
    pin: 1
  });

  var pot = new five.Sensor("A0");

  pot.scale(0, 100).on("change", function() {
    esc.speed(this.value);
  });
});
