# Accelerometer Pan Tilt

Run with:
```bash
node eg/accelerometer-pan-tilt.js
```


```javascript
var five = require("johnny-five"),
    board;

board = new five.Board();

board.on("ready", function() {

  var range, pan, tilt, accel;

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

  // Accelerometer to control pan/tilt
  accel = new five.Accelerometer({
    pins: [ "A3", "A4", "A5" ],
    freq: 250
  });

  // Center all servos
  (five.Servos()).center();

  accel.on("acceleration", function( err, timestamp ) {
    // console.log( "acceleration", this.axis );

    tilt.move( Math.abs( Math.ceil(170 * this.pitch.toFixed(2)) - 180 ) );
    pan.move( Math.ceil(170 * this.roll.toFixed(2)) );

    // TODO: Math.abs(v - 180) as inversion function ?
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
