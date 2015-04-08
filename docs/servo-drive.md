<!--remove-start-->

# Servo - Drive





Run with:
```bash
node eg/servo-drive.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five"),
  board, wheels;

board = new five.Board();

board.on("ready", function() {

  wheels = {};

  // Create two servos as our wheels
  wheels.left = new five.Servo({
    pin: 9,
    // `type` defaults to standard servo.
    // For continuous rotation servos, override the default
    // by setting the `type` here
    type: "continuous"

  });

  wheels.right = new five.Servo({
    pin: 10,
    // `type` defaults to standard servo.
    // For continuous rotation servos, override the default
    // by setting the `type` here
    type: "continuous",
    invert: true // one wheel mounted inverted of the other
  });

  wheels.both = new five.Servos().stop(); // reference both together

  // Add servos to REPL (optional)
  this.repl.inject({
    wheels: wheels
  });

  // Drive forwards
  // Note, cw() vs ccw() might me different for you
  // depending on how you mount the servos
  wheels.both.cw();

  // Stop driving after 3 seconds
  this.wait(3000, function() {
    wheels.both.stop();
  });

});

```


## Illustrations / Photos


### Servos on pins 9 and 10


Basic example with servos connected to pins 9 and 10. Requires servos on pins that support PWM (usually denoted by ~).


![docs/breadboard/servo-two.png](breadboard/servo-two.png)<br>
Fritzing diagram: [docs/breadboard/servo-two.fzz](breadboard/servo-two.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
