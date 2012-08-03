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

  lcd.on('ready', function() {
    lcd.write("Hi! " + new Date().getTime());
    lcd.setCursor(0, 1);
    lcd.write("Rebecca");
  });

  this.repl.inject({
    lcd: lcd
  });

});
