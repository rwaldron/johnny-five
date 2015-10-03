<!--remove-start-->

# LCD - Enumerate characters



Run with:
```bash
node eg/lcd-enumeratechars.js
```

<!--remove-end-->

```javascript
var five = require("johnny-five"),
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
    var k, i, length, keys, eights;

    k = 0;
    i = 0;

    keys = Object.keys(five.LCD.Characters);
    length = keys.length;
    eights = [];

    while (i < length) {
      eights.push(keys.slice(i, i + 8));
      i += 8;
    }

    console.log("Wait 5 seconds...");

    board.loop(2000, function() {
      var charset = eights[k],
        display = "";

      lcd.clear();

      if (k < eights.length) {

        charset.forEach(function(char, index) {
          lcd.useChar(char);
          display += ":" + char + ":";
        });

        lcd.clear().cursor(0, 0).print(display);

        k++;
      }
    });
  });
});


```








## Additional Notes
- [16 x 2 LCD White on Blue](http://www.hacktronics.com/LCDs/16-x-2-LCD-White-on-Blue/flypage.tpl.html)
- [20 x 4 LCD White on Blue](http://www.hacktronics.com/LCDs/20-x-4-LCD-White-on-Blue/flypage.tpl.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
