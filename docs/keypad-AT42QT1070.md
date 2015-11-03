<!--remove-start-->

# Keypad - Atmel AT42QT1070 (Q Touch)

<!--remove-end-->








Run with:
```bash
node eg/keypad-AT42QT1070.js
```


```javascript
var argv = require("minimist")(process.argv.slice(2), { default: { show: 1 } });
var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // AT42QT1070 Capacitive Touch Shield
  // Same as QTOUCH
  var keypad;

  if (argv.show === 1) {
    keypad = new five.Keypad({
      controller: "AT42QT1070"
    });
  }

  if (argv.show === 2) {
    keypad = new five.Keypad({
      controller: "AT42QT1070",
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&"],
      ]
    });
  }

  if (argv.show === 3) {
    keypad = new five.Keypad({
      controller: "AT42QT1070",
      keys: ["!", "@", "#", "$", "%", "^", "&"]
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
