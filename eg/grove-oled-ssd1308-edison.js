var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});
var Oled = require("oled-js");

board.on("ready", function() {

  // Plug the OLED Display module into the
  // Grove Shield's I2C jack
  var opts = {
    width: 128,
    height: 64,
    address: 0x3D
  };

  var oled = new Oled(board, five, opts);

  // Check out the Oled.js API!
  // https://github.com/noopkat/oled-js#available-methods
});
// @markdown
// For this program, you'll need:
//
// ![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)
//
// ![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
//
// ![Grove - OLED Display 1.12"](http://www.seeedstudio.com/depot/images/product/toleddisplay12864.jpg)
//
//  - [Grove - OLED Display 1.12"](http://www.seeedstudio.com/depot/Grove-OLED-Display-112-p-781.html)
//
//
// @markdown
