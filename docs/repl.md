# Repl

Run with:
```bash
node eg/repl.js
```


```javascript
var five = require("johnny-five"),
  board;

board = new five.Board();

board.on("ready", function() {
  console.log("Ready event. Repl instance auto-initialized");

  this.repl.inject({
    test: "foo"
  });
});

```


## Breadboard/Illustration


![docs/breadboard/repl.png](breadboard/repl.png)





## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
