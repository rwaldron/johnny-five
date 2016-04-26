var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var temp = new five.Thermometer({
    controller: "DHT11_I2C_NANO_BACKPACK"
  });

  temp.on("change", function() {
    console.log("temperature");
    console.log("  celsius           : ", this.celsius);
    console.log("  fahrenheit        : ", this.fahrenheit);
    console.log("  kelvin            : ", this.kelvin);
    console.log("--------------------------------------");
  });
});
