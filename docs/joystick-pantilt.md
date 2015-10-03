<!--remove-start-->

# Joystick - Pan + Tilt control



Run with:
```bash
node eg/joystick-pantilt.js
```

<!--remove-end-->

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


## Illustrations / Photos


### Breadboard for "Joystick - Pan + Tilt control"



![docs/breadboard/joystick-pantilt.png](breadboard/joystick-pantilt.png)<br>

Fritzing diagram: [docs/breadboard/joystick-pantilt.fzz](breadboard/joystick-pantilt.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
