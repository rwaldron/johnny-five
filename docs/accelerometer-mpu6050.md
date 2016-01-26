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
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var accelerometer = new five.Accelerometer({
    controller: "MPU6050"
  });

  accelerometer.on("change", function() {
    console.log("accelerometer");
    console.log("  x            : ", this.x);
    console.log("  y            : ", this.y);
    console.log("  z            : ", this.z);
    console.log("  pitch        : ", this.pitch);
    console.log("  roll         : ", this.roll);
    console.log("  acceleration : ", this.acceleration);
    console.log("  inclination  : ", this.inclination);
    console.log("  orientation  : ", this.orientation);
    console.log("--------------------------------------");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
