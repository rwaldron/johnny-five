var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "SI7020" // HTU21D
  });

  multi.on("change", function() {
    console.log("Thermometer");
    console.log("  celsius           : ", this.thermometer.celsius);
    console.log("  fahrenheit        : ", this.thermometer.fahrenheit);
    console.log("  kelvin            : ", this.thermometer.kelvin);
    console.log("--------------------------------------");

    console.log("Hygrometer");
    console.log("  relative humidity : ", this.hygrometer.relativeHumidity);
    console.log("--------------------------------------");
  });
});

/* @markdown
- [SI7020 - Climate](http://start.tessel.io/modules/climate)
@markdown */
