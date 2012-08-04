var five = require("../lib/johnny-five"),
    board, lcd;

board = new five.Board();

board.on("ready", function() {

  lcd = new five.LCD({
    // LCD pin name  RS  EN  DB4 DB5 DB6 DB7
    // Arduino pin # 7    8   9   10  11  12
    pins: [ 7, 8, 9, 10, 11, 12 ],
    bitMode: 4,
    lines: 2,
    dots: "5x8"
  });

  lcd.on("ready", function() {
    lcd.createChar( 0x07, [0x00, 0x0a, 0x1f, 0x1f, 0x0e, 0x04, 0x00, 0x00] );
    lcd.clear();
    lcd.print("Hi Rebecca!");
    lcd.setCursor(0, 1);
    lcd.print("I ");
    lcd.write(7);
    lcd.print(" johnny-five");
  });

  this.repl.inject({
    lcd: lcd
  });

});
