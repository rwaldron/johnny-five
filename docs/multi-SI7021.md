<!--remove-start-->

# Multi - SI7021

<!--remove-end-->






##### Tessel with SI7021



![docs/breadboard/multi-SI7021.png](breadboard/multi-SI7021.png)<br>

Fritzing diagram: [docs/breadboard/multi-SI7021.fzz](breadboard/multi-SI7021.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/multi-SI7021.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "SI7021"
  });

  multi.on("change", function() {
    console.log("Thermometer");
    console.log("  celsius           : ", this.thermometer.celsius);
    console.log("  fahrenheit        : ", this.thermometer.fahrenheit);
    console.log("  kelvin            : ", this.thermometer.kelvin);
    console.log("--------------------------------------");

    console.log("Hygrometer");
    console.log("  relative humidity : ", this.hygrometer.relativeHumidity);
    console.log("--------------------------------------");
  });
});

```


## Illustrations / Photos


##### Arduino with SI7021



![docs/breadboard/multi-SI7021-uno.png](breadboard/multi-SI7021-uno.png)<br>

Fritzing diagram: [docs/breadboard/multi-SI7021-uno.fzz](breadboard/multi-SI7021-uno.fzz)

&nbsp;






## Learn More

- [Si7021 Humidity and Temperature Sensor Hookup Guide](https://learn.sparkfun.com/tutorials/si7021-humidity-and-temperature-sensor-hookup-guide)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
