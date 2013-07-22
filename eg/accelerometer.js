var five = require("../lib/johnny-five.js"),
    board, accel;

board = new five.Board();

board.on("ready", function() {

  // Create a new `Accelerometer` hardware instance.
  //
  // five.Accelerometer([ x, y[, z] ]);
  //
  // five.Accelerometer({
  //   pins: [ x, y[, z] ]
  //   freq: ms
  // });
  //

  accel = new five.Accelerometer({
    pins: [ "A3", "A4", "A5" ],
    freq: 100,
    threshold: 0.2
  });

  // Accelerometer Event API

  // "acceleration"
  //
  // Fires once every N ms, equal to value of freg
  // Defaults to 500ms
  //
  accel.on("acceleration", function( err, data ) {

    console.log( "acceleration", data.smooth );
  });

  // "axischange"
  //
  // Fires only when X, Y or Z has changed
  //
  accel.on("axischange", function( err, timestamp ) {

    console.log( "axischange", this.raw );
  });
});

// @markdown
//
// - [Triple Axis Accelerometer, MMA7361](https://www.sparkfun.com/products/9652)
// - [Triple-Axis Accelerometer, ADXL326](http://www.adafruit.com/products/1018)
//
// @markdown
