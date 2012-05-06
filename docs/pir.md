# Pir

```javascript
var five = require("johnny-five"),
    board, pir;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `pir` hardware instance.
  pir = new five.Pir({
    pin: 7
  });

  // Inject the `pir` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    pir: pir
  });

  // Pir Event API

  // "calibrated" occurs once, at the beginning of a session,
  pir.on("calibrated", function( err, date ) {
    console.log( "calibrated", date );
  });

  // "motionstart" events are fired when the "calibrated"
  // proximal area is disrupted, generally by some form of movement
  pir.on("motionstart", function( err, date ) {
    console.log( "motionstart", date );
  });

  // "motionstart" events are fired following a "motionstart event
  // when no movement has occurred in X ms
  pir.on("motionend", function( err, date ) {
    console.log( "motionend", date );
  });
});

```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/pir.png">

[pir.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/pir.fzz)


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
