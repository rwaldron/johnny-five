<!--remove-start-->

# Multi - SHT31D

<!--remove-end-->






##### SHT31D



![docs/breadboard/humidity-sht31d.png](breadboard/humidity-sht31d.png)<br>

Fritzing diagram: [docs/breadboard/humidity-sht31d.fzz](breadboard/humidity-sht31d.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/multi-sht31d.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "SHT31D"
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
- [SHT31D - Humidity Sensor](https://www.adafruit.com/products/2857)


## Learn More

- [SHT31D Humidity/Temperature Sensor](https://www.adafruit.com/products/2857)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
