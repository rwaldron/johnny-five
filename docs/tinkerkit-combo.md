# Tinkerkit Combo

Run with:
```bash
node eg/tinkerkit-combo.js
```


```javascript
var five = require("johnny-five");

new five.Board().on("ready", function() {
  var accel, slider, servos;

  accel = new five.Accelerometer({
    id: "accelerometer",
    pins: ["I0", "I1"]
  });

  slider = new five.Sensor({
    id: "slider",
    pin: "I2"
  });

  new five.Servo({
    id: "servo",
    pin: "O0",
    type: "continuous"
  });

  new five.Servo({
    id: "servo",
    pin: "O1"
  });

  servos = new five.Servo.Array();

  slider.scale(0, 180).on("change", function() {
    servos.to(this.value);
  });

  accel.on("acceleration", function() {
    // console.log( this.raw.x, this.raw.y );
  });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
