<!--remove-start-->

# Multi - BMP085

<!--remove-end-->






##### BMP085



![docs/breadboard/multi-bmp085-sfe.png](breadboard/multi-bmp085-sfe.png)<br>

Fritzing diagram: [docs/breadboard/multi-bmp085-sfe.fzz](breadboard/multi-bmp085-sfe.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/multi-bmp085.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var multi = new five.Multi({
    controller: "BMP085"
  });

  multi.on("change", function() {
    console.log("Thermometer");
    console.log("  celsius      : ", this.thermometer.celsius);
    console.log("  fahrenheit   : ", this.thermometer.fahrenheit);
    console.log("  kelvin       : ", this.thermometer.kelvin);
    console.log("--------------------------------------");

    console.log("Barometer");
    console.log("  pressure     : ", this.barometer.pressure);
    console.log("--------------------------------------");

    console.log("Altimeter");
    console.log("  feet         : ", this.altimeter.feet);
    console.log("  meters       : ", this.altimeter.meters);
    console.log("--------------------------------------");
  });
});

```


## Illustrations / Photos


##### BMP085 (Adafruit)



![docs/breadboard/multi-bmp085.png](breadboard/multi-bmp085.png)<br>

Fritzing diagram: [docs/breadboard/multi-bmp085.fzz](breadboard/multi-bmp085.fzz)

&nbsp;






## Learn More

- [BMP085 Barometric Pressure/Temperature/Altitude Sensor](https://www.adafruit.com/products/391)

- [Grove - Barometer Sensor（BMP085)](http://www.seeedstudio.com/depot/grove-barometer-sensor-p-1199.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
