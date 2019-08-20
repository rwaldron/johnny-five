<!--remove-start-->

# Accelerometer - ADXL345

<!--remove-end-->






##### Breadboard for "Accelerometer - ADXL345"



![docs/breadboard/accelerometer-adxl345.png](breadboard/accelerometer-adxl345.png)<br>

Fritzing diagram: [docs/breadboard/accelerometer-adxl345.fzz](breadboard/accelerometer-adxl345.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/accelerometer-adxl345.js
```


```javascript
const {Accelerometer, Board} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const accelerometer = new Accelerometer({
    controller: "ADXL345",
    // Optionally set the range to one of
    // 2, 4, 8, 16 (±g)
    // Defaults to ±2g
    // range: ...
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
