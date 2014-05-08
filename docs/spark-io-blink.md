# Spark Io Blink

Run with:
```bash
node eg/spark-io-blink.js
```


```javascript
var five = require("johnny-five");
var Spark = require("spark-io");

var board = new five.Board({
  io: new Spark({
    token: "a81cf99a8c1fe45b74d749d521a32671eb443d5e",
    deviceId: "53ff6f065067544840551187"
  })
});

board.on("ready", function() {
  var led = new five.Led("D7");

  led.strobe(1000);

  this.repl.inject({
    led: led
  });
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
