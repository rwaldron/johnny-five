<!--remove-start-->

# Multi - HTU21D

<!--remove-end-->








Run with:
```bash
node eg/multi-htu21d.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "HTU21D"
  });

  multi.on("change", function() {
    console.log("temperature");
    console.log("  celsius           : ", this.temperature.celsius);
    console.log("  fahrenheit        : ", this.temperature.fahrenheit);
    console.log("  kelvin            : ", this.temperature.kelvin);
    console.log("--------------------------------------");

    console.log("Hygrometer");
    console.log("  relative humidity : ", this.hygrometer.relativeHumidity);
    console.log("--------------------------------------");
  });
});

```








## Additional Notes
- [HTU21D - Humidity Sensor](https://www.adafruit.com/products/1899)


## Learn More

- [HTU21D Humidity/Temperature Sensor](https://www.adafruit.com/products/1899)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
