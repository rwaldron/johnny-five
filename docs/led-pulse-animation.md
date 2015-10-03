<!--remove-start-->

# LED - Pulse with animation


LED pulse example that incrementally fades an LED brighter and brighter. Requires LED on pin that supports PWM (usually denoted by ~).


Run with:
```bash
node eg/led-pulse-animation.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` component
  // on a valid pwm pin
  var led = new five.Led(11);

  // Instead of passing a time and rate, you can
  // pass any valid Animation() segment opts object
  // https://github.com/rwaldron/johnny-five/wiki/Animation#segment-properties
  led.pulse({
    easing: "linear",
    duration: 3000,
    cuePoints: [0, 0.2, 0.4, 0.6, 0.8, 1],
    keyFrames: [0, 10, 0, 50, 0, 255],
    onstop: function() {
      console.log("Animation stopped");
    }
  });

  // Stop and turn off the led pulse loop after
  // 12 seconds (shown in ms)
  this.wait(12000, function() {

    // stop() terminates the interval
    // off() shuts the led off
    led.stop().off();
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
