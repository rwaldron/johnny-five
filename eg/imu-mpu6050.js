var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var imu = new five.IMU({
    controller: "MPU6050"
  });

  var fahrenheit = null;

  imu.temperature.on("change", function() {
    if (Math.round(this.fahrenheit) !== fahrenheit) {
      console.log("Fahrenheit: ", Math.round(this.fahrenheit));
    }
  });

  imu.accelerometer.on("change", function() {
    console.log("Accelerometer: ", this.x, this.y, this.z);
  });

  imu.gyro.on("change", function() {
    console.log("Gyro: ", this.x, this.y, this.z);
  });

});
