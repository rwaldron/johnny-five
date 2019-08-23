const {Board, Thermometer} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const thermometer = new Thermometer({
    controller: "MPU6050"
  });

  thermometer.on("change", () => {
    console.log(`Thermometer
  celsius      : ${thermometer.celsius}
  fahrenheit   : ${thermometer.fahrenheit}
  kelvin       : ${thermometer.kelvin}
--------------------------------------`);
  });
});

/* @markdown
- [MPU6050 - IMU with Temperature Sensor](http://www.invensense.com/products/motion-tracking/6-axis/mpu-6050/)
@markdown */
