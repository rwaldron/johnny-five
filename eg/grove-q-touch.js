var argv = require("minimist")(process.argv.slice(2), {
  default: {
    show: 1
  }
});
var five = require("../lib/johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
  io: new Edison()
});

board.on("ready", function() {
  // QTOUCH Capacitive Touch Shield
  var keypad;

  if (argv.show === 1) {
    keypad = new five.Keypad({
      controller: "QTOUCH"
    });
  }

  if (argv.show === 2) {
    keypad = new five.Keypad({
      controller: "QTOUCH",
      keys: [
        ["1", "2", "3"]
      ]
    });
  }

  if (argv.show === 3) {
    keypad = new five.Keypad({
      controller: "QTOUCH",
      keys: ["1", "2", "3"]
    });
  }

  ["change", "press", "hold", "release"].forEach(function(eventType) {
    keypad.on(eventType, function(data) {
      console.log("Event: %s, Target: %s", eventType, data.which);
    });
  });
});

/* @markdown
For this program, you'll need:

![Intel Edison Arduino Breakout](https://cdn.sparkfun.com//assets/parts/1/0/1/3/9/13097-06.jpg)

![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)

[![Grove - Q Touch Sensor](http://www.seeedstudio.com/depot/images/product/Grove-Q%20Touch%20Sensor_02.jpg)](http://www.seeedstudio.com/depot/GroveQ-Touch-Sensor-p-1854.html)


@markdown */
