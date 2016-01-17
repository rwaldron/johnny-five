var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  // This requires OneWire support using the ConfigurableFirmata
  var temperature = new five.Temperature({
    controller: "MAX31850K",
    pin: 2
  });

  temperature.on("data", function() {
    console.log("temperature");
    console.log("  celsius      : ", this.celsius);
    console.log("  fahrenheit   : ", this.fahrenheit);
    console.log("  kelvin       : ", this.kelvin);
    console.log("--------------------------------------");
  });
});

// @markdown
// - [MAX31850K - Thermocouple Amplifier](https://www.adafruit.com/products/1727)
// @markdown
