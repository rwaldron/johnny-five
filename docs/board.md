<!--remove-start-->
# Basic Board initialization

Run with:
```bash
node eg/board.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", function() {
  // Set pin 13 to OUTPUT mode
  this.pinMode(13, this.MODES.OUTPUT);

  // Create a loop to "flash/blink/strobe" an led
  this.loop(500, function() {
    // Whatever the last value was, write the opposite
    this.digitalWrite(13, this.pins[13].value ? 0 : 1);
  });
});

```


## Breadboard/Illustration


![docs/breadboard/board.png](breadboard/board.png)




<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
