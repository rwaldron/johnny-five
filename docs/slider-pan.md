# Slider Pan

```javascript
var five = require("johnny-five"),
    board, slider, tilt, scalingRange;

board = new five.Board();

board.on("ready", function() {

  scalingRange = [ 0, 170 ];

  slider = new five.Sensor({
    pin: "A0",
    freq: 50
  });

  tilt = new five.Servo({
    pin: 9,
    range: scalingRange
  });

  slider.scale( scalingRange ).on("slide", function( err, value ) {

    // The slider's value will be scaled to match the tilt servo range

    tilt.move( Math.floor(this.value) );

  });
});

```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/slider-pan.png">

[slider-pan.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/slider-pan.fzz)


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
