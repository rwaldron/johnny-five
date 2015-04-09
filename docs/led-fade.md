<!--remove-start-->

# LED - Fade


LED fade example that fades in an led, waits 5 seconds, and then fades it out. Requires LED on pin that supports PWM (usually denoted by ~).




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


## Illustrations / Photos


### LED on pin 11 (Arduino UNO)


Basic example with LED inserted directly into pin 11.


![docs/breadboard/led-11-pwm.png](breadboard/led-11-pwm.png)<br>

Fritzing diagram: [docs/breadboard/led-11-pwm.fzz](breadboard/led-11-pwm.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
