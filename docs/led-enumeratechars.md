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

  const shapes = Object.keys(Led.Matrix.CHARS);
  const enumerate = () => {
    let i = 0;
    board.loop(500, () => {
      if (i < shapes.length) {
        matrix.draw(Led.Matrix.CHARS[shapes[i]]);
        i++;
      }
    });
  };

  enumerate();

  this.repl.inject({
    matrix,
    enumerate
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
