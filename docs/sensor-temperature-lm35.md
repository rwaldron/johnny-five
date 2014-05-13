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





## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
