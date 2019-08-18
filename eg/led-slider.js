const {Board, Led, Sensor} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", function() {
  const slider = new Sensor("A0");
  const led = new Led(11);

  // Scale the sensor's value to the LED's brightness range
  slider.scale([0, 255]).on("data", () => {
    led.brightness(slider.value);
  });
});
