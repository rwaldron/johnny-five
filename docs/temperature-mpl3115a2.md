<!--remove-start-->

# Thermometer - MPL3115A2

<!--remove-end-->






##### MPL3115A2



![docs/breadboard/barometer-mpl3115a2.png](breadboard/barometer-mpl3115a2.png)<br>

Fritzing diagram: [docs/breadboard/barometer-mpl3115a2.fzz](breadboard/barometer-mpl3115a2.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-mpl3115a2.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var thermometer = new five.Thermometer({
    controller: "MPL3115A2"
  });

  thermometer.on("change", function() {
    console.log("Thermometer");
    console.log("  celsius      : ", this.celsius);
    console.log("  fahrenheit   : ", this.fahrenheit);
    console.log("  kelvin       : ", this.kelvin);
    console.log("--------------------------------------");
  });
});


```








## Additional Notes
- [MPL3115A2 - I2C Barometric Pressure/Altimiter/Temperature Sensor](https://www.adafruit.com/products/1893)
- [SparkFun Altitude/Pressure Sensor Breakout - MPL3115A2](https://www.sparkfun.com/products/11084)
- [SparkFun Weather Shield](https://www.sparkfun.com/products/12081)
- [SparkFun Photon Weather Shield](https://www.sparkfun.com/products/13630)


## Learn More

- [MPL3115A2 - I2C Barometric Pressure/Altimeter/Temperature Sensor](https://www.adafruit.com/product/1893)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
