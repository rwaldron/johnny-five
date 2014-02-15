var five = require("../lib/johnny-five.js"),
  board = new five.Board();

board.on("ready", function() {
  var relay = new five.Relay(process.argv[2] || 10);

  this.repl.inject({
    relay: relay
  });
});
