<!--remove-start-->

# Accelerometer - ADXL335

<!--remove-end-->






##### Breadboard for "Accelerometer - ADXL335"



![docs/breadboard/accelerometer-adxl335.png](breadboard/accelerometer-adxl335.png)<br>

Fritzing diagram: [docs/breadboard/accelerometer-adxl335.fzz](breadboard/accelerometer-adxl335.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/accelerometer-adxl335.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var accelerometer = new five.Accelerometer({
    controller: "ADXL335",
    pins: ["A0", "A1", "A2"]
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
Copyright (c) 2017 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
