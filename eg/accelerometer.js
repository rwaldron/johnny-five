var five = require("../lib/johnny-five.js"),
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

    console.log( "pitch:", this.pitch, "roll:", this.roll );
  });

  // "axischange"
  //
  // Fires only when X, Y or Z has changed
  //
  accel.on("axischange", function( err, timestamp ) {
    // this.raw can be computed, but it isn't conditioned on voltage range
    console.log( "axischange", this.accel );
  });
});
