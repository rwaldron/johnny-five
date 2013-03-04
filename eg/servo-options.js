var five = require("../lib/johnny-five.js"),
    board, servo;

board = new five.Board();

board.on("ready", function() {
  servo = new five.Servo({
    pin: 10,
    range: [ 0, 180 ], // Default: 0-180
    type: "standard", // Default: "standard". Use "continuous" for continuous rotation servos
    startAt: 90, // if you would like the servo to immediately move to a degree
    center: false // overrides startAt if true and moves the servo to the center of the range
  });

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servo: servo
  });

});
