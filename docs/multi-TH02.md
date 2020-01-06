<!--remove-start-->

# Multi - TH02

<!--remove-end-->






##### Breadboard for "Multi - TH02"



![docs/breadboard/multi-TH02.png](breadboard/multi-TH02.png)<br>

Fritzing diagram: [docs/breadboard/multi-TH02.fzz](breadboard/multi-TH02.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/multi-TH02.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "TH02"
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

- [Grove - Temperature&Humidity Sensor (High-Accuracy & Mini)](http://www.seeedstudio.com/depot/Grove-TemperatureHumidity-Sensor-HighAccuracy-Mini-p-1921.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
