var repl = require("repl"),
    Repl;

// Ported from
// https://github.com/jgautier/firmata
Repl = function( opts ) {
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.once( "data", function() {
    console.log("Successfully Connected");
    repl.start("firmata>").context.board = opts.board.board;
  });
};


module.exports = Repl;
