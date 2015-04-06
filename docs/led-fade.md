<!--remove-start-->
# LED - Fade

Run with:
```bash
node eg/led-fade.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var led = new five.Led(11);

  led.fadeIn();

  // Toggle the led after 5 seconds (shown in ms)
  this.wait(5000, function() {
    led.fadeOut();
  });
});

```


## Breadboard/Illustration


![docs/breadboard/led-fade.png](breadboard/led-fade.png)
[(Fritzing diagram)](breadboard/led-fade.fzz)





<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
