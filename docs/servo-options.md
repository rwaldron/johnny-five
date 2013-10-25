# Servo Options

Run with:
```bash
node eg/servo-options.js
```


```javascript
var five = require("johnny-five"),
    board, servo;

board = new five.Board();

board.on("ready", function() {
  servo = new five.Servo({
    pin: 10,
    range: [ 0, 180 ], // Default: 0-180
    type: "standard", // Default: "standard". Use "continuous" for continuous rotation servos
    startAt: 90, // if you would like the servo to immediately move to a degree
    center: false // overrides startAt if true and moves the servo to the center of the range
  });

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    servo: servo
  });

});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
