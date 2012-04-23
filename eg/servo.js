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


  // servo Event API


  // "read" events?
  servo.on("read", function( err, degrees ) {
    console.log( "read", degrees );
  });

  // "moved" events fire after a successful move.
  servo.on("moved", function( err, degrees ) {
    console.log( "moved", degrees );
  });

});
