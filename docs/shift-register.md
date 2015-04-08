<!--remove-start-->

# Shift Register





Run with:
```bash
node eg/shift-register.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

// This works with the 74HC595 that comes with the SparkFun Inventor's kit.
// Your mileage may vary with other chips. For more information on working
// with shift registers, see http://arduino.cc/en/Tutorial/ShiftOut

board.on("ready", function() {
  var register = new five.ShiftRegister({
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  var value = 0;

  function next() {
    value = value > 0x11 ? value >> 1 : 0x88;
    register.send(value);
    setTimeout(next, 200);
  }

  next();

});

```


## Illustrations / Photos


### Breadboard for "Shift Register"



![docs/breadboard/shift-register.png](breadboard/shift-register.png)<br>
Fritzing diagram: [docs/breadboard/shift-register.fzz](breadboard/shift-register.fzz)

&nbsp;





&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
