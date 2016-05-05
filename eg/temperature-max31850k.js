var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  // This requires OneWire support using the ConfigurableFirmata
  var temperature = new five.Temperature({
    controller: "MAX31850K",
    pin: 2
  });

  temperature.on("change", function() {
    console.log("temperature at address: 0x" + this.address.toString(16));
    console.log("  celsius      : ", this.celsius);
    console.log("  fahrenheit   : ", this.fahrenheit);
    console.log("  kelvin       : ", this.kelvin);
    console.log("--------------------------------------");
  });
});

// @markdown
// - [MAX31850K - Thermocouple Amplifier](https://www.adafruit.com/products/1727)
// @markdown
