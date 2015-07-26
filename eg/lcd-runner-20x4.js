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

  var frame = 1;
  var col = 0;
  var row = 0;

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

// @markdown
// - [16 x 2 LCD White on Blue](http://www.hacktronics.com/LCDs/16-x-2-LCD-White-on-Blue/flypage.tpl.html)
// - [20 x 4 LCD White on Blue](http://www.hacktronics.com/LCDs/20-x-4-LCD-White-on-Blue/flypage.tpl.html)
// @markdown
