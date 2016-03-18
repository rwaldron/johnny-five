var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var temp = new five.Thermometer({
    controller: "TH02"
  });

  temp.on("change", function() {
    console.log("temperature");
    console.log("  celsius           : ", this.temperature.celsius);
    console.log("  fahrenheit        : ", this.temperature.fahrenheit);
    console.log("  kelvin            : ", this.temperature.kelvin);
    console.log("--------------------------------------");
  });
});
