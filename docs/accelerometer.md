# Accelerometer

```javascript
var five = require("../lib/johnny-five.js"),
    board, accel;

board = five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `Accelerometer` hardware instance.
  //
  // five.Accelerometer([ x, y[, z] ]);
  //
  // five.Accelerometer({
  //   pins: [ x, y[, z] ]
  //   freq: ms
  // });
  //

  accel = five.Accelerometer({
    pins: [ "A3", "A4", "A5" ],
    freq: 50
  });

  // Accelerometer Event API

  // "acceleration" events fire
  accel.on("acceleration", function( err, timestamp ) {
    // console.log( "acceleration", this.axis );

    console.log( "acceleration", this.pitch );
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
