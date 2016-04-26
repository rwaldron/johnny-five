var five = require("../lib/johnny-five.js");
var board = new five.Board();
var tilt;

board.on("ready", function() {
  tilt = new five.Button(2) // digital pin 2

  board.repl.inject({
    button: tilt
  });

  // tilt the breadboard to the right, towards to the ground pin
  tilt.on("down", function() {
    console.log("down");
  });

  // tilt and hold
  tilt.on("hold", function() {
    console.log("hold");
  });

  // tilt back the breadboard to the stable position
  tilt.on("up", function() {
    console.log("up");
  });
});
