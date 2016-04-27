var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "GP2Y0A41SK0F",
    pin: "A0",
    filter: true,
    freq: 500
  });

  proximity.on("data", function() {
    console.log("Proximity: ");
    console.log("  cm  : ", this.cm);
    console.log("  in  : ", this.in);
    console.log("  filtered  : ", this.filtered);
    console.log("-----------------");
  });

  proximity.on("change", function() {
    console.log("The obstruction has moved.");
  });
});
