var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Moisture module into the
  // Grove Shield's A0 jack
  var vibration = new five.Sensor("A0");

  // Plug the LED module into the
  // Grove Shield's D6 jack.
  var led = new five.LED(6);

  vibration.scale(0, 1).on("change", function() {
    if (Math.round(this.value)) {
      if (!led.isOn) {
        // Turn on the security lights
        led.on();
      }
    } else {
      led.off();
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
// ![Grove - Piezo Vibration Module](http://www.seeedstudio.com/depot/images/product/Piezo%20Vibration%20Sensor.jpg)
//
// ![Grove - LED Module](http://www.seeedstudio.com/depot/images/product/Red%20LED.jpg)
//
//
// @markdown
