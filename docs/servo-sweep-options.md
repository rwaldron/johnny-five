# Servo Sweep Options

Run with:
```bash
node eg/servo-sweep-options.js
```


```javascript
var five = require("johnny-five"),
  board = new five.Board();

board.on("ready", function() {
  var servo = new five.Servo("O2");
  var lap = 0;

  servo.center();

  servo.sweep().on("sweep:full", function() {
    console.log("lap", ++lap);

    if (lap === 1) {
      this.sweep({
        range: [45, 135],
        step: 45
      });
    }

    if (lap === 2) {
      this.sweep({
        range: [20, 160],
        step: 20
      });
    }

    if (lap === 3) {
      this.sweep({
        range: [0, 179],
        interval: 10,
        step: 1
      });
    }

    if (lap === 5) {
      process.exit(0);
    }
  });
});

```









## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
