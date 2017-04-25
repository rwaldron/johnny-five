var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Plug the LED module into the
  // Grove Shield's D6 jack.
  //
  // Select an LED from the kit
  // (red, green, blue) and insert
  // it into the LED module, with
  // the long pin in + and short
  // pin in -.
  var led = new five.Led(6);

  // This will blink the LED over
  // 500ms periods.
  led.blink(500);
});

/* @markdown
For this program, you'll need:

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

![Grove - LED Module](http://www.seeedstudio.com/depot/images/product/Red%20LED.jpg)

@markdown */
