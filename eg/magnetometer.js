var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  // Create a new `Magnetometer` hardware instance.
  //
  // five.Magnetometer();
  //
  // (Alias of:
  //   new five.Compass({
  //    controller: "HMC5883L",
  //    freq: 50,
  //    gauss: 1.3
  //   });
  // )
  //

  var magnetometer = new five.Magnetometer();


  // Properties

  // mag.raw
  //
  // x, y, z
  //

  // mag.scaled
  //
  // axis x, y, z
  //
  // based on value stored at (mag.scale)
  //

  // mag.heading
  //
  // Calculated heading in degrees (calibrated for magnetic north)
  //

  // mag.bearing
  //
  // Bearing data object
  //


  // Magnetometer Event API

  // "headingchange"
  //
  // Fires when the calculated heading has changed
  //
  magnetometer.on("headingchange", function() {

    console.log("heading", Math.floor(this.heading));
    // console.log("bearing", this.bearing);

  });
});
