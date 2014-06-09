# Sensor Temperature Tmp36

Run with:
```bash
node eg/sensor-temperature-tmp36.js
```


```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  var sensor = new five.Sensor("A0");

  sensor.on("data", function() {
    // TMP36
    var celsius = ((this.value * 0.004882814) - 0.5) * 100;
    var fahrenheit = celsius * (9 / 5) + 32;

    console.log(celsius + "°C", fahrenheit + "°F");
  });
});


```





- [TMP36 - Temperature Sensor](https://www.sparkfun.com/products/10988)



## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
