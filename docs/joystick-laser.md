# Joystick Laser

Run with:
```bash
node eg/joystick-laser.js
```


```javascript
var five = require("johnny-five"),
  board = new five.Board({
    debug: true
  });

board.on("ready", function() {
  var range, pan, tilt, joystick;

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

  // Joystick to control pan/tilt
  // Read Analog 0, 1
  // Limit events to every 50ms
  joystick = new five.Joystick({
    pins: ["A0", "A1"],
    freq: 100
  });

  // Center all servos
  (five.Servos()).center();

  joystick.on("axismove", function() {

    tilt.to(Math.ceil(170 * this.fixed.y));
    pan.to(Math.ceil(170 * this.fixed.x));

  });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
