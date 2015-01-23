<!--remove-start-->
# Led Array

Run with:
```bash
node eg/led-array.js
```
<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var array = new five.Leds([3, 5, 6]);

  array.pulse();
});


```


## Breadboard/Illustration


![docs/breadboard/led-array.png](breadboard/led-array.png)
[docs/breadboard/led-array.fzz](breadboard/led-array.fzz)


Control multiple LEDs at once by creating an Led.Array.
All must be on PWM pins if you want to use methods such
as pulse() or fade()



<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
