<!--remove-start-->

# Motor - PCA9685

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/motor-PCA9685.js
```


```javascript
var five = require("johnny-five"),
  board, motor, led;

board = new five.Board();

/*
 * The PCA9685 controller has been tested on
 * the Adafruit Motor/Stepper/Servo Shield v2
 */

board.on("ready", function() {
  // Create a new `motor` hardware instance.
  motor = new five.Motor({
    pins: [8, 9, 10],
    controller: "PCA9685",
    address: 0x60
  });

  // Inject the `motor` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    motor: motor,
  });

  // Motor Event API

  // "start" events fire when the motor is started.
  motor.on("start", function() {
    console.log("start", Date.now());

    // Demonstrate motor stop in 2 seconds
    board.wait(2000, function() {
      motor.stop();
    });
  });

  // "stop" events fire when the motor is started.
  motor.on("stop", function() {
    console.log("stop", Date.now());
  });

  // Motor API

  // start()
  // Start the motor. `isOn` property set to |true|
  motor.start();

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
