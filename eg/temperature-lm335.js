var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var thermometer = new five.Thermometer({
    controller: "LM335",
    pin: "A0"
  });

  thermometer.on("change", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});

// @markdown
// - [LM335 - Temperature Sensor](http://www.ti.com/product/lm335)
// @markdown
