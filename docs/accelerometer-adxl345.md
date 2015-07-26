<!--remove-start-->

# Accelerometer - ADXL345

<!--remove-end-->






##### Breadboard for "Accelerometer - ADXL345"



![docs/breadboard/accelerometer-adxl345.png](breadboard/accelerometer-adxl345.png)<br>

Fritzing diagram: [docs/breadboard/accelerometer-adxl345.fzz](breadboard/accelerometer-adxl345.fzz)

&nbsp;




Run with:
```bash
node eg/accelerometer-adxl345.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var accelerometer = new five.Accelerometer({
    controller: "ADXL345"
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
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
