<!--remove-start-->

# Touchpad - Grove QTouch

<!--remove-end-->








Run this example from the command line with:
```bash
node eg/keypad-QTOUCH.js
```


```javascript
var argv = require("minimist")(process.argv.slice(2), {
  default: {
    show: 1
  }
});
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // AT42QT1070 Capacitive Touch Shield
  // Same as QTOUCH
  var touchpad;

  if (argv.show === 1) {
    touchpad = new five.Touchpad({
      controller: "QTOUCH", // or "AT42QT1070"
    });
  }

  if (argv.show === 2) {
    touchpad = new five.Touchpad({
      controller: "QTOUCH", // or "AT42QT1070",
      keys: [
        ["1", "2", "3"]
      ]
    });
  }

  if (argv.show === 3) {
    touchpad = new five.Touchpad({
      controller: "QTOUCH", // or "AT42QT1070",
      keys: ["1", "2", "3"]
    });
  }

  ["change", "press", "hold", "release"].forEach(function(eventType) {
    touchpad.on(eventType, function(event) {
      console.log("Event: %s, Target: %s", eventType, event.which);
    });
  });
});



```








## Additional Notes
For this program, you'll need:
![Grove Base Shield v2](http://www.seeedstudio.com/depot/images/product/base%20shield%20V2_01.jpg)
[![Grove - Q Touch Sensor](http://www.seeedstudio.com/depot/images/product/Grove-Q%20Touch%20Sensor_02.jpg)](http://www.seeedstudio.com/depot/GroveQ-Touch-Sensor-p-1854.html)

&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012-2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2015-2020 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
