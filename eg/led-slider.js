const {Board, Led, Sensor} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const slider = new Sensor("A0");
  const led = new Led(11);

  // Scale the sensor's value to the LED's brightness range
  slider.on("data", () => {
    led.brightness(slider.scaleTo([0, 255]));
  });
});
