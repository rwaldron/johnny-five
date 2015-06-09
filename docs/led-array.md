<!--remove-start-->

# LED - Array


Demonstrates controlling multiple LEDs at once through the use of an LED array. Requires LEDs on pins that support PWM (usually denoted by ~).



### Breadboard for "LED - Array"



![docs/breadboard/led-array.png](breadboard/led-array.png)<br>

Fritzing diagram: [docs/breadboard/led-array.fzz](breadboard/led-array.fzz)

&nbsp;



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








## Additional Notes

Control multiple LEDs at once by creating an LED collection (`Leds`).
All must be on PWM pins if you want to use methods such
as `pulse()` or `fade()`


&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
