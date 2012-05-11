var five = require("../lib/johnny-five.js"),
    board;

board = five.Board();

board.on("ready", function() {
  console.log( "Ready event. Repl instance auto-initialized" );
});
