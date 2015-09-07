var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "EVS_EV3_IR",
    pin: "BBS1"
  });

  proximity.on("change", function() {
    console.log("The obstruction has moved.");
    console.log(this.cm + "cm", this.in + "in");
  });
});
