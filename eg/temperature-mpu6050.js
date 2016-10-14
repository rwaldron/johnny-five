var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var thermometer = new five.Thermometer({
    controller: "MPU6050"
  });

  thermometer.on("change", function() {
    console.log("Thermometer");
    console.log("  celsius      : ", this.celsius);
    console.log("  fahrenheit   : ", this.fahrenheit);
    console.log("  kelvin       : ", this.kelvin);
    console.log("--------------------------------------");
  });
});

// @markdown
// - [MPU6050 - IMU with Temperature Sensor](http://www.invensense.com/products/motion-tracking/6-axis/mpu-6050/)
// @markdown
