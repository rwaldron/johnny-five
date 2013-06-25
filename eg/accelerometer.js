var five = require("../lib/johnny-five.js"),
    board, accel;

board = new five.Board();

board.on("ready", function() {
  // exponential smoother
  function exponential() {
    var alpha = this.alpha;

    this.axes.forEach(function( axis, index ) {
      var diff, priorsm;
      // Exponential smoothing
      // see http://people.duke.edu/~rnau/411avg.htm
      // bootstrap for initial state
      if ( this.initial ) {
        this.update("smooth", axis, this.get("accel", axis, 0));
        this.initial = false;
      } else {

        priorsm = this.get("smooth", axis, 0);
        // diff last stage smoothing and real output
        diff = this.get("accel", axis, 0) - priorsm;
        // update current smooth 
        this.update("smooth", axis, priorsm + alpha * diff);
      }
    }, this);

    return this.get("smooth");
  }
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
    pins: [ "A3", "A4", "A5" ],
    freq: 100,
    axes: ["x", "y"],
    smoother: exponential,
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
