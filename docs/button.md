# Button

```javascript
var five = require("johnny-five"),
    board, button;

board = five.Board();

board.on("ready", function() {

  // Create a new `button` hardware instance.
  // This example allows the button module to
  // create a completely default instance
  button = five.Button(7);

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

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/button.png">

[button.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/button.fzz)


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
