# Sensor Temperature Lm35

Run with:
```bash
node eg/sensor-temperature-lm35.js
```


```javascript
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


```





- [LM35 - Temperature Sensor](http://www.ti.com/product/lm35)



## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
