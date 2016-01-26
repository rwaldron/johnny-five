<!--remove-start-->

# LCD - I2C Runner

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/lcd-i2c-runner.js
```


```javascript
var colors = require("../eg/color-list");
var five = require("../");
var board = new five.Board();

board.on("ready", function() {
  var clist = Object.keys(colors);
  var clength = clist.length;
  var lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  var frame = 1;
  var col = 0;
  var row = 0;

  lcd.useChar("runninga");
  lcd.useChar("runningb");

  this.loop(300, function() {

    lcd.clear().cursor(row, col).print(
      ":running" + ((frame ^= 1) === 0 ? "a" : "b") + ":"
    );

    if (++col === lcd.cols) {
      col = 0;

      if (++row === lcd.rows) {
        row = 0;
      }
    }
  });

  this.loop(1000, function() {
    lcd.bgColor(clist[Math.floor(Math.random() * clength)]);
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
