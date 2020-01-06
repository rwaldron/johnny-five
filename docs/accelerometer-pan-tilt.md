<!--remove-start-->

# Accelerometer - Pan + Tilt

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/accelerometer-pan-tilt.js
```


```javascript
const { Accelerometer, Board, Servo, Servos } = require("johnny-five");
const board = new Board();

board.on("ready", () => {

  const range = [0, 170];

  // Servo to control panning
  const pan = new Servo({
    pin: 9,
    range
  });

  // Servo to control tilt
  const tilt = new Servo({
    pin: 10,
    range
  });

  // Accelerometer to control pan/tilt
  const accelerometer = new Accelerometer({
    pins: ["A3", "A4", "A5"],
    freq: 250
  });

  // Center all servos
  new Servos([pan, tilt]).center();

  accelerometer.on("acceleration", () => {
    tilt.to(Math.abs(Math.ceil(170 * accelerometer.pitch.toFixed(2)) - 180));
    pan.to(Math.ceil(170 * accelerometer.roll.toFixed(2)));
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
