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
  this.repl.inject({
    relay: relay
  });
});
/* @markdown

- [JavaScript: Relay Control with Johnny-Five on Node.js](http://bocoup.com/weblog/javascript-relay-with-johnny-five/)

@markdown */
