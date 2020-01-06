<!--remove-start-->

# Accelerometer - MPU6050

<!--remove-end-->






##### Breadboard for "Accelerometer - MPU6050"



![docs/breadboard/accelerometer-mpu6050.png](breadboard/accelerometer-mpu6050.png)<br>

Fritzing diagram: [docs/breadboard/accelerometer-mpu6050.fzz](breadboard/accelerometer-mpu6050.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/accelerometer-mpu6050.js
```


```javascript
const { Accelerometer, Board } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const accelerometer = new Accelerometer({
    controller: "MPU6050"
  });

  accelerometer.on("change", () => {
    const {acceleration, inclination, orientation, pitch, roll, x, y, z} = accelerometer;
    console.log("Accelerometer:");
    console.log("  x            : ", x);
    console.log("  y            : ", y);
    console.log("  z            : ", z);
    console.log("  pitch        : ", pitch);
    console.log("  roll         : ", roll);
    console.log("  acceleration : ", acceleration);
    console.log("  inclination  : ", inclination);
    console.log("  orientation  : ", orientation);
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
