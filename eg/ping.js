var five = require("../lib/johnny-five.js"),
    board, ping;

board = new five.Board();

board.on("ready", function() {

  // Create a new `ping` hardware instance.
  ping = new five.Ping({
    pin: 7
  });

  // Inject the `ping` hardware into
  // the Repl instance's context;
  // allows direct command line access
  board.repl.inject({
    ping: ping
  });

  // ping Event API

  // "read" get the current reading from the ping
  ping.on("read", function( value ) {
    console.log( "read", value );
  });
});
