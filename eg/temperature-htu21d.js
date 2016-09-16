var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var thermometer = new five.Thermometer({
    controller: "HTU21D"
  });

  thermometer.on("change", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});

// @markdown
// - [HTU21D - Humidity Sensor](https://www.adafruit.com/products/1899)
// @markdown
