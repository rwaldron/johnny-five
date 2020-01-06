<!--remove-start-->

# IMU - MPU6050

<!--remove-end-->






##### Breadboard for "IMU - MPU6050"



![docs/breadboard/imu-mpu6050.png](breadboard/imu-mpu6050.png)<br>

Fritzing diagram: [docs/breadboard/imu-mpu6050.fzz](breadboard/imu-mpu6050.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/imu-mpu6050.js
```


```javascript
const {Board, IMU} = require("../");
const board = new Board();

board.on("ready", () => {
  const imu = new IMU({
    controller: "MPU6050"
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
  });

});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
