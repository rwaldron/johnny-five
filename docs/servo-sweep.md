<!--remove-start-->

# Servo - Sweep

<!--remove-end-->






##### Servo on pin 10


Servo connected to pin 10. Requires servo on pin that supports PWM (usually denoted by ~).


![docs/breadboard/servo.png](breadboard/servo.png)<br>

Fritzing diagram: [docs/breadboard/servo.fzz](breadboard/servo.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/servo-sweep.js
```


```javascript
const {Board, Servo} = require("johnny-five");
const board = new Board();

board.on("ready", () => {
  const servo = new Servo({
    pin: 10,
    startAt: 90
  });
  let lap = 0;

  servo.sweep().on("sweep:full", () => {
    console.log(`lap ${++lap}`);

    if (lap === 1) {
      servo.sweep({
        range: [40, 140],
        step: 10
      });
    }

    if (lap === 2) {
      servo.sweep({
        range: [60, 120],
        step: 5
      });
    }

    if (lap === 3) {
      servo.sweep({
        range: [80, 100],
        step: 1
      });
    }

    if (lap === 5) {
      process.exit(0);
    }
  });
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
