<!--remove-start-->

# Servo - Animation

<!--remove-end-->






##### Servo on pin 10


Servo connected to pin 10. Requires servo on pin that supports PWM (usually denoted by ~).


![docs/breadboard/servo.png](breadboard/servo.png)<br>

Fritzing diagram: [docs/breadboard/servo.fzz](breadboard/servo.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/servo-animation.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create a new `servo` hardware instance.
  var servo = new five.Servo(10);

  // Create a new `animation` instance.
  var animation = new five.Animation(servo);

  // Enqueue an animation segment with options param
  // See Animation example and docs for details
  animation.enqueue({
    cuePoints: [0, 0.25, 0.75, 1],
    keyFrames: [90, {
      value: 180,
      easing: "inQuad"
    }, {
      value: 0,
      easing: "outQuad"
    }, 90],
    duration: 2000
  });

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servo: servo,
    animation: animation
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
