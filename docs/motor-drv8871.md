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

const {Board, Motor} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  
  const motor = new Motor({
    pins: {
      pwm: 3,
      dir: 12
    },
    invertPWM: true
  });

  board.repl.inject({
    motor
  });

  motor.on("start", () => {
    console.log(`start: ${Date.now()}`);
  });

  motor.on("stop", () => {
    console.log(`automated stop on timer: ${Date.now()}`);
  });

  motor.on("forward", () => {
    console.log(`forward: ${Date.now()}`);

    // demonstrate switching to reverse after 5 seconds
    board.wait(5000, () => motor.reverse(255));
  });

  motor.on("reverse", () => {
    console.log(`reverse: ${Date.now()}`);

    // demonstrate stopping after 5 seconds
    board.wait(5000, motor.stop);
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
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
