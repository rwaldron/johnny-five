var five = require("../lib/johnny-five.js"),
    board, repl;

board = new five.Board({
  debug: true
});

board.on("ready", function() {

  repl = new five.Repl({
    board: board
  });


});
