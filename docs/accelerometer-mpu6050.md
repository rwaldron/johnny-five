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
const {Accelerometer, Board} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const accelerometer = new Accelerometer({
    controller: "MPU6050"
  });

  accelerometer.on("change", () => {
    console.log("accelerometer");
    console.log("  x            : ", accelerometer.x);
    console.log("  y            : ", accelerometer.y);
    console.log("  z            : ", accelerometer.z);
    console.log("  pitch        : ", accelerometer.pitch);
    console.log("  roll         : ", accelerometer.roll);
    console.log("  acceleration : ", accelerometer.acceleration);
    console.log("  inclination  : ", accelerometer.inclination);
    console.log("  orientation  : ", accelerometer.orientation);
    console.log("--------------------------------------");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
