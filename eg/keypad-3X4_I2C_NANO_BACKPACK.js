var argv = require("minimist")(process.argv.slice(2), {
  default: {
    show: 1
  }
});
var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  // 3X4_I2C_NANO_BACKPACK
  var keypad;

  if (argv.show === 1) {
    keypad = new five.Keypad({
      controller: "3X4_I2C_NANO_BACKPACK"
    });
  }

  if (argv.show === 2) {
    keypad = new five.Keypad({
      controller: "3X4_I2C_NANO_BACKPACK",
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
      controller: "3X4_I2C_NANO_BACKPACK",
      keys: ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"]
    });
  }

  ["change", "press", "hold", "release"].forEach(function(eventType) {
    keypad.on(eventType, function(event) {
      console.log("Event: %s, Target: %s", eventType, event.which);
    });
  });
});
