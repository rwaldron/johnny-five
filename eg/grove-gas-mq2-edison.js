var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the MQ2 Gas (Combustible Gas/Smoke)
  // module into the Grove Shield's A0 jack
  var gas = new five.Sensor("A0");

  // Plug the Piezo module into the
  // Grove Shield's D6 jack.
  var alarm = new five.Piezo(6);

  gas.scale(0, 100).on("change", function() {
    if (this.value > 60) {
      if (!alarm.isPlaying) {
        alarm.frequency(five.Piezo.Notes.d5, 5000);
      }
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
// ![Grove - Buzzer Module](http://www.seeedstudio.com/depot/images/107020000%201.jpg)
//
// ![Grove - Gas Module](http://www.seeedstudio.com/depot/images/product/Gas%20Sensor%20MQ.jpg)
//
// @markdown
