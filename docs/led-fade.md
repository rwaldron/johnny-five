# Led Fade

```javascript
var five = require("../lib/johnny-five.js"),
    board, led;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = new five.Led({
    // Use PWM pin 9 for fading example
    pin: 9
  });

  // pinMode is set to OUTPUT by default

  // Inject the `led` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    led: led
  });

  // "fade" the led in a looping interval
  // pinMode is will be changed to PWM automatically
  led.fade();


  // Stop and turn off the led fade loop after 10 seconds (shown in ms)
  this.wait( 10000, function() {

    led.stop().off();

  });
});

```

## Documentation

_(Nothing yet)_


## Schematics

_(Nothing yet)_



## Contributing
All contributions must adhere to the the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
