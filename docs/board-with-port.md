<!--remove-start-->
# Board - Specify port

Run with:
```bash
node eg/board-with-port.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");

// Johnny-Five will try its hardest to detect the port for you,
// however you may also explicitly specify the port by passing
// it as an optional property to the Board constructor:
var board = new five.Board({
  port: "/dev/cu.usbmodem1411"
});

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", function() {
  this.pinMode(13, this.MODES.OUTPUT);

  this.loop(500, function() {
    // Whatever the last value was, write the opposite
    this.digitalWrite(13, this.pins[13].value ? 0 : 1);
  });
});

```


## Breadboard/Illustration


![docs/breadboard/board-with-port.png](breadboard/board-with-port.png)
[docs/breadboard/board-with-port.fzz](breadboard/board-with-port.fzz)




<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
