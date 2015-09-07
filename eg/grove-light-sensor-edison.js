var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Grove TSL2561 Light sensor module
  // into an I2C jack
  var light = new five.Light({
    controller: "TSL2561"
  });

  light.on("change", function() {
    console.log("Ambient Light Level: ", this.level);
  });
});
// @markdown
// For this program, you'll need:
//
// ![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)
//
// ![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
//
// ![Grove - Digital Light Sensor](http://www.seeedstudio.com/depot/images/101020030%201.jpg)
//
// - [Grove - Digital Light Sensor](http://www.seeedstudio.com/depot/Grove-Digital-Light-Sensor-p-1281.html)
//
// @markdown
