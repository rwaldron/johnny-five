var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var barometer = new five.Barometer({
    controller: "MPL115A2"
  });

  barometer.on("data", function() {
    console.log("barometer");
    console.log("  pressure : ", this.pressure);
    console.log("--------------------------------------");
  });
});
