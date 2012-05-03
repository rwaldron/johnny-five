# Joystick Laser

```javascript
var five = require("../lib/johnny-five.js"),
    board, pan, tilt, joystick, array;

board = new five.Board({
  debug: true
});

board.on("ready", function() {


  pan = new five.Servo({
    pin: 9,
    range: [ 0, 170 ]
  });

  tilt = new five.Servo({
    pin: 10,
    range: [ 0, 170 ]
  });

  joystick = new five.Joystick({
    pins: [ "A0", "A1" ],
    freq: 250
  });

  (new five.Servos()).center();

  joystick.on("axismove", function() {

    tilt.move( Math.ceil(170 * this.fixed.y) );
    pan.move( Math.ceil(170 * this.fixed.x) );

  });
});

```

## Breadboard




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
