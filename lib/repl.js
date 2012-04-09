var repl = require("repl");

// Ported from
// https://github.com/jgautier/firmata
function Repl( opts ) {
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.once( "data", function() {
    opts.board.info( "Repl", "Successfully Connected" );

    var context = repl.start("firmata > ").context;

    Object.keys( opts ).forEach(function( key ) {
      context[ key ] = opts[ key ];
    });
  });
};


module.exports = Repl;
