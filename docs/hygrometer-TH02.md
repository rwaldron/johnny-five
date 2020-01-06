<!--remove-start-->

# Hygrometer - TH02

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/hygrometer-TH02.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var hygrometer = new five.Hygrometer({
    controller: "TH02"
  });

  hygrometer.on("change", function() {
    console.log("Hygrometer");
    console.log("  relative humidity : ", this.relativeHumidity);
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
