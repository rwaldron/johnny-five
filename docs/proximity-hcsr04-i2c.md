<!--remove-start-->

# Proximity - HC-SR04 I2C Backpack

<!--remove-end-->


Ping Proximity example that uses an HCSR04 ultrasonic sensor and an I2C backpack ([see backpack documentation](https://github.com/ajfisher/nodebots-hcsr04).





##### Breadboard for "Proximity - HC-SR04 I2C Backpack"



![docs/breadboard/proximity-hcsr04-i2c.png](breadboard/proximity-hcsr04-i2c.png)<br>

Fritzing diagram: [docs/breadboard/proximity-hcsr04-i2c.fzz](breadboard/proximity-hcsr04-i2c.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/proximity-hcsr04-i2c.js
```


```javascript
const { Board, Proximity } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const proximity = new Proximity({
    controller: "HCSR04I2CBACKPACK",
    freq: 100,
  });

  proximity.on("change", () => {
    const {centimeters, inches} = proximity;
    console.log("Proximity: ");
    console.log("  cm  : ", centimeters);
    console.log("  in  : ", inches);
    console.log("-----------------");
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
