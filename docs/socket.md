# Socket

Run with:
```bash
node eg/socket.js
```


```javascript
var five = require("johnny-five"),
    socket = require("socket.io"),
    io;

io = socket.listen(8000);
io.set("log level", 1);

// Create a new board instance
(new five.Board()).on("ready", function() {

  // initialize the potentiometer with a new
  // sensor instance
  var pot = new five.Sensor("A0");

  // Scale the potentiometer's output to fall
  // within a range of 0-100
  pot.scale([ 0, 100 ]).on("read", function() {
    io.sockets.emit("message", this.value);
  });
});

```

## Breadboard




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
