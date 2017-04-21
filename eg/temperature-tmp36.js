var five = require("../lib/johnny-five.js");

five.Board().on("ready", function() {
  var temperature = new five.Thermometer({
    controller: "TMP36",
    pin: "A0"
  });

  temperature.on("change", function() {
    console.log(this.celsius + "°C", this.fahrenheit + "°F");
  });
});

/* @markdown
- [TMP36 - Temperature Sensor](https://www.sparkfun.com/products/10988)
@markdown */
