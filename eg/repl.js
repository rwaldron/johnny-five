var five = require("../lib/johnny-five.js"),
    board;

board = new five.Board({
  debug: true
});

board.on("ready", function() {
  console.log( "Ready event. Repl instance auto-initialized" );
});
