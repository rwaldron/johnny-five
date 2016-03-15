var five = require("../lib/johnny-five.js");

var board = new five.Board({
  debug: true
});

board.on("ready", function() {

  var servo = new five.Servo("A3");

  // Add servo to REPL (optional)
  this.repl.inject({
    servo: servo
  });

  // Servo API

  // min()
  //
  // set the servo to the minimum degrees
  // defaults to 0
  //
  // eg. servo.min();

  // max()
  //
  // set the servo to the maximum degrees
  // defaults to 180
  //
  // eg. servo.max();

  // center()
  //
  // centers the servo to 90°
  //
  // servo.center();

  // to( deg )
  //
  // Moves the servo to position by degrees
  //
  // servo.to( 90 );

  // step( deg )
  //
  // step all servos by deg
  //
  // eg. array.step( -20 );

  servo.sweep();

});
