var five = require("../lib/johnny-five.js"),
    board, servo;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `servo` hardware instance.
  servo = new five.Servo({
    pin: 9,
    // type defaults to standard servo
    type: "continuous"
  });

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servo: servo
  });

  // Continuous Rotation Servo API

  // move( speed )
  // Set the speed at which the continuous rotation
  // servo will rotate at.
  servo.move( 90 );

});
