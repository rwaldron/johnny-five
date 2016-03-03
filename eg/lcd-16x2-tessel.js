var five = require("../lib/johnny-five");
var Tessel = require("tessel-io");
var board = new five.Board({
  io: new Tessel()
});

board.on("ready", function() {
  var lcd = new five.LCD({
    // LCD pin:
    //      RS    EN    D4    D5    D6    D7
    pins: ["a2", "a3", "a4", "a5", "a6", "a7"],
  });

  lcd.cursor(0, 0).print("10".repeat(8));
  lcd.cursor(1, 0).print("01".repeat(8));
});
