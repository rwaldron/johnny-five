var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  console.log("Connected");

  // Initialize the servo instance
  var servo = new five.Servo({
    address: 0x40,
    controller: "PCA9685",
    pin: 0,
  });

  servo.sweep();
});
