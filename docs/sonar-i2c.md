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









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
