# Johnny 5, is in progress.

[Firmata](https://github.com/jgautier/firmata) powered Arduino programming framework.

# [Video Demo](http://jsfiddle.net/rwaldron/7tdQR/show/light/)

## Getting Started
Install the module with: `npm install johnny-five`

```javascript
var five = require("johnny-five"),
    board, repl;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Open an interactive board control session!
  repl = new five.Repl({
    board: board
  });

  // ...Or...

  // Set up an output pin!
  this.board.pinMode( 9, 1 );

  // Make a servo move on that pin!
  this.board.servoWrite( 9, 180 );

  // Woo!
});
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
