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
  console.log("Ready!");

  var led = new five.Led(13);
  led.blink(500);
});

```


## Illustrations / Photos


### LED on pin 13 (Arduino UNO)


Basic example with LED inserted directly into pin 13


![docs/breadboard/led-13.png](breadboard/led-13.png)<br>
Fritzing diagram: [docs/breadboard/led-13.fzz](breadboard/led-13.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
