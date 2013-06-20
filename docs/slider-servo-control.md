# Slider Servo Control

Run with:
```bash
node eg/slider-servo-control.js
```


```javascript
var five = require("johnny-five"),
    board, slider, servo, scalingRange;

board = new five.Board();

board.on("ready", function() {

  scalingRange = [ 0, 170 ];

  slider = new five.Sensor({
    pin: "A0",
    freq: 50
  });

  servo = new five.Servo({
    pin: 9,
    range: scalingRange
  });


  // The slider's value will be scaled to match the servo's movement range

  slider.scale( scalingRange ).on("slide", function( err, value ) {

    servo.move( Math.floor(this.value) );

  });
});

```

## Breadboard/Illustration

![docs/breadboard/slider-servo-control.png](breadboard/slider-servo-control.png)



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
