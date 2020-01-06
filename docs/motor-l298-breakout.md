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
const {Board, Motor} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const motor = new Motor({
    pins: {
      pwm: 8,
      dir: 9
    }
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
    board.wait(5000, () => motor.reverse(50));
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
