# Tinkerkit Gyroscope

Run with:
```bash
node eg/tinkerkit-gyroscope.js
```


```javascript
var five = require("./lib/johnny-five.js"),
  board, gyro;

board = new five.Board();

board.on("ready", function() {
  var collection = [];
  // Create a new `Gyroscope` hardware instance.

  gyro = new five.Gyroscope({
    pins: [ "I0", "I1" ],
    freq: 200,
    extent: 4
  });

  gyro.on("acceleration", function( err, data ) {
    console.log(data.position);
  });
});
```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
