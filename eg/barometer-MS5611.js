var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var pressure = new five.Barometer({
    controller: "MS5611",
  });

  pressure.on("change", function() {
    console.log("Barometer");
    console.log("  pressure     : ", this.pressure);
    console.log("--------------------------------------");
  });
});
