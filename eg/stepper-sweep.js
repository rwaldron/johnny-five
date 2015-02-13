var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  /**
   * In order to use the Stepper class, your board must be flashed with
   * either of the following:
   *
   * - AdvancedFirmata https://github.com/soundanalogous/AdvancedFirmata
   * - ConfigurableFirmata https://github.com/firmata/arduino/releases/tag/v2.6.2
   *
   */

  var k = 0;
  var stepper = new five.Stepper({
    type: five.Stepper.TYPE.DRIVER,
    stepsPerRev: 200,
    pins: [11, 12]
  });

  stepper.rpm(180).ccw().step(2000, function() {
    console.log("done");
  });
});
