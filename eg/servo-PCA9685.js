var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  console.log("Connected");

  // Initialize the servo instance
  var a = new five.Servo({
    address: 0x40,
    controller: "PCA9685",
    pin: 0,
  });

  var b = new five.Servo({
    address: 0x40,
    controller: "PCA9685",
    range: [0, 180],
    pin: 1,
  });

  var degrees = 0;

  a.to(degrees);
  b.to(degrees);
});
