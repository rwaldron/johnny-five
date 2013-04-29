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

  range = [ 0, 170 ];

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
    pins: [ "A0", "A1" ],
    freq: 100
  });

  // Center all servos
  (five.Servos()).center();

  joystick.on("axismove", function() {

    tilt.move( Math.ceil(170 * this.fixed.y) );
    pan.move( Math.ceil(170 * this.fixed.x) );

  });
});

```

## Breadboard/Illustration





## Devices




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
