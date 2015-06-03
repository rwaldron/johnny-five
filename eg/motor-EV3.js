var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var right = new five.Motor({
    controller: "EV3",
    pin: "BBM2",
  });

  board.wait(2000, function() {
    console.log("REVERSE");

    right.rev();

    // Demonstrate motor stop in 2 seconds
    board.wait(2000, function() {
      right.stop();
    });
  });

  console.log("FORWARD");
  right.fwd();
});
