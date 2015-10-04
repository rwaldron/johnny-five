var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "HTU21D"
  });

  multi.on("change", function() {
    console.log("temperature");
    console.log("  celsius           : ", this.temperature.celsius);
    console.log("  fahrenheit        : ", this.temperature.fahrenheit);
    console.log("  kelvin            : ", this.temperature.kelvin);
    console.log("--------------------------------------");

    console.log("Hygrometer");
    console.log("  relative humidity : ", this.hygrometer.relativeHumidity);
    console.log("--------------------------------------");
  });
});

// @markdown
// - [HTU21D - Humidity Sensor](https://www.adafruit.com/products/1899)
// @markdown