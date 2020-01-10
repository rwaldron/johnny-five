const {Board, Servo, Servos} = require("../lib/johnny-five.js");

const board = new Board();

board.on("ready", () => {

  let wheels = {};

  // Create two servos as our wheels
  wheels.left = new Servo({
    pin: 9,
    // `type` defaults to standard servo.
    // For continuous rotation servos, override the default
    // by setting the `type` here
    type: "continuous"

  });

  wheels.right = new Servo({
    pin: 10,
    // `type` defaults to standard servo.
    // For continuous rotation servos, override the default
    // by setting the `type` here
    type: "continuous",
    invert: true // one wheel mounted inverted of the other
  });

  // reference both together
  wheels.both = new Servos([wheels.left, wheels.right]);

  wheels.both.stop();

  // Add servos to REPL (optional)
  board.repl.inject({
    wheels
  });

  // Drive forwards
  // Note, cw() vs ccw() might me different for you
  // depending on how you mount the servos
  wheels.both.cw();

  // Stop driving after 3 seconds
  board.wait(3000, wheels.both.stop);

});
