<!--remove-start-->

# Proximity - HC-SR04 I2C Backpack

<!--remove-end-->


Ping Proximity example that uses an HCSR04 ultrasonic sensor and an I2C backpack ([see backpack documentation](https://github.com/ajfisher/nodebots-hcsr04).





##### Breadboard for "Proximity - HC-SR04 I2C Backpack"



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
    freq: 100,
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
