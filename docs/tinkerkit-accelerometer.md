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









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
