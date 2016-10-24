var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {

  // Plug the Flame Detector Sensor into D4
  var flame = new five.Sensor.Digital(4);

  // Plug the Piezo module into the
  // Grove Shield's D6 jack.
  var alarm = new five.Piezo(6);

  flame.on("change", function() {
    if (this.value) {
      if (!alarm.isPlaying) {
        alarm.frequency(five.Piezo.Notes.d5, 5000);
      }
    }
  });
});
/* @markdown
For this program, you'll need:

![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

![Grove - Flame Detector Sensor](http://www.seeedstudio.com/depot/images/product/Flame%20Sensor.jpg)

- [Grove - Flame Detector Sensor](http://www.seeedstudio.com/depot/Grove-Flame-Sensor-p-1450.html)

@markdown */
