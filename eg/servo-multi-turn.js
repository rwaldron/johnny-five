var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var servo = new five.Servo({
    pin: 10,
    // Cheapo servo has limited PWM range
    pwmRange: [600, 2370],
    // This multi-turn servo can turn 2430 degrees or 6.75 revolutions
    deviceRange: [0, 2430]
  });

  // Add servo to REPL (optional)
  this.repl.inject({
    servo: servo
  });


  // Servo API

  // min()
  //
  // set the servo to the minimum degrees
  //
  // eg. servo.min();

  // max()
  //
  // set the servo to the maximum degrees
  //
  // eg. servo.max();

  // center()
  //
  // centers the servo
  //
  // servo.center();

  // to( deg )
  //
  // Moves the servo to position by degrees
  //
  // servo.to( 90 );

});
