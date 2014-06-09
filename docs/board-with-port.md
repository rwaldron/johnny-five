# Board With Port

Run with:
```bash
node eg/board-with-port.js
```


```javascript
var five = require("johnny-five"),
  board;

// Johnny-Five will try its hardest to detect the port for you,
// however you may also explicitly specify the port by passing
// it as an optional property to the Board constructor:
board = new five.Board({
  port: "/dev/cu.usbmodem411"
});

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", function() {
  var val = 0;

  // Set pin 13 to OUTPUT mode
  this.pinMode(13, 1);

  // Mode Table
  // INPUT:   0
  // OUTPUT:  1
  // ANALOG:  2
  // PWM:     3
  // SERVO:   4

  // Create a loop to "flash/blink/strobe" an led
  this.loop(50, function() {
    this.digitalWrite(13, (val = val ? 0 : 1));
  });
});


// Schematic
// http://arduino.cc/en/uploads/Tutorial/ExampleCircuit_bb.png

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
