// Run this program with a device model:
//
//    node eg/ir-distance.js GP2Y0A02YK0F
//
//    You may also use the model number printed on the
//    device itself. eg
//
//    2Y0A21
//    2D120X
//    2Y0A02
//    OA41SK
//
//    Without a specific model number, the readings will
//    be wrong (unless you've connected a GP2Y0A02YK0F/2Y0A02)
//
// Valid models:
//
// - GP2Y0A21YK
//     https://www.sparkfun.com/products/242
// - GP2D120XJ00F
//     https://www.sparkfun.com/products/8959
// - GP2Y0A02YK0F
//     https://www.sparkfun.com/products/8958
// - GP2Y0A41SK0F
//     https://www.sparkfun.com/products/12728
//
//
var five = require("../lib/johnny-five.js"),
  board = new five.Board(),
  controller = process.argv[2] || "GP2Y0A02YK0F";

board.on("ready", function() {
  var distance = new five.IR.Proximity({
    controller: controller,
    pin: "A0",
    freq: 500
  });

  distance.on("data", function() {
    if (controller) {
      console.log("inches: ", this.inches);
      console.log("cm: ", this.centimeters, this.raw);
    } else {
      console.log("value: ", this.value);
    }
  });
});
