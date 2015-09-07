var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var motor = new five.Motor({
    controller: "EVS_EV3",
    pin: "BBM2",
  });

  board.wait(2000, function() {
    console.log("REVERSE");

    motor.rev();

    // Demonstrate motor stop in 2 seconds
    board.wait(2000, function() {
      motor.stop();
    });
  });

  console.log("FORWARD");
  motor.fwd();
});
