var argv = require("minimist")(process.argv.slice(2), { default: { show: 1 } });
var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // Sparkfun's VKey Voltage Keypad
  var keypad;

  if (argv.show === 1) {
    keypad = new five.Keypad({
      controller: "VKEY",
      pin: "A0",
    });
  }

  if (argv.show === 2) {
    keypad = new five.Keypad({
      controller: "VKEY",
      pin: "A0",
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&", "-", "+"],
        ["<", ">", "?"],
      ]
    });
  }

  if (argv.show === 3) {
    keypad = new five.Keypad({
      controller: "VKEY",
      pin: "A0",
      keys: ["!", "@", "#", "$", "%", "^", "&", "-", "+", "<", ">", "?"]
    });
  }

  ["change", "press", "hold", "release"].forEach(function(eventType) {
    keypad.on(eventType, function(data) {
      console.log("Event: %s, Target: %s", eventType, data.which);
    });
  });
});


