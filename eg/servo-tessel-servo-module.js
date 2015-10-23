var five = require("../lib/johnny-five.js");
var Tessel = require("tessel-io");

var board = new five.Board({
  io: new Tessel()
});

board.on("ready", function() {
  console.log("Connected");

  // Initialize the servo instance
  var servo = new five.Servo({
    controller: "PCA9685",
    port: "A",
    address: 0x73,
    pin: 1,
  });

  servo.sweep();
});
