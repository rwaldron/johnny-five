<!--remove-start-->

# Keypad - MPR121, Sensitivity

<!--remove-end-->










![docs/breadboard/keypad-MPR121.png](breadboard/keypad-MPR121.png)<br>

&nbsp;




Run this example from the command line with:
```bash
node eg/keypad-MPR121-sensitivity.js
```


```javascript
var argv = require("minimist")(process.argv.slice(2), { default: { show: 1 } });
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // MPR121 3x4 Capacitive Touch Pad
  // Demonstrates increasing the sensitivity
  // deviation for touch and release.
  var keypad;

  if (argv.show === 1) {
    keypad = new five.Keypad({
      controller: "MPR121",
      sensitivity: {
        press: 0.10,
        release: 0.05,
      },
    });
  }

  if (argv.show === 2) {
    keypad = new five.Keypad({
      controller: "MPR121",
      sensitivity: {
        press: 0.10,
        release: 0.05,
      },
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&", "-", "+"],
        ["_", "=", ":"]
      ]
    });
  }

  if (argv.show === 3) {
    keypad = new five.Keypad({
      controller: "MPR121",
      sensitivity: {
        press: 0.10,
        release: 0.05,
      },
      keys: ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"]
    });
  }

  ["change", "press", "hold", "release"].forEach(function(eventType) {
    keypad.on(eventType, function(data) {
      console.log("Event: %s, Target: %s", eventType, data.which);
    });
  });
});

```








&nbsp;

<!--remove-start-->

## License
Copyright (c) 2012, 2013, 2014 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
Copyright (c) 2016 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
