<!--remove-start-->

# LED - Rainbow


Demonstrates use of an RGB LED (common cathode) by setting its color to red ("#ff0000") and making it blink. Requires RGB LED on pins that support PWM (usually denoted by ~).


Run with:
```bash
node eg/led-rainbow.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var rgb = new five.Led.RGB([6, 5, 3]);
  var rainbow = ["FF0000", "FF7F00", "00FF00", "FFFF00", "0000FF", "4B0082", "8F00FF"];
  var index = 0;

  setInterval(function() {
    if (index + 1 === rainbow.length) {
      index = 0;
    }
    rgb.color(rainbow[index++]);
  }, 500);
});

```


## Illustrations / Photos


### Common Cathode RGB LED. (Arduino UNO)


Basic example with RGB LED connected to pins 6, 5, and 3 for red, green, and blue respectively. The common pin is connected to ground.


![docs/breadboard/led-rgb-anode.png](breadboard/led-rgb-anode.png)<br>

Fritzing diagram: [docs/breadboard/led-rgb-anode.fzz](breadboard/led-rgb-anode.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
