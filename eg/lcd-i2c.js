var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  var lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  lcd.useChar("heart");

  lcd.cursor(0, 0).print("hello :heart:");

  lcd.blink();

  lcd.cursor(1, 0).print("Blinking? ");
});


// @markdown
// [Grove - LCD RGB w/ Backlight](http://www.seeedstudio.com/depot/grove-lcd-rgb-backlight-p-1643.html)
// ![Grove LCD RGB](http://www.seeedstudio.com/wiki/images/0/03/Serial_LEC_RGB_Backlight_Lcd.jpg)
// @markdown
