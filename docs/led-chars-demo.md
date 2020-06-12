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
const { Board, Led } = require("johnny-five");
const board = new Board();

board.on("ready", () => {

  const matrix = new Led.Matrix({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    }
  });

  matrix.on();

  // type `draw("shape_name")` into the repl to see the shape!
  board.repl.inject({
    matrix,
    draw(shape) {
      matrix.draw(Led.Matrix.CHARS[shape]);
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
