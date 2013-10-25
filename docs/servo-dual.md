# Servo Dual

Run with:
```bash
node eg/servo-dual.js
```


```javascript
var five = require("johnny-five"),
    board, servos;

board = new five.Board();

board.on("ready", function() {

  servos = {
    claw: five.Servo({
      pin: 9,
      range: [ 0, 170 ]
    }),
    arm: five.Servo(10)
  };

  // Inject the `servo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    s: servos
  });

  servos.claw.min();

  this.wait( 1000, function() {
    servos.claw.sweep();
  });
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
