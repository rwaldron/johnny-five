<!--remove-start-->

# Shift Register - Common Anode Seven segments, Chained

<!--remove-end-->






##### Breadboard for "Shift Register - Common Anode Seven segments, Chained"



![docs/breadboard/shift-register-daisy-chain-anode.png](breadboard/shift-register-daisy-chain-anode.png)<br>

Fritzing diagram: [docs/breadboard/shift-register-daisy-chain-anode.fzz](breadboard/shift-register-daisy-chain-anode.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/shift-register-daisy-chain-anode.js
```


```javascript
var five = require("johnny-five");
var async = require("async");
var _ = require("lodash");
var board = new five.Board();

board.on("ready", function() {

  /**
   * While we may have multiple ShiftRegisters,
   * we only need one to control them both.
   */
  var register = new five.ShiftRegister({
    isAnode: true,
    size: 2,
    pins: {
      data: 2,
      clock: 3,
      latch: 4,
      reset: 9,
    }
  });

  /**
   * Pressing this button will trigger the die roll.
   */
  var button = new five.Button(8);

  /**
   * Sends a random number to the shift register.
   */
  function randomNumber() {
    register.clear();
    return register.display(Math.round(Math.random() * 20));
  }

  /**
   * This is an array of delays in ms.  When a button is pressed,
   * we'll iterate over this array and display a random number after the
   * delay.  This simulates a die bouncing on a table.
   */
  var delays = new Array(10).fill(16)
    .concat(new Array(8).fill(32))
    .concat(new Array(6).fill(64))
    .concat(new Array(4).fill(128))
    .concat(new Array(2).fill(256))
    .concat(512);

  register.reset();
  register.clear();

  button.on("press", function() {
    console.log("Rolling...");
    register.clear();
    async.eachSeries(delays, function(delay, done) {
      randomNumber();
      setTimeout(function() {
        register.clear();
        done();
      }, delay);
    }, randomNumber);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2017 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
