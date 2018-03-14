var five = require("../lib/johnny-five");
var board = new five.Board();

board.on("ready", function() {
  
  // 4X4_I2C_NANO_BACKPACK Example
  var keypad = new five.Keypad({
    controller: "4X4_I2C_NANO_BACKPACK",
    /**
     * 
     * Default keys are set as:
     * [1, 2, 3, 'A', 4, 5, 6, 'B', 7, 8, 9, 'C', "*", 0, "#", 'D']
     * However, the Array can also be multi-dimensional and have a different
     * set of characters than the default.
     * 
     */
    keys: [
      ["!", "@", "#", "?"],
      ["$", "%", "^", "≠"],
      ["&", "-", "+", ";"],
      ["_", "=", ":", "¢"]
    ]
  });

  ["change", "press", "hold", "release"].forEach(function(eventType) {
    keypad.on(eventType, function(event) {
      console.log("Event: %s, Target: %s", eventType, event.which);
    });
  });
});
