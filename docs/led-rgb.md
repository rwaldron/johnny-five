# Led Rgb

```javascript
var five = require("../lib/johnny-five.js"),
    board, red, green, blue, leds;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  red = five.Led(9);
  green = five.Led(10);
  blue = five.Led(11);

  leds = five.Leds();


  // leds.pulse( 5000 );
  leds.pulse( 5000 );
});

```

## Breadboard




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
