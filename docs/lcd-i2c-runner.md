# Lcd I2c Runner

Run with:
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

  board.loop(300, function() {

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

  board.loop(1000, function() {
    lcd.bgColor(clist[Math.floor(Math.random() * clength)]);
  });
});

```









## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.
