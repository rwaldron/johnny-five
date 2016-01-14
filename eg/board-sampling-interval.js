var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  // Use the board's `samplingInterval(ms)` to
  // control the actual MCU sampling rate.
  //
  // This will limit sampling of all Analog Input
  // and I2C sensors to once per second (1000 milliseconds)
  this.samplingInterval(1000);


  // Keep in mind that calling this method
  // will ALWAYS OVERRIDE any per-sensor
  // interval/rate/frequency settings.
});
