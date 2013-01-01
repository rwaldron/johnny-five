# Toggle Switch

Run with:
```bash
node eg/toggle-switch.js
```


```javascript
var five = require("../lib/johnny-five.js"),
    board, toggleSwitch;

board = new five.Board();

board.on("ready", function() {

  // Create a new `switch` hardware instance.
  // This example allows the switch module to
  // create a completely default instance
  toggleSwitch = new five.Switch(8);

  // Inject the `switch` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    toggleSwitch: toggleSwitch
  });

  // Switch Event API

  // "closed" the switch is closed
  toggleSwitch.on("close", function() {
    console.log("closed");
  });

  // "open" the switch is opened
  toggleSwitch.on("open", function() {
    console.log("open");
  });
});

```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/toggle-switch.png">




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