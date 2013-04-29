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
        range: [ 0, 170 ]
      }),
      joystick = new five.Joystick({
        pins: [ "A0", "A1" ],
        freq: 250
      });

  // Set the claw degrees to half way
  // (the joystick deadzone)
  claw.move( 90 );

  joystick.on("axismove", function() {
    // Open/close the claw by setting degrees according
    // to Y position of joystick.
    // limit to 170 on medium servos (ei. the servo used on the claw)
    claw.move( Math.ceil(170 * this.fixed.y) );
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
