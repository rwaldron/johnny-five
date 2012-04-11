var repl = require("repl");

// Ported from
// https://github.com/jgautier/firmata
function Repl( opts ) {

  // Store context values in instance property
  // this will be used for managing scope when
  // injecting new values into an existing Repl
  // session.
  this.context = {};

  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  process.stdin.once( "data", function() {
    opts.board.info( "Repl", "Successfully Connected" );

    // Start repl session, capture reference to `context` object
    this.context = repl.start("firmata > ").context;

    // Iterate options, injecting each into the repl
    // instance's context property.
    this.inject( opts );

  }.bind(this));
}

Repl.prototype.inject = function( obj ) {
  Object.keys( obj ).forEach(function( key ) {
    this.context[ key ] = obj[ key ];
  }, this);
};

module.exports = Repl;
