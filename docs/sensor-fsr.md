# Sensor Fsr

Run with:
```bash
node eg/sensor-fsr.js
```


```javascript
var five = require("johnny-five"),
    board, fsr, led;

board = new five.Board();

board.on("ready", function() {

  // Create a new `fsr` hardware instance.
  fsr = new five.Sensor({
    pin: "A0",
    freq: 25
  });

  led = new five.Led(9);

  board.repl.inject({
    led: led
  });


  fsr.scale([ 0, 255 ]).on("read", function() {
    // set the led's brightness based on force
    // applied to force sensitive resistor
    //
    //

    led.brightness( this.value );
  });
});

```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/sensor-fsr.png">

[sensor-fsr.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/sensor-fsr.fzz)


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
