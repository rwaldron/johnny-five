const { Board, Sensor } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  // Create a new generic sensor instance for
  // a sensor connected to an analog (ADC) pin
  const sensor = new Sensor("A0");

  // When the sensor value changes, log the value
  sensor.on("change", value => {
    console.log("Sensor: ");
    console.log("  value  : ", sensor.value);
    console.log("-----------------");
  });
});
