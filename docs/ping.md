# Ping

```javascript
var five = require("johnny-five"),
    board, ping;

board = five.Board();

board.on("ready", function() {

  // Create a new `ping` hardware instance.
  ping = five.Ping({
    pin: 7
  });

  // Inject the `ping` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    ping: ping
  });

  // ping Event API

  // "read" get the current reading from the ping
  ping.on("read", function( value ) {
    console.log( "read", value );
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
