# Lcd Runner 20x4

Run with:
```bash
node eg/lcd-runner-20x4.js
```


```javascript
var five = require("../lib/johnny-five"),
  board, lcd;

board = new five.Board();

board.on("ready", function() {

  lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [7, 8, 9, 10, 11, 12],
    rows: 4,
    cols: 20
  });

  lcd.on("ready", function() {

    var frame = 1,
      col = 0,
      row = 0;

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
});


```





- [16 x 2 LCD White on Blue](http://www.hacktronics.com/LCDs/16-x-2-LCD-White-on-Blue/flypage.tpl.html)
- [20 x 4 LCD White on Blue](http://www.hacktronics.com/LCDs/20-x-4-LCD-White-on-Blue/flypage.tpl.html)



## License
Copyright (c) 2012-2013 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014 The Johnny-Five Contributors
Licensed under the MIT license.
