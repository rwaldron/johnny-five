const { Accelerometer, Board, Servo, Servos } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  const range = [0, 170];

  // Servo to control panning
  const pan = new Servo({
    pin: 9,
    range
  });

  // Servo to control tilt
  const tilt = new Servo({
    pin: 10,
    range
  });

  // Accelerometer to control pan/tilt
  const accelerometer = new Accelerometer({
    pins: ["A3", "A4", "A5"],
    freq: 250
  });

  // Center all servos
  new Servos([pan, tilt]).center();

  accelerometer.on("acceleration", () => {
    tilt.to(Math.abs(Math.ceil(170 * accelerometer.pitch.toFixed(2)) - 180));
    pan.to(Math.ceil(170 * accelerometer.roll.toFixed(2)));
  });
});
