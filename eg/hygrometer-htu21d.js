var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var hygrometer = new five.Hygrometer({
    controller: "HTU21D"
  });

  hygrometer.on("data", function() {
    console.log(this.relativeHumidity + " %");
  });
});

/* @markdown
- [HTU21D - Humidity Sensor](https://www.adafruit.com/products/1899)
@markdown */
