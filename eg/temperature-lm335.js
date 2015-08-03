var five = require("../lib/johnny-five");

five.Board().on("ready", function() {
  var temperature = new five.Temperature({
    controller: "LM335",
    pin: "A0"
  });

  temperature.on("data", function(err, data) {
    console.log(data.celsius + "°C", data.fahrenheit + "°F");
  });
});

// @markdown
// - [LM335 - Temperature Sensor](http://www.ti.com/product/lm335)
// @markdown
