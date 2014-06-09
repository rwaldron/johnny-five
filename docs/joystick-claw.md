# Joystick Claw

Run with:
```bash
node eg/joystick-claw.js
```


```javascript
var five = require("johnny-five"),
  board, claw, joystick;

board = new five.Board();

board.on("ready", function() {

  var claw = new five.Servo({
    pin: 9,
    range: [0, 170]
  }),
    joystick = new five.Joystick({
      pins: ["A0", "A1"],
      freq: 250
    });

  // Set the claw degrees to half way
  // (the joystick deadzone)
  claw.to(90);

  joystick.on("axismove", function() {
    // Open/close the claw by setting degrees according
    // to Y position of joystick.
    // limit to 170 on medium servos (ei. the servo used on the claw)
    claw.to(Math.ceil(170 * this.fixed.y));
  });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
