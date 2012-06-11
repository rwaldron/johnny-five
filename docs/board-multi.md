# Board Multi

```javascript
var five = require("johnny-five"),
    boards;

boards = [
  new five.Board({ id: "a" }),
  new five.Board({ id: "b" })
];

// Add ready event handlers to both boards.
boards.forEach(function( board ) {
  board.on("ready", function() {
    var val = 0;

    console.log( "ready!!!!!" );

    // Set pin 13 to OUTPUT mode
    this.pinMode( 13, 1 );

    // Create a loop to "flash/blink/strobe" an led
    this.loop( 50, function() {
      this.digitalWrite( 13, (val = val ? 0 : 1) );
    });
  });
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
