# Sonar I2c

Run with:
```bash
node eg/sonar-i2c.js
```


```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var sonar = new five.Sonar({
    device: "SRF10"
  });

  function display(type, value, unit) {
    console.log("%s event: object is %d %s away", type, value, unit);
  }

  sonar.on("data", function() {
    display("data", this.inches, "inches");
  });

  sonar.on("change", function() {
    display("data", this.inches, "inches");
  });
});

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
