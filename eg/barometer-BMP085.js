var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var bar = new five.Barometer({
    controller: "BMP085"
  });

  bar.on("change", function() {
    console.log("barometer");
    console.log("  pressure     : ", this.barometer.pressure);
    console.log("--------------------------------------");
  });
});
