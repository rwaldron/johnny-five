# Led Pulse

Run with:
```bash
node eg/led-pulse.js
```


```javascript
var five = require("johnny-five"),
  board, led;

board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = new five.Led({
    // Use PWM pin 9 for fading example
    pin: 9
  });

  // pinMode is set to OUTPUT by default

  // Inject the `led` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    led: led
  });

  // "pulse" the led in a looping interval
  // Interval defaults to 1000ms
  // pinMode is will be changed to PWM automatically
  led.pulse();


  // Turn off the led pulse loop after 10 seconds (shown in ms)
  this.wait(10000, function() {

    led.stop().off();

  });
});

```


## Breadboard/Illustration


![docs/breadboard/led-pulse.png](breadboard/led-pulse.png)
[docs/breadboard/led-pulse.fzz](breadboard/led-pulse.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
