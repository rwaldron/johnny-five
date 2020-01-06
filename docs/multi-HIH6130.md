<!--remove-start-->

# Multi - HIH6130

<!--remove-end-->






##### HIH6130



![docs/breadboard/multi-HIH6130.png](breadboard/multi-HIH6130.png)<br>

Fritzing diagram: [docs/breadboard/multi-HIH6130.fzz](breadboard/multi-HIH6130.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/multi-HIH6130.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "HIH6130"
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









## Learn More

- [HIH6130 Humidity/Temperature Sensor](https://www.sparkfun.com/products/11295)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
