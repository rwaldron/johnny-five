<!--remove-start-->

# Gyro - I2C MPU6050

<!--remove-end-->






##### Breadboard for "Gyro - I2C MPU6050"



![docs/breadboard/gyro-mpu6050.png](breadboard/gyro-mpu6050.png)<br>

Fritzing diagram: [docs/breadboard/gyro-mpu6050.fzz](breadboard/gyro-mpu6050.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/gyro-mpu6050.js
```


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








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
