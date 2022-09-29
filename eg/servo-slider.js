const {Board, Sensor, Servo} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  const slider = new Sensor("A0");
  const tilt = new Servo(10);

  slider.on("change", () => {
    tilt.to(slider.scaleTo(0, 180));
  });
});
