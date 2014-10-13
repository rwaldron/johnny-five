# I2C HT16K33 Led Matrix

Run with:
```bash
node eg/led-matrix-HT16K33.js
```


```javascript
var five = require("../lib/johnny-five");
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
    controller: "HT16K33",
    isBicolor: true
  });

  matrix.clear();

  var msg = "johnny-five".split("");

  function next() {
    var c;

    if (c = msg.shift()) {
      matrix.draw(c);
      setTimeout(next, 500);
    }
  }

  next();

  this.repl.inject({
    matrix: matrix,
    heart: function() {
      matrix.draw(heart);
    }
  });
});

```


## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
