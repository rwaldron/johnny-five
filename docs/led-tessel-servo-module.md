<!--remove-start-->

# LED - Tessel Servo Module

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/led-tessel-servo-module.js
```


```javascript
var five = require("johnny-five");
var Tessel = require("tessel-io");

var board = new five.Board({
  io: new Tessel()
});

board.on("ready", function() {
  var led = new five.Led({
    pin: process.argv[2] || 1,
    address: 0x73,
    port: "A",
    controller: "PCA9685"
  });

  // address: The address of the shield.
  //    Defaults to 0x40
  // pin: The pin the LED is connected to
  //    Defaults to 0
  // controller: The type of controller being used.
  //   Defaults to "standard".
  // port: The Tessel port being used "A" or "B"

  // Add LED to REPL (optional)
  this.repl.inject({
    led: led
  });

  led.pulse();
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
