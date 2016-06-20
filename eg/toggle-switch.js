var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {

  // Create a new `switch` hardware instance.
  // This example allows the switch module to
  // create a completely default instance
  var toggle = new five.Switch(8);

  // Inject the `switch` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    toggle: toggle
  });

  // Switch Event API

  // "closed" the switch is closed
  toggle.on("close", function() {
    console.log("closed");
  });

  // "open" the switch is opened
  toggle.on("open", function() {
    console.log("open");
  });
});
