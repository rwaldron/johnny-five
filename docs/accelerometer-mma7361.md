<!--remove-start-->

# Accelerometer - MMA7361

<!--remove-end-->






##### Breadboard for "Accelerometer - MMA7361"



![docs/breadboard/accelerometer-mma7361.png](breadboard/accelerometer-mma7361.png)<br>

Fritzing diagram: [docs/breadboard/accelerometer-mma7361.fzz](breadboard/accelerometer-mma7361.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/accelerometer-mma7361.js
```


```javascript
const {Accelerometer, Board} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  // --- Sleep Pin
  // The sleepPin is used to enable/disable the device and put it into sleep mode
  // You can also tie the sleep pin to high with a 10k resistor and omit
  // this option

  // --- Calibration of zero-G readings (zeroV)
  // This device also benefits from a calibration step.  You can autoCalibrate
  // by placing the device level on startup.  You can also read the calibrated
  // centers by reading the accelerometer.zeroV array after calibration.  Subsequent
  // initializations, you can omit the autoCalibrate and set the zeroV array
  // in the options instead

  const accelerometer = new Accelerometer({
    controller: "MMA7361",
    pins: ["A0", "A1", "A2"],
    sleepPin: 13,
    autoCalibrate: true
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
