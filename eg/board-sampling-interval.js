const { Board } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  // Use the board's `samplingInterval(ms)` to
  // control the actual MCU sampling rate.
  //
  // This will limit sampling of all Analog Input
  // and I2C sensors to once per second (1000 milliseconds)
  board.samplingInterval(1000);


  // Keep in mind that calling this method
  // will ALWAYS OVERRIDE any per-sensor
  // interval/rate/frequency settings.
});
