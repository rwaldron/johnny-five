# Shiftregister

Run with:
```bash
node eg/shiftregister.js
```


```javascript
var five = require("../lib/johnny-five"),
  board, shiftRegister;

board = new five.Board();

// This works with the 74HC595 that comes with the SparkFun Inventor's kit.
// Your mileage may vary with other chips. For more information on working
// with shift registers, see http://arduino.cc/en/Tutorial/ShiftOut

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
    shiftRegister.send(value);
    setTimeout(next, 200);
  }

  next();

});

```


## Breadboard/Illustration


![docs/breadboard/shiftregister.png](breadboard/shiftregister.png)
[docs/breadboard/shiftregister.fzz](breadboard/shiftregister.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
