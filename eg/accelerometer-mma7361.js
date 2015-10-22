var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  // --- Sleep Pin
  // The sleepPin is used to enable/disable the device and put it into sleep mode
  // You can also tie the sleep pin to high with a 10k resistor and omit
  // this option

  // --- Calibration of zero-G readings (zeroV)
  // This device also benefits from a calibration step.  You can autoCalibrate
  // by placing the device level on startup.  You can also read the calibrated
  // centers by reading the accelerometer.zeroV array after calibration.  Subsequent
  // initializations, you can omit the autoCalibrate and set the zeroV array
  // in the options instead

  var accelerometer = new five.Accelerometer({
    controller: "MMA7361",
    pins: ["A0", "A1", "A2"],
    sleepPin: 13,
    autoCalibrate: true
  });

  accelerometer.on("change", function() {
    console.log("accelerometer");
    console.log("  x            : ", this.x);
    console.log("  y            : ", this.y);
    console.log("  z            : ", this.z);
    console.log("  pitch        : ", this.pitch);
    console.log("  roll         : ", this.roll);
    console.log("  acceleration : ", this.acceleration);
    console.log("  inclination  : ", this.inclination);
    console.log("  orientation  : ", this.orientation);
    console.log("--------------------------------------");
  });
});
