# Nodeconf Slider

Run with:
```bash
node eg/nodeconf-slider.js
```


```javascript
var five = require("johnny-five"),
    board, slider, servo, scalingRange;

board = new five.Board();

board.on("ready", function() {

  slider = new five.Sensor({
    pin: "A0",
    freq: 50
  });

  // log out the slider values to the console.
  slider.on("slide", function( err, value ) {
    if ( err ) {
      console.log( "error: ", err );
    } else {
      console.log( Math.floor(this.value) );
    }
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
