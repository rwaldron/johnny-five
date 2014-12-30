var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {

  // Plug the Temperature sensor module
  // into the Grove Shield's A0 jack
  var temperature = new five.Temperature({
    controller: "GROVE",
    pin: "A0"
  });

  // Plug the LCD module into any of the
  // Grove Shield's I2C jacks.
  var lcd = new five.LCD({
    controller: "JHD1313M1"
  });

  temperature.on("data", function() {

    // The LCD's background will change
    // color according to the temperature.
    //
    // Experiment with sources of hot and
    // cold temperatures!
    //
    var f = temperature.fahrenheit;
    var r = linear(0x00, 0xFF, f, 100);
    var g = linear(0x00, 0x00, f, 100);
    var b = linear(0xFF, 0x00, f, 100);

    console.log("temp: ", f);

    lcd.bgColor(r, g, b).cursor(0, 0).print(f.toFixed(2));
  });
});

// [Linear Interpolation](https://en.wikipedia.org/wiki/Linear_interpolation)
function linear(start, end, step, steps) {
  return (end - start) * step / steps + start;
}

// @markdown
// For this program, you'll need:
//
// ![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
//
// ![Grove - LCD RGB w/ Backlight](http://www.seeedstudio.com/wiki/images/0/03/Serial_LEC_RGB_Backlight_Lcd.jpg)
//
// ![Grove - Temperature Module](http://www.seeedstudio.com/depot/images/product/bgtemp1.jpg)
//
//
// @markdown
