<!--remove-start-->

# TinkerKit - Accelerometer

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/tinkerkit-accelerometer.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Create a new `Accelerometer` hardware instance.
  //
  // Devices:
  //
  // - Dual Axis http://tinkerkit.tihhs.nl/accelerometer/
  //

  var accel = new five.Accelerometer({
    pins: ["I0", "I1"],
    freq: 100
  });

  // Accelerometer Event API

  // "acceleration"
  //
  // Fires once every N ms, equal to value of freg
  // Defaults to 500ms
  //
  accel.on("acceleration", function() {

    console.log("acceleration", this.pitch, this.roll);
  });

  // "axischange"
  //
  // Fires only when X, Y or Z has changed
  //
  accel.on("axischange", function() {

    console.log("axischange", this.raw);
  });
});

```









## Learn More

- [TinkerKit Dual Axis Accelerometer](http://tinkerkit.tihhs.nl/accelerometer/)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
