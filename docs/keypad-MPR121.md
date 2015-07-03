<!--remove-start-->

# Keypad - MPR121

<!--remove-end-->






##### Breadboard for "Keypad - MPR121"



![docs/breadboard/keypad-MPR121.png](breadboard/keypad-MPR121.png)<br>

&nbsp;




Run with:
```bash
node eg/keypad-MPR121.js
```


```javascript
var argv = require("minimist")(process.argv.slice(2), { default: { show: 1 } });
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // MPR121 3x4 Capacitive Touch Pad
  var keypad;

  if (argv.show === 1) {
    keypad = new five.Keypad({
      controller: "MPR121"
    });
  }

  if (argv.show === 2) {
    keypad = new five.Keypad({
      controller: "MPR121",
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
Copyright (c) 2014, 2015 The Johnny-Five Contributors
Licensed under the MIT license.

<!--remove-end-->
