var five = require("johnny-five");

five.Board().on("ready", function() {
  var sensor = new five.Sensor("A0");

  sensor.on("data", function() {
    // LM35
    // var celsius = (5 * value * 100) / 1024;

    // TMP36
    var celsius = ((this.value * 0.004882814) - 0.5) * 100;

    var fahrenheit = celsius * (9 / 5) + 32;

    console.log(celsius + "°C", fahrenheit + "°F");
  });
});

// @markdown
// - [TMP36 - Temperature Sensor](https://www.sparkfun.com/products/10988)
// - [LM35 - Temperature Sensor](http://www.ti.com/product/lm35)
// @markdown
