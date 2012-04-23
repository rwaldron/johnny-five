# Claw

```javascript
var five = require("../lib/johnny-five.js"),
    board;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  var claw = 9,
      arm = 11,
      degrees = 10,
      incrementer = 10,
      last;

  this.firmata.pinMode( claw, 4 );
  this.firmata.pinMode( arm, 4 );

  // TODO: update to use loop api
  setInterval(function() {

    if ( degrees >= 180 || degrees === 0 ) {
      incrementer *= -1;
    }

    degrees += incrementer;

    if ( degrees === 180 ) {
      if ( !last || last === 90 ) {
        last = 180;
      } else {
        last = 90;
      }
      this.firmata.servoWrite( arm, last );
    }

    this.firmata.servoWrite( claw, degrees );

  }.bind(this), 25);
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
