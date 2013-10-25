# Sensor Fsr Servo

Run with:
```bash
node eg/sensor-fsr-servo.js
```


```javascript
var five = require("johnny-five"),
    board, fsr, servo;

board = new five.Board();

board.on("ready", function() {

  // Create a new `fsr` hardware instance.
  fsr = new five.Sensor({
    pin: "A0",
    freq: 25
  });

  servo = new five.Servo(10);

  fsr.scale([ 0, 180 ]).on("data", function() {

    servo.move( this.value );

  });
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
