var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Plug the Touch module into the
  // Grove Shield's D4 jack. Use
  // the Button class to control.
  var touch = new five.Button(4);

  // Plug the LED module into the
  // Grove Shield's D6 jack. See
  // grove-led.js for more information.
  var led = new five.Led(6);

  // The following will turn the Led
  // on and off as the touch is
  // pressed and released.
  touch.on("press", function() {
    led.on();
  });

  touch.on("release", function() {
    led.off();
  });
});

// @markdown
// For this program, you'll need:
//
// ![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
//
// ![Grove - LED Module](http://www.seeedstudio.com/depot/images/product/Red%20LED_02.jpg)
//
// ![Grove - Touch Module](http://www.seeedstudio.com/wiki/images/0/01/Grove_-_touch_sensor_Photo.jpg)
//
// @markdown
