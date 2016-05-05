var five = require("../lib/johnny-five");

five.Board().on("ready", function() {
  // This requires OneWire support using the ConfigurableFirmata
  var temperatureA = new five.Thermometer({
    controller: "DS18B20",
    pin: 2,
    address: 0x687f1fe
  });

  var temperatureB = new five.Thermometer({
    controller: "DS18B20",
    pin: 2,
    address: 0x6893a41
  });


  temperatureA.on("change", function() {
    console.log("A", this.celsius + "°C");
  });

  temperatureB.on("change", function(err, data) {
    console.log("B", this.celsius + "°C");
  });
});

// @markdown
// - [DS18B20 - Temperature Sensor](http://www.maximintegrated.com/en/products/analog/sensors-and-sensor-interface/DS18S20.html)
// @markdown
