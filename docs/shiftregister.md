# Shiftregister

Run with:
```bash
node eg/shiftregister.js
```


```javascript
var five = require("../lib/johnny-five"),
    board, lcd;

board = new five.Board();

// This works with the 74HC595 that comes with the SparkFun Inventor's kit.
// Your mileage may vary with other chips. .fzz file to come.

board.on("ready", function() {
  shiftRegister = new five.ShiftRegister({
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  var value = 0;

  function next() {
    value = value > 0x11 ? value >> 1 : 0x88;
    shiftRegister.send( value );
    setTimeout(next, 200);
  }

  next();

});

```

## Breadboard

<img src="https://raw.github.com/rwldrn/johnny-five/master/docs/breadboard/shiftregister.png">

[shiftregister.fzz](https://github.com/rwldrn/johnny-five/blob/master/docs/breadboard/shiftregister.fzz)


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
