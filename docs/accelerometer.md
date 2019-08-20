<!--remove-start-->

# Accelerometer

<!--remove-end-->






##### Breadboard for "Accelerometer"



![docs/breadboard/accelerometer.png](breadboard/accelerometer.png)<br>

Fritzing diagram: [docs/breadboard/accelerometer.fzz](breadboard/accelerometer.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/accelerometer.js
```


```javascript
const {Accelerometer, Board} = require("johnny-five");
const board = new Board();

board.on("ready", () => {

  const accelerometer = new Accelerometer({
    pins: ["A3", "A4", "A5"],

    // Adjust the following for your device.
    // These are the default values (LIS344AL)
    //
    sensitivity: 96, // mV/degree/seconds
    zeroV: 478 // volts in ADC
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








## Additional Notes
- [Triple Axis Accelerometer, MMA7361](https://www.sparkfun.com/products/9652)
- [Triple-Axis Accelerometer, ADXL326](http://www.adafruit.com/products/1018)
- [Two or Three Axis Accelerometer, LIS344AL](http://www.st.ewi.tudelft.nl/~gemund/Courses/In4073/Resources/LIS344AL.pdf)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
