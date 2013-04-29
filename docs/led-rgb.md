# Led Rgb

Run with:
```bash
node eg/led-rgb.js
```


```javascript
var five = require("johnny-five"),
    board, red, green, blue, leds;

board = new five.Board();

board.on("ready", function() {

  red = new five.Led(9);
  green = new five.Led(10);
  blue = new five.Led(11);

  leds = new five.Leds();


  // leds.pulse( 5000 );
  leds.pulse( 5000 );
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
