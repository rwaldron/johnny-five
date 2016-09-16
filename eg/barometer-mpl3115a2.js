var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var barometer = new five.Barometer({
    controller: "MPL3115A2"
  });

  barometer.on("data", function() {
    console.log("Barometer");
    console.log("  pressure : ", this.pressure);
    console.log("--------------------------------------");
  });
});

// @markdown
// - [MPL3115A2 - I2C Barometric Pressure/Altimiter/Temperature Sensor](https://www.adafruit.com/products/1893)
// - [SparkFun Altitude/Pressure Sensor Breakout - MPL3115A2](https://www.sparkfun.com/products/11084)
// - [SparkFun Weather Shield](https://www.sparkfun.com/products/12081)
// - [SparkFun Photon Weather Shield](https://www.sparkfun.com/products/13630)
// @markdown
