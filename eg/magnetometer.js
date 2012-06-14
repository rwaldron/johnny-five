var five = require("../lib/johnny-five.js"),
    mag;

five.Board().on("ready", function() {

  // Create a new `Magnetometer` hardware instance.
  //
  // five.Magnetometer();
  //
  // (Alias of:
  //   new five.Compass({
  //    device: "HMC5883L",
  //    freq: 50,
  //    gauss: 1.3
  //   });
  // )
  //

  mag = new five.Magnetometer();


  // Properties

  // mag.axis
  //
  // x, y, z
  //

  // mag.scaled
  //
  // scaled x, y, z
  //
  // based on value stored at (mag.scale)
  //

  // mag.heading
  //
  // Calculated heading degrees (calibrated for magnetic north)
  //


  // Magnetometer Event API

  // "headingchange"
  //
  // Fires when the calculated heading has changed
  //
  mag.on("headingchange", function() {

    console.log( "headingchange", Math.floor(this.heading) );

  });

  // "read"
  //
  // Fires continuously, every 66ms.
  //
  mag.on("read", function( err, timestamp ) {
    // console.log( "read", this.axis );
  });
});
