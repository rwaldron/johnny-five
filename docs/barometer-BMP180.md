<!--remove-start-->

# Barometer - BMP180

<!--remove-end-->






##### BMP180



![docs/breadboard/multi-bmp180.png](breadboard/multi-bmp180.png)<br>

Fritzing diagram: [docs/breadboard/multi-bmp180.fzz](breadboard/multi-bmp180.fzz)

&nbsp;




Run with:
```bash
node eg/barometer-BMP180.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var barometer = new five.Barometer({
    controller: "BMP180"
  });

  barometer.on("change", function() {
    console.log("barometer");
    console.log("  pressure     : ", this.pressure);
    console.log("--------------------------------------");
  });
});

```









## Learn More

- [BMP180 Barometric Pressure/Temperature/Altitude Sensor](https://www.adafruit.com/products/1603)

- [SparkFun Barometric Pressure Sensor Breakout - BMP180](https://www.sparkfun.com/products/11824)

- [Grove - Barometer Sensor（BMP180)](http://www.seeedstudio.com/depot/Grove-Barometer-SensorBMP180-p-1840.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
