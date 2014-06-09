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
  led = new five.Led(11);

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


  // Toggle the led after 5 seconds (shown in ms)
  this.wait(5000, function() {

    led.fadeOut();

  });
});

```


## Breadboard/Illustration


![docs/breadboard/led-fade.png](breadboard/led-fade.png)
[docs/breadboard/led-fade.fzz](breadboard/led-fade.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
