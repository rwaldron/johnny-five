<!--remove-start-->

# TinkerKit - Gyro

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/tinkerkit-gyroscope.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // Create a new `Gyro` hardware instance.

  var gyro = new five.Gyro({
    pins: ["I0", "I1"],
    sensitivity: 0.67
  });

  gyro.on("change", function() {
    console.log("X raw: %d rate: %d", this.x, this.rate.x);
    console.log("Y raw: %d rate: %d", this.y, this.rate.y);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
