<!--remove-start-->

# Shift Register

<!--remove-end-->






##### Breadboard for "Shift Register"



![docs/breadboard/shift-register.png](breadboard/shift-register.png)<br>

Fritzing diagram: [docs/breadboard/shift-register.fzz](breadboard/shift-register.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/shift-register.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

// For use with 74HC595 chip

board.on("ready", function() {
  var register = new five.ShiftRegister({
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  var value = 0;

  setInterval(function() {
    value = value > 0x11 ? value >> 1 : 0x88;
    register.send(value);
  }, 200);
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2019 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
