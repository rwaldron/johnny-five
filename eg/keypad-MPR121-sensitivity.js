var argv = require("minimist")(process.argv.slice(2), { default: { show: 1 } });
var five = require("../lib/johnny-five");
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
