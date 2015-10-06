var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "MPL3115A2"
  });

  multi.on("change", function() {
    console.log("temperature");
    console.log("  celsius      : ", this.temperature.celsius);
    console.log("  fahrenheit   : ", this.temperature.fahrenheit);
    console.log("  kelvin       : ", this.temperature.kelvin);
    console.log("--------------------------------------");

    console.log("barometer");
    console.log("  pressure     : ", this.barometer.pressure);
    console.log("--------------------------------------");

    console.log("altimeter");
    console.log("  feet         : ", this.altimeter.feet);
    console.log("  meters       : ", this.altimeter.meters);
    console.log("--------------------------------------");
  });
});
