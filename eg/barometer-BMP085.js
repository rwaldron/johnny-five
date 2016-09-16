var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var barometer = new five.Barometer({
    controller: "BMP085"
  });

  barometer.on("change", function() {
    console.log("Barometer");
    console.log("  pressure     : ", this.barometer.pressure);
    console.log("--------------------------------------");
  });
});
