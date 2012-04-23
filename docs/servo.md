# Servo

```javascript
var five = require("../lib/johnny-five.js"),
    board, servo;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `servo` hardware instance.
  servo = new five.Servo({
    pin: 9
  });

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servo: servo
  });

  // Servo API

  // reset()
  // Resets the servo to 0deg
  servo.reset();

  // move( deg )
  // Moves the servo to position by degrees

  // sweep( obj )
  // Perform a 0-180 cycling servo sweep
  // optionally accepts an object of sweep settings:
  // {
  //    lapse: time in milliseconds to wait between moves
  //           defaults to 500ms
  //    degrees: distance in degrees to move
  //           defaults to 10deg
  // }
  // servo.sweep();


  // Servo Event API

  // "moved" events fire after a successful move.
  servo.on("moved", function( err, degrees ) {
    console.log( "moved", degrees );
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
