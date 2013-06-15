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
    pins: [ "I0", "I1" ]
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

  slider.scale( 0, 180 ).on("change", function() {
    servos.move( this.value );
  });

  accel.on("acceleration", function() {
    // console.log( this.raw.x, this.raw.y );
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
