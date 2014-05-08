# Tinkerkit Accelerometer

Run with:
```bash
node eg/tinkerkit-accelerometer.js
```


```javascript
var five = require("johnny-five"),
  board, accel;

board = new five.Board();

board.on("ready", function() {

  // Create a new `Accelerometer` hardware instance.
  //
  // Devices:
  //
  // - Dual Axis http://www.tinkerkit.com/accelerometer/
  //

  accel = new five.Accelerometer({
    pins: ["I0", "I1"],
    freq: 100
  });

  // Accelerometer Event API

  // "acceleration"
  //
  // Fires once every N ms, equal to value of freg
  // Defaults to 500ms
  //
  accel.on("acceleration", function(err, timestamp) {

    console.log("acceleration", this.pitch, this.roll);
  });

  // "axischange"
  //
  // Fires only when X, Y or Z has changed
  //
  accel.on("axischange", function(err, timestamp) {

    console.log("axischange", this.raw);
  });
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
