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
    token: process.env.SPARK_TOKEN,
    deviceId: process.env.SPARK_DEVICE_ID
  })
});

board.on("ready", function() {
  var pin = "A7";
  var led = new five.Led(pin);

  led.strobe(500);

  // this.repl.inject({
  //   led: led
  // });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
