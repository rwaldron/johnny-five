var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var joystick = new five.Joystick({
    pins: ["A0", "A1"],
    invertY: true
  });

  joystick.on("change", function() {
    console.log("Joystick");
    console.log("  x : ", this.x);
    console.log("  y : ", this.y);
    console.log("--------------------------------------");
  });
});
