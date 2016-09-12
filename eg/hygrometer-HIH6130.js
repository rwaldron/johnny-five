var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var hygrometer = new five.Hygrometer({
    controller: "HIH6130"
  });

  hygrometer.on("change", function() {
    console.log("Hygrometer");
    console.log("  relative humidity : ", this.relativeHumidity);
    console.log("--------------------------------------");
  });
});
