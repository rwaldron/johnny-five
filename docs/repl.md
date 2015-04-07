<!--remove-start-->
# REPL

Run with:
```bash
node eg/repl.js
```
<!--remove-end-->

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


## Breadboard/Illustration


![docs/breadboard/repl.png](breadboard/repl.png)  

This script will make `on()` and `off()` functions
available in the REPL:

```js
>> on()  // will turn on the LED
// or
>> off() // will turn off the LED
```



<!--remove-start-->
## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
<!--remove-end-->
