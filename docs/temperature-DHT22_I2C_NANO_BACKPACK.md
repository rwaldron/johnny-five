<!--remove-start-->

# Thermometer - DHT22_I2C_NANO_BACKPACK

<!--remove-end-->






##### Thermometer DHT22



![docs/breadboard/multi-DHT22_I2C_NANO_BACKPACK.png](breadboard/multi-DHT22_I2C_NANO_BACKPACK.png)<br>

Fritzing diagram: [docs/breadboard/multi-DHT22_I2C_NANO_BACKPACK.fzz](breadboard/multi-DHT22_I2C_NANO_BACKPACK.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/temperature-DHT22_I2C_NANO_BACKPACK.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var thermometer = new five.Thermometer({
    controller: "DHT22_I2C_NANO_BACKPACK"
  });

  thermometer.on("change", function() {
    console.log("Thermometer");
    console.log("  celsius           : ", this.celsius);
    console.log("  fahrenheit        : ", this.fahrenheit);
    console.log("  kelvin            : ", this.kelvin);
    console.log("--------------------------------------");
  });
});


```









## Learn More

- [I2C Backback Firmare](https://github.com/rwaldron/johnny-five/blob/master/firmwares/dht_i2c_nano_backpack.ino)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
