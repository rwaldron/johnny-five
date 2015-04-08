<!--remove-start-->

# LED - RGB (Common Anode)


Demonstrates use of an RGB LED (common anode) by setting its color to red ("#ff0000") and making it blink. Requires RGB LED on pins that support PWM (usually denoted by ~).




Run with:
```bash
node eg/led-rgb-anode.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var anode = new five.Led.RGB({
    pins: {
      red: 3,
      green: 5,
      blue: 6
    },
    isAnode: true
  });

  // Add led to REPL (optional)
  this.repl.inject({
    anode: anode
  });

  // Turn it on and set the initial color
  anode.on();
  anode.color("#FF0000");

  anode.blink(1000);

});

```


## Illustrations / Photos


### Common Anode RGB LED. (Arduino UNO)


Basic example with RGB LED connected to pins 6, 5, and 3 for red, green, and blue respectively. The common pin is connected to +5v.


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
