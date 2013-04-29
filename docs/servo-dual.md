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


  // Log moves to repl
  // Object.keys( servos ).forEach(function( which ) {
  //   servos[ which ].on("move", function( err, degrees ) {
  //     console.log( which + " moved to " + degrees + "°. Range: ", servos[ which ].range.toString()  );
  //   });
  // });

  servos.claw.min();

  this.wait( 1000, function() {
    servos.claw.sweep();
  });
});

```

## Breadboard/Illustration





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
