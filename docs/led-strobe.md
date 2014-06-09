# Led Strobe

Run with:
```bash
node eg/led-strobe.js
```


```javascript
var five = require("johnny-five"),
  board, led;

board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = new five.Led(13);

  // "strobe" the led in 100ms on-off phases
  led.strobe(100);
});

```


## Breadboard/Illustration


![docs/breadboard/led-strobe.png](breadboard/led-strobe.png)
[docs/breadboard/led-strobe.fzz](breadboard/led-strobe.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
