var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  // Create a new `Gyro` hardware instance.

  var gyro = new five.Gyro({
    pins: ["I0", "I1"],
    sensitivity: 0.67
  });

  gyro.on("change", function() {
    console.log("X raw: %d rate: %d", this.x, this.rate.x);
    console.log("Y raw: %d rate: %d", this.y, this.rate.y);
  });
});
