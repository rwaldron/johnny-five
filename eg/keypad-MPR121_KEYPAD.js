var argv = require("minimist")(process.argv.slice(2), {
  default: {
    show: 1
  }
});
var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var touchpad;

  if (argv.show === 1) {
    touchpad = new five.Touchpad({
      controller: "MPR121_KEYPAD"
    });
  }

  if (argv.show === 2) {
    touchpad = new five.Touchpad({
      controller: "MPR121_KEYPAD",
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&", "-", "+"],
        ["_", "=", ":"]
      ]
    });
  }

  if (argv.show === 3) {
    touchpad = new five.Touchpad({
      controller: "MPR121_KEYPAD",
      keys: ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"]
    });
  }

  ["change", "press", "hold", "release"].forEach(function(eventType) {
    touchpad.on(eventType, function(event) {
      console.log("Event: %s, Target: %s", eventType, event.which);
    });
  });
});
