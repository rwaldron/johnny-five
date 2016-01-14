var five = require("../lib/johnny-five");

five.Board().on("ready", function() {
  var temperature = new five.Thermometer({
    controller: "LM335",
    pin: "A0"
  });

  temperature.on("data", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});

// @markdown
// - [LM335 - Temperature Sensor](http://www.ti.com/product/lm335)
// @markdown
