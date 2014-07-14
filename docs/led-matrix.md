# Led Matrix

Run with:
```bash
node eg/led-matrix.js
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

  var lc = new five.LedControl({
    pins: {
      data: 2,
      clock: 3,
      cs: 4
    },
    isMatrix: true
  });

  lc.on();

  var msg = "johnny-five".split("");

  function next() {
    var c;

    if (c = msg.shift()) {
      lc.draw(c);
      setTimeout(next, 500);
    }
  }

  next();

  this.repl.inject({
    lc: lc,
    heart: function() {
      lc.draw(heart);
    }
  });
});

```


## Breadboard/Illustration


![docs/breadboard/led-matrix.png](breadboard/led-matrix.png)
[docs/breadboard/led-matrix.fzz](breadboard/led-matrix.fzz)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
