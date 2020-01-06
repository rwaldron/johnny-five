<!--remove-start-->

# LED - Pulse

<!--remove-end-->


LED pulse example that fades an LED in and out repeatedly. Requires LED on pin that supports PWM (usually denoted by ~).





##### LED on pin 11 (Arduino UNO)


LED inserted directly into pin 11.


![docs/breadboard/led-11-pwm.png](breadboard/led-11-pwm.png)<br>

Fritzing diagram: [docs/breadboard/led-11-pwm.fzz](breadboard/led-11-pwm.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-pulse.js
```


```javascript
const { Board, Led } = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  // Create a standard `led` component
  // on a valid pwm pin
  const led = new Led(11);

  led.pulse();

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
