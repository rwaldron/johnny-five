<!--remove-start-->

# Board - Specify port

<!--remove-end-->






##### LED on pin 13 (Arduino UNO)


LED inserted directly into pin 13


![docs/breadboard/led-13.png](breadboard/led-13.png)<br>

Fritzing diagram: [docs/breadboard/led-13.fzz](breadboard/led-13.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/board-with-port.js
```


```javascript
const { Board } = require("johnny-five");

// Johnny-Five will try its hardest to detect the port for you,
// however you may also explicitly specify the port by passing
// it as an optional property to the Board constructor:
const board = new Board({
  port: "/dev/cu.usbmodem1411"
});

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", () => {
  board.pinMode(13, board.MODES.OUTPUT);

  board.loop(500, () => {
    // Whatever the last value was, write the opposite
    board.digitalWrite(13, board.pins[13].value ? 0 : 1);
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
