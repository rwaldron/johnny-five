<!--remove-start-->

# REPL

<!--remove-end-->






##### LED on pin 13 (Arduino UNO)


LED inserted directly into pin 13


![docs/breadboard/led-13.png](breadboard/led-13.png)<br>

Fritzing diagram: [docs/breadboard/led-13.fzz](breadboard/led-13.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/repl.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  console.log("Ready event. Repl instance auto-initialized!");

  var led = new five.Led(13);

  this.repl.inject({
    // Allow limited on/off control access to the
    // Led instance from the REPL.
    on: function() {
      led.on();
    },
    off: function() {
      led.off();
    }
  });
});



```








## Additional Notes
This script will make `on()` and `off()` functions
available in the REPL:
```js
>> on()  // will turn on the LED
or
>> off() // will turn off the LED
```

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
