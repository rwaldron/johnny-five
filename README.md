# Johnny 5, is in progress.

[Firmata](https://github.com/jgautier/firmata) powered Arduino programming framework.

# [Video Demo](http://jsfiddle.net/rwaldron/7tdQR/show/light/)

## Getting Started
Install the module with: `npm install johnny-five`

```javascript
var five = require("johnny-five"),
    board, led;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  led = new five.Led({
    pin: 13
  });

  led.strobe( 100 );
});
```

## Documentation

_(Nothing yet)_


## Examples

- [Just a REPL Session](https://github.com/rwldrn/johnny-five/blob/master/eg/repl.js)
- [Claw Demo Code](https://github.com/rwldrn/johnny-five/blob/master/eg/claw.js)
- [Strobe LED](https://github.com/rwldrn/johnny-five/blob/master/eg/led.js)
- [Button w/ Default Options](https://github.com/rwldrn/johnny-five/blob/master/eg/button.js)
- [Button w/ Specific Options](https://github.com/rwldrn/johnny-five/blob/master/eg/button-options.js)


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
