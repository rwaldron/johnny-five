var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var hygrometer = new five.Hygrometer({
    controller: "SHT31D"
  });

  hygrometer.on("data", function() {
    console.log(this.relativeHumidity + " %");
  });
});

/* @markdown
- [SHT31D - Humidity Sensor](https://www.adafruit.com/products/2857)
@markdown */
