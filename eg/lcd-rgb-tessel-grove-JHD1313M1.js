// Johnny Five version 2 is not supported on the Tessel 2.
// For using Johnny Five on the Tessel 2, stick with version 1 of Johnny Five.

var five = require("../lib/johnny-five");
var Tessel = require("tessel-io");
var board = new five.Board({
  io: new Tessel()
});

board.on("ready", function() {

  var lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  lcd.bgColor("#ff0000");
  lcd.cursor(0, 0).print("Hello");
  lcd.cursor(1, 0).print("World!");
});
