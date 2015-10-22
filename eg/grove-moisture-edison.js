var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Moisture module into the
  // Grove Shield's A0 jack
  var moisture = new five.Sensor("A0");

  // Plug the Relay module into the
  // Grove Shield's D6 jack.
  var relay = new five.Relay(6);

  moisture.scale(0, 100).on("change", function() {
    // 0 - Dry
    // 50 - Wet
    if (this.value < 20) {
      if (!relay.isOn) {
        // Turn on the water pump!
        relay.on();
      }
    } else {
      relay.off();
    }
  });
});
// @markdown
// For this program, you'll need:
//
// ![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)
//
// ![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
//
// ![Grove - Moisture Module](http://www.seeedstudio.com/depot/images/101020008%201.jpg)
//
// ![Grove - Relay Module](http://www.seeedstudio.com/depot/images/1030200051.jpg)
//
// @markdown
