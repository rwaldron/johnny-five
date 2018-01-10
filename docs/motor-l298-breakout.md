<!--remove-start-->

# Motor - l298 Breakout

<!--remove-end-->






##### Breadboard for "Motor - l298 Breakout"



![docs/breadboard/motor-l298-breakout.png](breadboard/motor-l298-breakout.png)<br>

Fritzing diagram: [docs/breadboard/motor-l298-breakout.fzz](breadboard/motor-l298-breakout.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/motor-l298-breakout.js
```


```javascript
var five = require("johnny-five"),
  board = new five.Board();

board.on("ready", function() {
  var motor;

  motor = new five.Motor({
    pins: {
      pwm: 8,
      dir: 9
    }
  });

  board.repl.inject({
    motor: motor
  });

  motor.on("start", function() {
    console.log("start", Date.now());
  });

  motor.on("stop", function() {
    console.log("automated stop on timer", Date.now());
  });

  motor.on("forward", function() {
    console.log("forward", Date.now());

    // demonstrate switching to reverse after 5 seconds
    board.wait(5000, function() {
      motor.reverse(50);
    });
  });

  motor.on("reverse", function() {
    console.log("reverse", Date.now());

    // demonstrate stopping after 5 seconds
    board.wait(5000, function() {
      motor.stop();
    });
  });

  // set the motor going forward full speed
  motor.forward(255);
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
