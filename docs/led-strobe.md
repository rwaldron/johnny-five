# Led Strobe

Run with:
```bash
node eg/led-strobe.js
```


```javascript
var five = require("johnny-five"),
    board, led;

board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = new five.Led(13);

  // "strobe" the led in 100ms on-off phases
  led.strobe( 100 );
});

```

## Breadboard/Illustration

![docs/breadboard/led-strobe.png](breadboard/led-strobe.png)
[docs/breadboard/led-strobe.fzz](breadboard/led-strobe.fzz)



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
