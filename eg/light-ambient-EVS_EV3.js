var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var light = new five.Light({
    controller: "EVS_EV3",
    pin: "BAS1"
  });

  light.on("change", function() {
    console.log("Ambient Light Level: ", this.level);
  });
});
