# Tinkerkit Gyroscope

Run with:
```bash
node eg/tinkerkit-gyroscope.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // Create a new `Gyro` hardware instance.

  var gyro = new five.Gyro({
    pins: ["I0", "I1"],
    sensitivity: 0.67
  });

  gyro.on("change", function() {
    console.log("X raw: %d rate: %d", this.x, this.rate.x);
    console.log("Y raw: %d rate: %d", this.y, this.rate.y);
  });
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
