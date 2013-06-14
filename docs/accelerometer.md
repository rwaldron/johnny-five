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

  // Create a new `Accelerometer` hardware instance.
  //
  // Supported devices:
  //
  // - Triple Axis Accelerometer, MMA7361 https://www.sparkfun.com/products/9652
  // - Triple-Axis Accelerometer, ADXL326 http://www.adafruit.com/products/1018
  //
  // five.Accelerometer([ x, y[, z] ]);
  //
  // five.Accelerometer({
  //   pins: [ x, y[, z] ]
  //   freq: ms
  // });
  //

  // Tinkerkit Accelerometer uses two pins
  accel = new five.Accelerometer({
    pins: [ "I0", "I1" ],
    freq: 100
  });

  // Accelerometer Event API

  // "acceleration"
  //
  // Fires once every N ms, equal to value of freg
  // Defaults to 500ms
  //


  accel.on("acceleration", function( err, timestamp ) {
    // Pitch and roll are computed by comparing x/y
    console.log( "pitch:", this.pitch, "roll:", this.roll );
  });

  // "axischange"
  //
  // Fires only when X, Y or Z has changed
  //
  accel.on("axischange", function( err, timestamp ) {
    // this.raw can still be accessed, but it isn't conditioned on
    // the voltage range
    console.log( "axischange", this.accel );
  });
});

```

## Breadboard/Illustration


![alt](breadboard/accelerometer.png "Breadboard Hookup")

[accelerometer Fritzing File](breadboard/accelerometer.fzz)



## Devices

* [Triple Axis Accelerometer, MMA7361](https://www.sparkfun.com/products/9652)
* [Triple-Axis Accelerometer, ADXL326](http://www.adafruit.com/products/1018)
* [TinkerKit 2/3 Axis Accelerometer, T000020](http://store.arduino.cc/ww/index.php?main_page=product_info&cPath=16&products_id=97)
  * Based on [ST Microelectronics LIS344AL](http://www.alldatasheet.com/datasheet-pdf/pdf/243308/STMICROELECTRONICS/LIS344AL.html). Z-axis must be jumpered together.

## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
