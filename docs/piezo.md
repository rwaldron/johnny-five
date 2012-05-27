# Piezo

```javascript
var five = require("johnny-five"),
    board, piezo;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  // Create a new `piezo` hardware instance.
  piezo = new five.Piezo(3);

  // Inject the `piezo` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    piezo: piezo
  });


  // piezo.note( volume, duration );
  piezo.tone( 20, 500 );

  piezo.fade( 0, 20 );

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
