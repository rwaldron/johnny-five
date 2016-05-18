var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var temperature = new five.Thermometer({
    controller: "SHT31D"
  });

  temperature.on("data", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});

// @markdown
// - [SHT31D - Humidity Sensor](https://www.adafruit.com/products/2857)
// @markdown
