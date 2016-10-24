var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [7, 8, 9, 10, 11, 12],
    rows: 4,
    cols: 20
  });

  var k = 0;
  var i = 0;
  var keys = Object.keys(five.LCD.Characters.DEFAULT);
  var length = keys.length;
  var eights = [];

  while (i < length) {
    eights.push(keys.slice(i, i + 8));
    i += 8;
  }

  console.log("Wait 5 seconds...");

  this.loop(2000, function() {
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

/* @markdown
- [16 x 2 LCD White on Blue](http://www.hacktronics.com/LCDs/16-x-2-LCD-White-on-Blue/flypage.tpl.html)
- [20 x 4 LCD White on Blue](http://www.hacktronics.com/LCDs/20-x-4-LCD-White-on-Blue/flypage.tpl.html)
@markdown */
