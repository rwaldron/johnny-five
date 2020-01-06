<!--remove-start-->

# LED - Matrix

<!--remove-end-->






##### Breadboard for "LED - Matrix"



![docs/breadboard/led-matrix.png](breadboard/led-matrix.png)<br>

Fritzing diagram: [docs/breadboard/led-matrix.fzz](breadboard/led-matrix.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-matrix.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var heart = [
    "01100110",
    "10011001",
    "10000001",
    "10000001",
    "01000010",
    "00100100",
    "00011000",
    "00000000"
  ];

  var matrix = new five.Led.Matrix({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    }
  });

  matrix.on();

  var msg = "johnny-five".split("");

  // Display each letter for 1 second
  function next() {
    var c;

    if (c = msg.shift()) {
      matrix.draw(c);
      setTimeout(next, 1000);
    }
  }

  next();

  this.repl.inject({
    matrix: matrix,
    // Type "heart()" in the REPL to
    // display a heart!
    heart: function() {
      matrix.draw(heart);
    }
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
