var five = require("../lib/johnny-five.js");
var board = new five.Board();

board.on("ready", function() {
  var relay = new five.Relay(10);

  // Control the relay in real time
  // from the REPL by typing commands, eg.
  //
  // relay.on();
  //
  // relay.off();
  //
  // OR...
  //
  // relay.open();
  //
  // relay.close();
  //
  this.repl.inject({
    relay: relay
  });
});
