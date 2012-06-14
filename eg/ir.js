var five = require("../lib/johnny-five.js"),
    ir;

five.Board().on("ready", function() {

  // Create a new `Proximity` hardware instance.
  //
  // five.Proximity();
  //
  // (Alias of:
  //   new five.IR({
  //    device: "GP2Y0D805Z0F",
  //    freq: 50
  //   });
  // )
  //

  ir = new five.IR();


  // Properties

  // ir.axis
  //
  // x, y, z
  //

  // ir.scaled
  //
  // scaled x, y, z
  //
  // based on value stored at (ir.scale)
  //

  // ir.heading
  //
  // Calculated heading degrees (calibrated for irnetic north)
  //


  // Magnetometer Event API

  // "headingchange"
  //
  // Fires when the calculated heading has changed
  //
  ir.on("headingchange", function() {

    console.log( "headingchange", Math.floor(this.heading) );

  });

  // "read"
  //
  // Fires continuously, every 66ms.
  //
  ir.on("read", function( err, timestamp ) {
    console.log( "read", this.axis );
  });
});
