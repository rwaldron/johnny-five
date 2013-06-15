# Board Multi

Run with:
```bash
node eg/board-multi.js
```


```javascript
var five = require("johnny-five");

new five.Boards([ "a", "b" ]).on("ready", function(boards) {
  this.each(function(board) {
    new five.Led({ pin: 13, board: board }).strobe();
  });
});

```

## Breadboard/Illustration





## Devices




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
