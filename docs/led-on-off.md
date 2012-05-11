# Led On Off

```javascript
var five = require("johnny-five"),
    board, led;

board = five.Board();

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = five.Led({
    pin: 13
  });

  // "on" turns the led _on_
  led.on();

  // "off" turns the led _off_
  led.off();

  // Turn the led back on after 3 seconds (shown in ms)
  this.wait( 3000, function() {

    led.on();

  });
});

```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/led-on-off.png">

[led-on-off.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/led-on-off.fzz)


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
