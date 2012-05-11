# Button Options

```javascript
var five = require("johnny-five"),
    board, button;

board = five.Board();

board.on("ready", function() {

  // Create a new `button` hardware instance
  button = five.Button({
    board: board,
    pin: 7,
    holdtime: 1000
  });

  // Inject the `button` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    button: button
  });

  // Button Event API

  // "down" the button is pressed
  button.on("down", function() {
    console.log("down");
  });

  // "hold" the button is pressed for specified time.
  //        defaults to 500ms (1/2 second)
  //        set
  button.on("hold", function() {
    console.log("hold");
  });

  // "up" the button is released
  button.on("up", function() {
    console.log("up");
  });
});

```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/button-options.png">

[button-options.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/button-options.fzz)


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
