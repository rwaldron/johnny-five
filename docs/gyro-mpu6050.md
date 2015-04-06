<!--remove-start-->
# Gyro - I2C (MPU6050)

Run with:
```bash
node eg/gyro-mpu6050.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var gyro = new five.Gyro({
    controller: "MPU6050"
  });

  gyro.on("change", function() {
    console.log("gyro");
    console.log("  x            : ", this.x);
    console.log("  y            : ", this.y);
    console.log("  z            : ", this.z);
    console.log("  pitch        : ", this.pitch);
    console.log("  roll         : ", this.roll);
    console.log("  yaw          : ", this.yaw);
    console.log("  rate         : ", this.rate);
    console.log("  isCalibrated : ", this.isCalibrated);
    console.log("--------------------------------------");
  });
});

```


## Breadboard/Illustration


![docs/breadboard/gyro-mpu6050.png](breadboard/gyro-mpu6050.png)
[(Fritzing diagram)](breadboard/gyro-mpu6050.fzz)





<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
