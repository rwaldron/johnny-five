var five = require("../lib/johnny-five.js"),
  board;

board = new five.Board();

board.on("ready", function() {

  var range, pan, tilt, accel;

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

  // Accelerometer to control pan/tilt
  accel = new five.Accelerometer({
    pins: ["A3", "A4", "A5"],
    freq: 250
  });

  // Center all servos
  (five.Servos()).center();

  accel.on("acceleration", function(err, timestamp) {
    // console.log( "acceleration", this.axis );

    tilt.to(Math.abs(Math.ceil(170 * this.pitch.toFixed(2)) - 180));
    pan.to(Math.ceil(170 * this.roll.toFixed(2)));

    // TODO: Math.abs(v - 180) as inversion function ?
  });
});
