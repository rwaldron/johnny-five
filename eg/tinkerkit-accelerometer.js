var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  // Create a new `Accelerometer` hardware instance.
  //
  // Devices:
  //
  // - Dual Axis http://tinkerkit.tihhs.nl/accelerometer/
  //

  var accel = new five.Accelerometer({
    pins: ["I0", "I1"],
    freq: 100
  });

  // Accelerometer Event API

  // "acceleration"
  //
  // Fires once every N ms, equal to value of freg
  // Defaults to 500ms
  //
  accel.on("acceleration", function() {

    console.log("acceleration", this.pitch, this.roll);
  });

  // "axischange"
  //
  // Fires only when X, Y or Z has changed
  //
  accel.on("axischange", function() {

    console.log("axischange", this.raw);
  });
});
