<!--remove-start-->

# LED - PCA9685


Basic LED example using PCA9685




Run with:
```bash
node eg/led-PCA9685.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");

five.Board().on("ready", function() {
  var led = new five.Led({
    pin: process.argv[2] || 0,
    address: 0x40,
    controller: "PCA9685"
  });

  // address: The address of the shield.
  //    Defaults to 0x40
  // pin: The pin the LED is connected to
  //    Defaults to 0
  // controller: The type of controller being used.
  //   Defaults to "standard".

  // Add LED to REPL (optional)
  this.repl.inject({
    led: led
  });

  led.pulse();
});

```


## Illustrations / Photos


### Breadboard for "LED - PCA9685"



![docs/breadboard/led-PCA9685.png](breadboard/led-PCA9685.png)<br>

Fritzing diagram: [docs/breadboard/led-PCA9685.fzz](breadboard/led-PCA9685.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
