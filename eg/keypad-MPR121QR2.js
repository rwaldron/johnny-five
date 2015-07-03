var argv = require("minimist")(process.argv.slice(2), { default: { show: 1 } });
var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // MPR121QR2 3x3 Capacitive Touch Shield
  var keypad;

  if (argv.show === 1) {
    keypad = new five.Keypad({
      controller: "MPR121QR2"
    });
  }

  if (argv.show === 2) {
    keypad = new five.Keypad({
      controller: "MPR121QR2",
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&", "-", "+"],
      ]
    });
  }

  if (argv.show === 3) {
    keypad = new five.Keypad({
      controller: "MPR121QR2",
      keys: ["!", "@", "#", "$", "%", "^", "&", "-", "+"]
    });
  }

  ["change", "press", "hold", "release"].forEach(function(eventType) {
    keypad.on(eventType, function(data) {
      console.log("Event: %s, Target: %s", eventType, data.which);
    });
  });
});
