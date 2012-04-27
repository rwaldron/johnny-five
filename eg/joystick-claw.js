var five = require("../lib/johnny-five.js"),
    board = new five.Board({
      debug: true
    });

board.on("ready", function() {

  var claw = new five.Servo({ pin: 9 }),
      joystick = new five.Joystick({
        pins: [ "A0", "A1" ],
        freq: 250
      });

  // Set the claw degrees to half way
  // (the joystick deadzone)
  claw.move( 90 );

  joystick.on("axismove", function() {
    // Open/close the claw by setting degrees according
    // to Y position of joystick.
    claw.move( Math.ceil(170 * this.fixed.y) );
  });
});
