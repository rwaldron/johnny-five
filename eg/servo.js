var five = require("../lib/johnny-five.js"),
    board, servo;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `servo` hardware instance.
  servo = new five.Servo({
    pin: 9
  });

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servo: servo
  });

  // Servo API

  // reset()
  // Resets the servo to 0deg
  servo.reset();

  // move( deg )
  // Moves the servo to position by degrees

  // sweep( obj )
  // Perform a 0-180 cycling servo sweep
  // optionally accepts an object of sweep settings:
  // {
  //    lapse: time in milliseconds to wait between moves
  //           defaults to 500ms
  //    degrees: distance in degrees to move
  //           defaults to 10deg
  // }
  // servo.sweep();


  // Servo Event API

  // "move" events fire after a successful move.
  servo.on("move", function( err, degrees ) {
    console.log( "move", degrees );
  });
});
