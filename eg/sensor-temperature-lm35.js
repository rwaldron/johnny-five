var five = require("johnny-five");

five.Board().on("ready", function() {
  var sensor = new five.Sensor("A0");

  sensor.on("data", function() {
    // LM35
    var celsius = (5 * this.value * 100) / 1024;
    var fahrenheit = celsius * (9 / 5) + 32;

    console.log(celsius + "°C", fahrenheit + "°F");
  });
});

// @markdown
// - [LM35 - Temperature Sensor](http://www.ti.com/product/lm35)
// @markdown
