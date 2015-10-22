var five = require("../lib/johnny-five.js"),
  board, wheels;

board = new five.Board();

board.on("ready", function() {

  wheels = {};

  // Create two servos as our wheels
  wheels.left = new five.Servo({
    pin: 9,
    // `type` defaults to standard servo.
    // For continuous rotation servos, override the default
    // by setting the `type` here
    type: "continuous"

  });

  wheels.right = new five.Servo({
    pin: 10,
    // `type` defaults to standard servo.
    // For continuous rotation servos, override the default
    // by setting the `type` here
    type: "continuous",
    invert: true // one wheel mounted inverted of the other
  });

  wheels.both = new five.Servos().stop(); // reference both together

  // Add servos to REPL (optional)
  this.repl.inject({
    wheels: wheels
  });

  // Drive forwards
  // Note, cw() vs ccw() might me different for you
  // depending on how you mount the servos
  wheels.both.cw();

  // Stop driving after 3 seconds
  this.wait(3000, function() {
    wheels.both.stop();
  });

});
