var five = require("../lib/johnny-five.js"),
  prox, led;

five.Board().on("ready", function() {

  // Create a new IR Proximity Sensor hardware instance.
  //
  // five.IR.Proximity();
  //
  // (Alias of:
  //   new five.IR({
  //    device: "GP2Y0D805Z0F",
  //    freq: 50
  //   });
  // )
  //

  prox = new five.IR.Proximity();
  led = new five.Led(13);





  // Properties

  // prox.state
  //

  // Proximity Event API

  // "motionstart"
  //
  // Fired motion is detected with 2"
  //


  // "motionend"
  //
  // Fired following a "motionstart" event
  // when no movement has occurred in X ms
  //
  prox.on("motionstart", function(err, timestamp) {
    led.on();
  });

  prox.on("motionend", function(err, timestamp) {
    led.off();
  });

});
