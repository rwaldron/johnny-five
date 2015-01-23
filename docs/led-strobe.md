<!--remove-start-->
# Led Strobe

Run with:
```bash
node eg/led-strobe.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` component instance
  var led = new five.Led(13);

  // "blink" the led in 100ms on-off phases
  led.blink(100);
});

```


## Breadboard/Illustration


![docs/breadboard/led-strobe.png](breadboard/led-strobe.png)
[docs/breadboard/led-strobe.fzz](breadboard/led-strobe.fzz)




<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
