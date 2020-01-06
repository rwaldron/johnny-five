<!--remove-start-->

# TinkerKit - Combo

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/tinkerkit-combo.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var accel = new five.Accelerometer({
    id: "accelerometer",
    pins: ["I0", "I1"]
  });

  var slider = new five.Sensor({
    id: "slider",
    pin: "I2"
  });

  var servos = new five.Servos([
    {
      id: "servo",
      pin: "O0",
      type: "continuous"
    },
    {
      id: "servo",
      pin: "O0",
      type: "continuous"
    }
  ]);

  slider.scale(0, 180).on("change", function() {
    servos.to(this.value);
  });

  accel.on("acceleration", function() {
    // console.log( this.raw.x, this.raw.y );
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
