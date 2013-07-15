var five = require("johnny-five");

five.Board().on("ready", function(){
  var sensor = new five.Sensor("A0");

  sensor.on("read", function(){
    var celsius = -(100 * (this.value / 1000) - 50);
    var fahrenheit = celsius * (9/5) + 32;

    console.log(celsius + "°C", fahrenheit + "°F");
  });
});

// @markdown
// - [TMP36 - Temperature Sensor](https://www.sparkfun.com/products/10988)
// @markdown
