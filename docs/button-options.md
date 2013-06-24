# Button Options

Run with:
```bash
node eg/button-options.js
```


```javascript
var five = require("johnny-five"),
    board, button;

board = new five.Board();

board.on("ready", function() {

  // Create a new `button` hardware instance
  button = new five.Button({
    board: board,
    pin: 7,
    holdtime: 1000,
    invert: false // Default: "false".  Set to "true" if button is Active-Low
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

## Breadboard/Illustration

![docs/breadboard/button-options.png](breadboard/button-options.png)
[docs/breadboard/button-options.fzz](breadboard/button-options.fzz)



## Devices




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
