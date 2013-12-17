var five = require("../lib/johnny-five.js"),
  board = new five.Board({
    debug: true
  });

board.on("ready", function() {
  var range, pan, tilt, joystick;

  range = [0, 170];

  // Servo to control panning
  pan = new five.Servo({
    pin: 9,
    range: range
  });

  // Servo to control tilt
  tilt = new five.Servo({
    pin: 10,
    range: range
  });

  // Joystick to control pan/tilt
  // Read Analog 0, 1
  // Limit events to every 50ms
  joystick = new five.Joystick({
    pins: ["A0", "A1"],
    freq: 100
  });

  // Center all servos
  (five.Servos()).center();

  joystick.on("axismove", function() {

    tilt.to(Math.ceil(170 * this.fixed.y));
    pan.to(Math.ceil(170 * this.fixed.x));

  });
});
