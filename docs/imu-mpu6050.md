# Imu Mpu6050

Run with:
```bash
node eg/imu-mpu6050.js
```


```javascript
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

```


## Breadboard/Illustration


![docs/breadboard/imu-mpu6050.png](breadboard/imu-mpu6050.png)
[docs/breadboard/imu-mpu6050.fzz](breadboard/imu-mpu6050.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
