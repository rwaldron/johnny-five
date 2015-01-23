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
// @markdown
//
// ![Relay Lamp Controller](http://bocoup.com/img/weblog/relay-breadboard.png)
//
// The breadboard diagram shows a Keyes Relay, however any Relay component will work.
//
// [![Relay Component](http://bocoup.com/img/weblog/relay-detail.jpg)](https://www.sparkfun.com/products/11042)
//
// @markdown
