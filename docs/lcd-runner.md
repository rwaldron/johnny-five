# Lcd Runner

Run with:
```bash
node eg/lcd-runner.js
```


```javascript
var five = require("../lib/johnny-five"),
    board, lcd;

board = new five.Board();

board.on("ready", function() {

  lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [ 7, 8, 9, 10, 11, 12 ],
    rows: 2,
    cols: 16
  });

  lcd.on("ready", function() {

    var frame = 1, col = 0, row = 0;

    lcd.useChar("runninga");
    lcd.useChar("runningb");

    board.loop( 300, function() {

      lcd.clear().cursor( row, col ).print(
        ":running" + (++frame % 2 === 0 ? "a" : "b") + ":"
      );

      if ( ++col === lcd.cols ) {
        col = 0;

        if ( ++row === lcd.rows ) {
          row = 0;
        }
      }
    });
  });
});


// @device [16 x 2 LCD White on Blue](http://www.hacktronics.com/LCDs/16-x-2-LCD-White-on-Blue/flypage.tpl.html)
// @device [20 x 4 LCD White on Blue](http://www.hacktronics.com/LCDs/20-x-4-LCD-White-on-Blue/flypage.tpl.html)

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
