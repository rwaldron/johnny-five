var five = require("../lib/johnny-five.js"),
    board = five.Board({
      debug: true
    });

board.on("ready", function() {
  var range, pan, tilt, joystick;

  range = [ 0, 170 ];

  // Servo to control panning
  pan = five.Servo({
    pin: 9,
    range: range
  });

  // Servo to control tilt
  tilt = five.Servo({
    pin: 10,
    range: range
  });

  // Joystick to control pan/tilt
  // Read Analog 0, 1
  // Limit events to every 50ms
  joystick = five.Joystick({
    pins: [ "A0", "A1" ],
    freq: 100
  });

  // Center all servos
  (five.Servos()).center();

  joystick.on("axismove", function() {

    // console.log( this.raw.y, (512 - this.raw.y) / 2  );

    tilt.move( Math.ceil(170 * this.fixed.y) );
    pan.move( Math.ceil(170 * this.fixed.x) );

  });
});
