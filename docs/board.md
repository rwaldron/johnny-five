<!--remove-start-->

# Board - Basic Initialization

<!--remove-end-->






##### LED on pin 13 (Arduino UNO)


LED inserted directly into pin 13


![docs/breadboard/led-13.png](breadboard/led-13.png)<br>

Fritzing diagram: [docs/breadboard/led-13.fzz](breadboard/led-13.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/board.js
```


```javascript
const { Board, Led } = require("johnny-five");
const board = new Board();

// The board's pins will not be accessible until
// the board has reported that it is ready
board.on("ready", () => {
  console.log("Ready!");

  const led = new Led(13);
  led.blink(500);
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
