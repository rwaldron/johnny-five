# Accelerometer

Run with:
```bash
node eg/accelerometer.js
```


```javascript
var five = require("johnny-five"),
  board, accel;

board = new five.Board();

board.on("ready", function() {

  // Create a new analog `Accelerometer` hardware instance.
  //
  // five.Accelerometer([ x, y[, z] ]);
  //
  // five.Accelerometer({
  //   pins: [ x, y[, z] ]
  //   freq: ms
  // });
  //

  accel = new five.Accelerometer({
    pins: ["A3", "A4", "A5"],

    // Adjust the following for your device.
    // These are the default values (LIS344AL)
    //
    sensitivity: 96, // mV/degree/seconds
    zeroV: 478 // volts in ADC
  });

  // Accelerometer Event API


  // "data"
  //
  // Fires when X, Y or Z has changed.
  //
  // The first argument is an object containing raw x, y, z
  // values as read from the analog input.
  //
  accel.on("data", function(data) {

    console.log("raw: ", data);
  });

  // "acceleration"
  //
  // Fires once every N ms, equal to value of freg
  // Defaults to 500ms
  //
  accel.on("acceleration", function(data) {

    console.log("acceleration", data);
  });

  // "orientation"
  //
  // Fires when orientation changes
  //
  accel.on("orientation", function(data) {

    console.log("orientation", data);
  });

  // "inclination"
  //
  // Fires when inclination changes
  //
  accel.on("inclination", function(data) {

    console.log("inclination", data);
  });

  // "change"
  //
  // Fires when X, Y or Z has changed
  //
  accel.on("change", function(data) {

    console.log("change", data);
  });
});


```


## Breadboard/Illustration


![docs/breadboard/accelerometer.png](breadboard/accelerometer.png)
[docs/breadboard/accelerometer.fzz](breadboard/accelerometer.fzz)




- [Triple Axis Accelerometer, MMA7361](https://www.sparkfun.com/products/9652)
- [Triple-Axis Accelerometer, ADXL326](http://www.adafruit.com/products/1018)

- [Two or Three Axis Accelerometer, LIS344AL](http://www.st.ewi.tudelft.nl/~gemund/Courses/In4073/Resources/LIS344AL.pdf)






## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
