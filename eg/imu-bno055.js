const {Board, IMU} = require("../");
const board = new Board();

board.on("ready", () => {

  // Borrowed from
  // https://github.com/adafruit/Adafruit_BNO055/blob/master/examples/bunny/bunny.ino
  //
  // Calibration: https://www.youtube.com/watch?v=uH7iQrH3GpA&feature=youtu.be

  const layout = `
  Board layout:
      +----------+
      |         *| RST   PITCH  ROLL  HEADING
  ADR |*        *| SCL
  INT |*        *| SDA     ^            /->
  PS1 |*        *| GND     |            |
  PS0 |*        *| 3VO     Y    Z-->    \-X
      |         *| VIN
      +----------+
  `;

  console.log(layout);

  const imu = new IMU({
    controller: "BNO055"
  });


  imu.on("change", () => {
    console.log("Thermometer");
    console.log("  celsius      : ", imu.thermometer.celsius);
    console.log("  fahrenheit   : ", imu.thermometer.fahrenheit);
    console.log("  kelvin       : ", imu.thermometer.kelvin);
    console.log("--------------------------------------");

    console.log("Accelerometer");
    console.log("  x            : ", imu.accelerometer.x);
    console.log("  y            : ", imu.accelerometer.y);
    console.log("  z            : ", imu.accelerometer.z);
    console.log("  pitch        : ", imu.accelerometer.pitch);
    console.log("  roll         : ", imu.accelerometer.roll);
    console.log("  acceleration : ", imu.accelerometer.acceleration);
    console.log("  inclination  : ", imu.accelerometer.inclination);
    console.log("  orientation  : ", imu.accelerometer.orientation);
    console.log("--------------------------------------");

    console.log("Gyroscope");
    console.log("  x            : ", imu.gyro.x);
    console.log("  y            : ", imu.gyro.y);
    console.log("  z            : ", imu.gyro.z);
    console.log("  pitch        : ", imu.gyro.pitch);
    console.log("  roll         : ", imu.gyro.roll);
    console.log("  yaw          : ", imu.gyro.yaw);
    console.log("  rate         : ", imu.gyro.rate);
    console.log("  isCalibrated : ", imu.gyro.isCalibrated);
    console.log("--------------------------------------");

    console.log("magnetometer");
    console.log("  heading : ", Math.floor(imu.magnetometer.heading));
    console.log("  bearing : ", imu.magnetometer.bearing.name);
    console.log("--------------------------------------");
  });
});
