var five = require("../lib/johnny-five.js"),
    board, servos;

board = new five.Board();

board.on("ready", function() {

  servos = {
    claw: five.Servo({
      pin: 9,
      range: [ 0, 170 ]
    }),
    arm: five.Servo(10)
  };

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    s: servos
  });

  servos.claw.min();

  this.wait( 1000, function() {
    servos.claw.sweep();
  });
});
