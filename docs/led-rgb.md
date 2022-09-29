<!--remove-start-->

# LED - RGB

<!--remove-end-->


Demonstrates use of an RGB LED (common cathode) by setting its color to red (`#ff0000`) and making it blink. Requires RGB LED on pins that support PWM (usually denoted by ~).





##### Common Cathode RGB LED. (Arduino UNO)


RGB LED connected to pins 6, 5, and 3 for red, green, and blue respectively. The common pin is connected to ground.


![docs/breadboard/led-rgb.png](breadboard/led-rgb.png)<br>

Fritzing diagram: [docs/breadboard/led-rgb.fzz](breadboard/led-rgb.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-rgb.js
```


```javascript
const { Board, Led } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  // Initialize the RGB LED
  const led = new Led.RGB({
    pins: {
      red: 6,
      green: 5,
      blue: 3
    }
  });

  // RGB LED alternate constructor
  // This will normalize an array of pins in [r, g, b]
  // order to an object (like above) that's shaped like:
  // {
  //   red: r,
  //   green: g,
  //   blue: b
  // }
  // const led = new Led.RGB([3,5,6]);

  // Add led to REPL (optional)
  board.repl.inject({ led });

  // Turn it on and set the initial color
  led.on();
  led.color("#FF0000");

  led.blink(1000);
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
