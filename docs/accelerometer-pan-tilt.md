<!--remove-start-->

# Accelerometer - Pan + Tilt

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/accelerometer-pan-tilt.js
```


```javascript
var five = require("johnny-five"),
  board;

board = new five.Board();

board.on("ready", function() {

  var range, pan, tilt, accel;

  range = [0, 170];

  // Servo to control panning
  pan = new five.Servo({
    pin: 9,
    range: range
  });

  // Servo to control tilt
  tilt = new five.Servo({
    pin: 10,
    range: range
  });

  // Accelerometer to control pan/tilt
  accel = new five.Accelerometer({
    pins: ["A3", "A4", "A5"],
    freq: 250
  });

  // Center all servos
  (five.Servos()).center();

  accel.on("acceleration", function() {
    // console.log( "acceleration", this.axis );

    tilt.to(Math.abs(Math.ceil(170 * this.pitch.toFixed(2)) - 180));
    pan.to(Math.ceil(170 * this.roll.toFixed(2)));

    // TODO: Math.abs(v - 180) as inversion function ?
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
