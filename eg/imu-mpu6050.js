var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var imu = new five.IMU({
    controller: "MPU6050"
  });

  imu.on("change", function() {
    console.log("temperature");
    console.log("  celsius      : ", this.temperature.celsius);
    console.log("  fahrenheit   : ", this.temperature.fahrenheit);
    console.log("  kelvin       : ", this.temperature.kelvin);
    console.log("--------------------------------------");
  
    console.log("accelerometer");
    console.log("  x            : ", this.accelerometer.x);
    console.log("  y            : ", this.accelerometer.y);
    console.log("  z            : ", this.accelerometer.z);
    console.log("  pitch        : ", this.accelerometer.pitch);
    console.log("  roll         : ", this.accelerometer.roll);
    console.log("  acceleration : ", this.accelerometer.acceleration);
    console.log("  inclination  : ", this.accelerometer.inclination);
    console.log("  orientation  : ", this.accelerometer.orientation);
    console.log("--------------------------------------");
    
    console.log("gyro");
    console.log("  x            : ", this.gyro.x);
    console.log("  y            : ", this.gyro.y);
    console.log("  z            : ", this.gyro.z);
    console.log("  pitch        : ", this.gyro.pitch);
    console.log("  roll         : ", this.gyro.roll);
    console.log("  yaw          : ", this.gyro.yaw);
    console.log("  rate         : ", this.gyro.rate);
    console.log("  isCalibrated : ", this.gyro.isCalibrated);
    console.log("--------------------------------------");    
  });

});
