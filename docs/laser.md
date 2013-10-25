# Laser

Run with:
```bash
node eg/laser.js
```


```javascript
var five = require("johnny-five"),
    board, laser;

board = new five.Board();

board.on("ready", function() {

  laser = new five.Led(9);

  board.repl.inject({
    laser: laser
  });
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
