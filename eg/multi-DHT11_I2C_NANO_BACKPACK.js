var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "DHT11_I2C_NANO_BACKPACK"
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
