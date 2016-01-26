<!--remove-start-->

# Shift Register - Seven segment controller

<!--remove-end-->






##### Breadboard for "Shift Register - Seven segment controller"



![docs/breadboard/shift-register-seven-segment.png](breadboard/shift-register-seven-segment.png)<br>

Fritzing diagram: [docs/breadboard/shift-register-seven-segment.fzz](breadboard/shift-register-seven-segment.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/shift-register-seven-segment.js
```


```javascript
/**
 * This example uses a single seven-segment display (common anode) and a
 * 74HC595 shift register. See docs/breadboard/seven-segment.png for wiring.
 */
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  /*

    This assumes the segments are as follows:

       A
      ---
    F | | B
      --- <---- G
    E | | C
      ---
       D  o DP

   */

  var isCommonAnode = true;
  var digits = [
    //        .GFEDCBA
    parseInt("00111111", 2),
    parseInt("00000110", 2),
    parseInt("01011011", 2),
    parseInt("01001111", 2),
    parseInt("01100110", 2),
    parseInt("01101101", 2),
    parseInt("01111101", 2),
    parseInt("00000111", 2),
    parseInt("01111111", 2),
    parseInt("01101111", 2),
  ];

  var segments = {
    //           .GFEDCBA
    a: parseInt("00000001", 2),
    b: parseInt("00000010", 2),
    c: parseInt("00000100", 2),
    d: parseInt("00001000", 2),
    e: parseInt("00010000", 2),
    f: parseInt("00100000", 2),
    g: parseInt("01000000", 2),
    dp: parseInt("10000000", 2)
  };

  var register = new five.ShiftRegister({
    pins: {
      data: 2,
      clock: 3,
      latch: 4
    }
  });

  var led = new five.Led(5);

  function invert(num) {
    return ((~num << 24) >> 24) & 255;
  }

  function digit(num) {
    clear();

    register.send(
      isCommonAnode ? invert(digits[num]) : digits[num]
    );
  }

  function segment(s) {
    clear();

    register.send(
      isCommonAnode ? invert(segments[s]) : segments[s]
    );
  }

  function clear() {
    register.send(
      isCommonAnode ? 255 : 0
    );
  }

  var i = 9;

  function next() {
    led.stop();
    digit(i--);

    if (i < 0) {
      i = 9;
      led.strobe(50);
      setTimeout(next, 2000);
    } else {
      setTimeout(next, 1000);
    }
  }

  next();
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
