<!--remove-start-->

# LCD - Runner 16x2



Run with:
```bash
node eg/lcd-runner.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [8, 9, 4, 5, 6, 7],
    backlight: 10,
    rows: 2,
    cols: 16
  });

  var frame = 1,
    col = 0,
    row = 0;

  lcd.display();
  lcd.useChar("runninga");
  lcd.useChar("runningb");

  board.loop(300, function() {

    lcd.clear().cursor(row, col).print(
      ":running" + (++frame % 2 === 0 ? "a" : "b") + ":"
    );

    if (++col === lcd.cols) {
      col = 0;

      if (++row === lcd.rows) {
        row = 0;
      }
    }
  });
});


// @device [16 x 2 LCD White on Blue](http://www.hacktronics.com/LCDs/16-x-2-LCD-White-on-Blue/flypage.tpl.html)
// @device [20 x 4 LCD White on Blue](http://www.hacktronics.com/LCDs/20-x-4-LCD-White-on-Blue/flypage.tpl.html)

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
