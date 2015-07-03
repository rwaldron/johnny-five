var argv = require("minimist")(process.argv.slice(2), { default: { show: 1 } });
var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // WaveShare AD Keypad
  var keypad;

  if (argv.show === 1) {
    keypad = new five.Keypad({
      pin: "A0",
      length: 16
    });
  }

  if (argv.show === 2) {
    keypad = new five.Keypad({
      pin: "A0",
      keys: [
        ["1", "!", "@", "#"],
        ["2", "$", "%", "^"],
        ["3", "&", "-", "+"],
        ["4", "<", ">", "?"],
      ]
    });
  }

  if (argv.show === 3) {
    keypad = new five.Keypad({
      pin: "A0",
      keys: ["1", "!", "@", "#", "2", "$", "%", "^", "3", "&", "-", "+", "4", "<", ">", "?"]
    });
  }

  ["change", "press", "hold", "release"].forEach(function(eventType) {
    keypad.on(eventType, function(data) {
      console.log("Event: %s, Target: %s", eventType, data.which);
    });
  });
});


