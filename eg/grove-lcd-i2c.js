var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Plug the LCD module into any of the
  // Grove Shield's I2C jacks.
  var lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  lcd.useChar("heart");

  lcd.cursor(0, 0).print("hello :heart:");

  lcd.blink().cursor(1, 0).print("Blinking? ");
});
// @markdown
// For this program, you'll need:
//
// ![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
//
// ![Grove - LCD RGB w/ Backlight](http://www.seeedstudio.com/wiki/images/0/03/Serial_LEC_RGB_Backlight_Lcd.jpg)
//
// @markdown
