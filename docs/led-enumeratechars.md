<!--remove-start-->

# LED - Enumerate Matrix Characters & Symbols

<!--remove-end-->


Loop through available characters & symbols to see what they look like on a Matrix display.





##### LED Matrix breadboard - Arduino Uno



![docs/breadboard/led-matrix.png](breadboard/led-matrix.png)<br>

Fritzing diagram: [docs/breadboard/led-matrix.fzz](breadboard/led-matrix.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-enumeratechars.js
```


```javascript
var five = require("johnny-five");

var board = new five.Board();

board.on("ready", function() {

  var matrix = new five.Led.Matrix({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    }
  });

  matrix.on();

  var shapes = Object.keys(five.Led.Matrix.CHARS);

  var enumerate = function() {
    var i = 0;
    board.loop(500, function() {
      if (i < shapes.length) {
        matrix.draw(five.Led.Matrix.CHARS[shapes[i]]);
        i++;
      }
    });
  };

  enumerate();

  this.repl.inject({
    matrix: matrix,
    enumerate: enumerate
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2018 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
