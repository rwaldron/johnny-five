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
  console.log( "Ready event. Repl instance auto-initialized" );

  this.repl.inject({
    test: "foo"
  });
});

```


## Breadboard/Illustration


![docs/breadboard/repl.png](breadboard/repl.png)









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
