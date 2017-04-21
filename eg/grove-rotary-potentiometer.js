var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Plug the Rotary Angle sensor module
  // into the Grove Shield's A0 jack
  var rotary = new five.Sensor("A0");

  // Plug the LED module into the
  // Grove Shield's D6 jack. See
  // grove-led.js for more information.
  var led = new five.Led(6);

  // Set scaling of the Rotary angle
  // sensor's output to 0-255 (8-bit)
  // range. Set the LED's brightness
  // based on the value of the sensor.
  rotary.scale(0, 255).on("change", function() {
    led.brightness(this.value);
  });
});

/* @markdown
For this program, you'll need:

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

![Grove - LED Module](http://www.seeedstudio.com/depot/images/product/Red%20LED_02.jpg)

![Grove - Rotary Angle Sensor](http://www.seeedstudio.com/depot/images/product/GroveRotaryP.jpg)

@markdown */
