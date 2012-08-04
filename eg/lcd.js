var five = require("../lib/johnny-five"),
    board, lcd;

board = new five.Board();

board.on("ready", function() {

  lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [ 7, 8, 9, 10, 11, 12 ],

    // Options:
    // bitMode: 4 or 8, defaults to 4
    // lines: number of lines, defaults to 2
    // dots: matrix dimensions, defaults to "5x8"
  });

  lcd.on("ready", function() {
    // creates a heart!
    lcd.createChar( 0x07,
      [ 0x00, 0x0a, 0x1f, 0x1f, 0x0e, 0x04, 0x00, 0x00 ]
    );

    // Line 1: Hi rmurphey & hgstrp!
    lcd.clear().print("rmurphey, hgstrp");
    lcd.setCursor(0, 1);

    // Line 2: I <3 johnny-five
    lcd.print("I ").write(7).print(" johnny-five");


    // In 4 seconds, show the "useChar" functionality
    board.wait( 2000, function() {
      /*
        Predefined characters:

        bell, note, clock, heart, duck,
        check, cross, retarrow
      */

      lcd.useChar("clock");
      lcd.useChar("check");
      lcd.useChar("duck");


      lcd.clear().print("Clock :clock:! :duck:");

      setTimeout(function() {
        lcd.setCursor(0, 1);
        lcd.print("Check :check: & :clock:!");
      }, 0);
    });
  });

  this.repl.inject({
    lcd: lcd
  });

});
