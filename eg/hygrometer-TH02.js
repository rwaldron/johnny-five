var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var humidity = new five.Hygrometer({
    controller: "TH02"
  });

  humidity.on("change", function() {
    console.log("Hygrometer");
    console.log("  relative humidity : ", this.hygrometer.relativeHumidity);
    console.log("--------------------------------------");
  });
});
