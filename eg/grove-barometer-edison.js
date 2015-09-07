var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the BMP180 Barometer module
  // into an I2C jack
  var barometer = new five.Barometer({
    controller: "BMP180"
  });

  barometer.on("change", function() {
    console.log("barometer");
    console.log("  pressure     : ", this.pressure);
    console.log("--------------------------------------");
  });
});
// @markdown
// For this program, you'll need:
//
// ![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)
//
// ![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
//
// ![Grove - Barometer Sensor (BMP180)](http://www.seeedstudio.com/depot/images/product/Grove%20Barometer%20Sensor%20BMP180.jpg)
//
// - [Grove - Barometer Sensor (BMP180)](http://www.seeedstudio.com/depot/Grove-Barometer-Sensor-BMP180-p-1840.html)
//
// @markdown
