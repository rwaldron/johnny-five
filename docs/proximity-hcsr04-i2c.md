<!--remove-start-->

# Proximity - HC-SR04

<!--remove-end-->


Ping proximity example for use with an `HCSR04` sensor and I2C backpack. Standard
firmata should be used or any other standard I2C capable IO Plugin.

##### Breadboard for "Proximity - HC-SR04"



![docs/breadboard/proximity-hcsr04-i2c.png](breadboard/proximity-hcsr04-i2c.png)<br>

Fritzing diagram: [docs/breadboard/proximity-hcsr04-i2c.fzz](breadboard/proximity-hcsr04-i2c.fzz)

&nbsp;




Run with:
```bash
node eg/proximity-hcsr04-i2c.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var proximity = new five.Proximity({
    controller: "HCSR04I2C",
  });

  proximity.on("data", function() {
    console.log(this.cm + "cm", this.in + "in");
  });

  proximity.on("change", function() {
    console.log("The obstruction has moved.");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
