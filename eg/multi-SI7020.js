var five = require("../");
var board = new five.Board({
  port: "/dev/cu.usbmodem1421"
});

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "SI7020" // HTU21D
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
// - [SI7020 - Climate](http://start.tessel.io/modules/climate)
// @markdown
