<!--remove-start-->

# LED - Draw Matrix Characters Demo

<!--remove-end-->


Demonstrates draw() on Matrix display.





##### LED Matrix breadboard - Arduino Uno



![docs/breadboard/led-matrix.png](breadboard/led-matrix.png)<br>

Fritzing diagram: [docs/breadboard/led-matrix.fzz](breadboard/led-matrix.fzz)

&nbsp;




Run this example from the command line with:
```bash
node eg/led-chars-demo.js
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

  // type `draw("shape_name")` into the repl to see the shape!  
  this.repl.inject({
    matrix: matrix,
    draw: function(shape) {
      matrix.draw(five.Led.Matrix.CHARS[shape]);
    }
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
