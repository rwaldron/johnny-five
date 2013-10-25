# Led On Off

Run with:
```bash
node eg/led-on-off.js
```


```javascript
var five = require("johnny-five"),
    board, led;

board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = new five.Led({
    pin: 13
  });

  // "on" turns the led _on_
  led.on();

  // "off" turns the led _off_
  led.off();

  // Turn the led back on after 3 seconds (shown in ms)
  this.wait( 3000, function() {

    led.on();

  });
});

```


## Breadboard/Illustration


![docs/breadboard/led-on-off.png](breadboard/led-on-off.png)
[docs/breadboard/led-on-off.fzz](breadboard/led-on-off.fzz)









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
