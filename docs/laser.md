# Laser

Run with:
```bash
node eg/laser.js
```


```javascript
var five = require("johnny-five"),
  board, laser;

board = new five.Board();

board.on("ready", function() {

  laser = new five.Led(9);

  board.repl.inject({
    laser: laser
  });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
