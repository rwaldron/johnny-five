var five = require("../lib/johnny-five.js");

var board = new five.Board({
  debug: true
});

board.on("ready", function() {

  var accelerometer = new five.Accelerometer({
    controller: "MMA7361",
    pins: ["A0", "A1", "A2"],
    autoCalibrate: true
  });

  accelerometer.on("change", function() {
    console.log("accelerometer");
    console.log("  x            : ", this.x);
    console.log("  y            : ", this.y);
    console.log("  z            : ", this.z);
    console.log("  pitch        : ", this.pitch);
    console.log("  roll         : ", this.roll);
    console.log("  acceleration : ", this.acceleration);
    console.log("  inclination  : ", this.inclination);
    console.log("  orientation  : ", this.orientation);
    console.log("--------------------------------------");
  });

});
