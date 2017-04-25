var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Rotary Angle sensor module
  // into the Grove Shield's A0 jack
  var rotary = new five.Sensor("A0");

  // Plug the LCD module into any of the
  // Grove Shield's I2C jacks.
  var lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  // Set scaling of the Rotary angle
  // sensor's output to 0-255 (8-bit)
  // range. Set the LCD's background
  // color to a RGB value between
  // Red and Violet based on the
  // value of the rotary sensor.
  rotary.scale(0, 255).on("change", function() {
    var r = linear(0xFF, 0x4B, this.value, 0xFF);
    var g = linear(0x00, 0x00, this.value, 0xFF);
    var b = linear(0x00, 0x82, this.value, 0xFF);

    lcd.bgColor(r, g, b);
  });
});

// [Linear Interpolation](https://en.wikipedia.org/wiki/Linear_interpolation)
function linear(start, end, step, steps) {
  return (end - start) * step / steps + start;
}


/* @markdown
For this program, you'll need:

![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

![Grove - LCD RGB w/ Backlight](http://www.seeedstudio.com/wiki/images/0/03/Serial_LEC_RGB_Backlight_Lcd.jpg)

![Grove - Rotary Angle Sensor](http://www.seeedstudio.com/depot/images/product/GroveRotaryP.jpg)

@markdown */
