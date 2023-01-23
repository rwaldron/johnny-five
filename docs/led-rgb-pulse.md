<!--remove-start-->

# LED - RGB Pulse

<!--remove-end-->

RGB LED pulse example that fades an LED in and out repeatedly. Requires LED on pin that supports PWM (usually denoted by ~).

##### RGB LED. (Arduino UNO)


RGB LED connected to pins 6, 5, and 3 for red, green, and blue respectively.


![docs/breadboard/led-rgb.png](breadboard/led-rgb.png)<br>

Fritzing diagram: [docs/breadboard/led-rgb.fzz](breadboard/led-rgb.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-rgb-pulse.js
```


```javascript
const temporal = require("temporal");
const { Board, Led } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  // Initialize the RGB LED
  const led = new Led.RGB([6, 5, 3]);

  // Set color to red
  led.color("#FF0000");

// Stop and turn off the led pulse loop after
  // 10 seconds (shown in ms)
  board.wait(10000, () => {

    // stop() terminates the interval
    // off() shuts the led off
    led.stop().off();
  });
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

