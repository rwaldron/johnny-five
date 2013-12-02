var five = require("../lib/johnny-five.js"),
  board, toggleSwitch;

board = new five.Board();

board.on("ready", function() {

  // Create a new `switch` hardware instance.
  // This example allows the switch module to
  // create a completely default instance
  toggleSwitch = new five.Switch(8);

  // Inject the `switch` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    toggleSwitch: toggleSwitch
  });

  // Switch Event API

  // "closed" the switch is closed
  toggleSwitch.on("close", function() {
    console.log("closed");
  });

  // "open" the switch is opened
  toggleSwitch.on("open", function() {
    console.log("open");
  });
});
