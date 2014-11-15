var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {
  console.log("Connected");

  // Initialize the servo
  var servo = new five.Servo({
    address: 0x40,
    pin: 0,
    controller: "PCA9685"
  });

  // The address of the shield.
  //    Defaults to 0x40
  // controller: The type of Servo/PWM controller being used.
  //   Defaults to "standard".

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

  // to( deg[, duration] )
  //
  // Moves the servo to position by degrees
  // duration (optional) sets duration of movement.
  //
  // servo.to( 90 );

  // step( deg )
  //
  // Moves the servo step degrees relative to current position
  //
  // servo.step( -10 );

  // sweep( obj )
  //
  // Perform a min-max cycling servo sweep (defaults to 0-180)
  // optionally accepts an object of sweep settings:
  // {
  //    lapse: time in milliseconds to wait between moves
  //           defaults to 500ms
  //    degrees: distance in degrees to move
  //           defaults to 10°
  // }
  //
  //servo.sweep();

});


// References
//
// http://servocity.com/html/hs-7980th_servo.html
