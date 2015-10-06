<!--remove-start-->

# Altimeter - MPL3115A2

<!--remove-end-->








Run with:
```bash
node eg/altimeter-mpl3115a2.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var barometer = new five.Altimeter({
    controller: "MPL3115A2"
  });

  barometer.on("data", function() {
    console.log("Altitude");
    console.log("  feet   : ", this.feet);
    console.log("  meters : ", this.meters);
    console.log("--------------------------------------");
  });
});


```








## Additional Notes
- [MPLe115A2 - I2C Barometric Pressure/Altimiter/Temperature Sensor](https://www.adafruit.com/products/1893)


## Learn More

- [MPL3115A2 - I2C Barometric Pressure/Altimeter/Temperature Sensor](https://www.adafruit.com/product/1893)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
