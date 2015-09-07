var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Joystick module into the
  // Grove Shield's A0 jack. Use
  // the Joystick class to control.
  var joystick = new five.Joystick([ "A0", "A1" ]);

  // Observe change events from the Joystick!
  joystick.on("change", function() {
    console.log("Joystick");
    console.log("  x : ", this.x);
    console.log("  y : ", this.y);
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
// ![Grove - Joystick Module](http://www.seeedstudio.com/depot/images/product/bgjoy1.jpg)
//
// ![Grove - Touch Module](http://www.seeedstudio.com/wiki/images/0/01/Grove_-_touch_sensor_Photo.jpg)
//
// @markdown
