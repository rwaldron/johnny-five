<!--remove-start-->

# Motor - Adafruit DRV8871 DC Motor Driver Breakout

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/motor-drv8871.js
```


```javascript
/*
  This example is for the Adafruit DRV8871
  https://www.adafruit.com/product/3190
*/

var five = require("johnny-five"),
  board = new five.Board();

board.on("ready", function() {
  var motor;

  motor = new five.Motor({
    pins: {
      pwm: 3,
      dir: 12
    },
    invertPWM: true
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
      motor.reverse(255);
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
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
