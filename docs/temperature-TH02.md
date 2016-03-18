<!--remove-start-->

# Thermometer - TH02

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/temperature-TH02.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var temp = new five.Thermometer({
    controller: "TH02"
  });

  temp.on("change", function() {
    console.log("temperature");
    console.log("  celsius           : ", this.temperature.celsius);
    console.log("  fahrenheit        : ", this.temperature.fahrenheit);
    console.log("  kelvin            : ", this.temperature.kelvin);
    console.log("--------------------------------------");
  });
});

```









## Learn More

- [Grove - Temperature&Humidity Sensor (High-Accuracy & Mini)](http://www.seeedstudio.com/depot/Grove-TemperatureHumidity-Sensor-HighAccuracy-Mini-p-1921.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
