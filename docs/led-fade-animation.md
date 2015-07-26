<!--remove-start-->

# LED - Fade with animation

<!--remove-end-->


LED fade example that fades an LED up and down to varying values. Requires LED on pin that supports PWM (usually denoted by ~).





##### LED on pin 11 (Arduino UNO)


Basic example with LED inserted directly into pin 11.


![docs/breadboard/led-11-pwm.png](breadboard/led-11-pwm.png)<br>

Fritzing diagram: [docs/breadboard/led-11-pwm.fzz](breadboard/led-11-pwm.fzz)

&nbsp;




Run with:
```bash
node eg/led-fade-animation.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var led = new five.Led(11);

  led.fade({
    easing: "linear",
    duration: 1000,
    cuePoints: [0, 0.2, 0.4, 0.6, 0.8, 1],
    keyFrames: [0, 250, 25, 150, 100, 125],
    onstop: function() {
      console.log("Animation stopped");
    }
  });

  // Toggle the led after 2 seconds (shown in ms)
  this.wait(2000, function() {
    led.fadeOut();
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
