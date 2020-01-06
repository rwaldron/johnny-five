<!--remove-start-->

# Hygrometer - DHT21_I2C_NANO_BACKPACK

<!--remove-end-->






##### Hygrometer DHT21



![docs/breadboard/multi-DHT21_I2C_NANO_BACKPACK.png](breadboard/multi-DHT21_I2C_NANO_BACKPACK.png)<br>

Fritzing diagram: [docs/breadboard/multi-DHT21_I2C_NANO_BACKPACK.fzz](breadboard/multi-DHT21_I2C_NANO_BACKPACK.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/hygrometer-DHT21_I2C_NANO_BACKPACK.js
```


```javascript
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var hygrometer = new five.Hygrometer({
    controller: "DHT21_I2C_NANO_BACKPACK"
  });

  hygrometer.on("change", function() {
    console.log("Hygrometer");
    console.log("  relative humidity : ", this.relativeHumidity);
    console.log("--------------------------------------");
  });
});

```









## Learn More

- [I2C Backback Firmare](https://github.com/rwaldron/johnny-five/blob/master/firmwares/dht_i2c_nano_backpack.ino)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
