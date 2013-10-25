# Led Fade

Run with:
```bash
node eg/led-fade.js
```


```javascript
var five = require("johnny-five"),
    board, led;

board = new five.Board();

board.on("ready", function() {

  // Create a standard `led` hardware instance
  led = new five.Led(9);

  // pinMode is set to OUTPUT by default

  // Inject the `led` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    led: led
  });

  // "fade" to the value, 0-255, in the given time.
  // Defaults to 1000ms
  // pinMode will be changed to PWM automatically
  //
  // led.fade( 255, 3000 );


  led.fadeIn();


  // Toggle the led after 10 seconds (shown in ms)
  this.wait( 5000, function() {

    led.fadeOut();

  });
});

```


## Breadboard/Illustration


![docs/breadboard/led-fade.png](breadboard/led-fade.png)
[docs/breadboard/led-fade.fzz](breadboard/led-fade.fzz)









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
