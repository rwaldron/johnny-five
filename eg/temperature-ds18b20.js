var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // This requires OneWire support using the ConfigurableFirmata
  var thermometer = new five.Thermometer({
    controller: "DS18B20",
    pin: 2
  });

  thermometer.on("change", function() {
    console.log(this.celsius + "°C");
    // console.log("0x" + this.address.toString(16));
  });
});

// @markdown
// - [DS18B20 - Temperature Sensor](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS18S20.html)
// @markdown
