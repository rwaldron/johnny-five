var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var color = new five.Color({
    controller: "EVS_NXT",
    pin: "BAS1"
  });

  color.on("change", function() {
    console.log("Color: ", this.rgb);
  });
});
