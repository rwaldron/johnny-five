// Run this program with a device model:
//
//    node eg/ir-distance.js GP2Y0A02YK0F
//
// Valid models:
//
// - GP2Y0A21YK
//     https://www.sparkfun.com/products/242
// - GP2D120XJ00F
//     https://www.sparkfun.com/products/8959
// - GP2Y0A02YK0F
//     https://www.sparkfun.com/products/8958
//
//
var five = require("../lib/johnny-five.js"),
    board = new five.Board(),
    device = process.argv[2] || "GP2Y0A02YK0F";

board.on("ready", function() {
  var distance = new five.IR.Distance({
    device: device,
    pin: "A0",
    freq: 500
  });

  distance.on("data", function() {
    if (device) {
      console.log( "inches: ", this.inches );
      console.log( "cm: ", this.cm, this.raw );
    } else {
      console.log( "value: ", this.value );
    }
  });
});
