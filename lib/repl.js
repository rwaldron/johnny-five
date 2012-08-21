var repl = require("repl"),
    events = require("events"),
    util = require("util"),
    count = 1;

// Ported from
// https://github.com/jgautier/firmata
function Repl( opts ) {
  if ( !Repl.active ) {
    Repl.active = true;

    if ( !(this instanceof Repl) ) {
      return new Repl( opts );
    }

    // Store context values in instance property
    // this will be used for managing scope when
    // injecting new values into an existing Repl
    // session.
    this.context = {};
    this.ready = false;

    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    // Create a one time data event handler for initializing
    // the repl session via keyboard input
    process.stdin.once( "data", function() {
      var cmd, setup;

      setup = {
        prompt: "> ",
        useGlobal: true
      };


      opts.board.info( "Repl", "Successfully Connected" );

      cmd = repl.start( setup );

      // Start repl session, capture reference to `context` object
      this.context = cmd.context;

      cmd.on("exit", function() {
        opts.board.warn( "Board", "Closing: firmata, serialport" );
        process.reallyExit();
      });

      this.emit("ready");

      // Iterate options, injecting each into the repl
      // instance's context property.
      this.inject( opts );

    }.bind(this));

    Repl.ref = this;
  }
}

// Inherit event api
util.inherits( Repl, events.EventEmitter );

Repl.active = false;
Repl.ref = null;

Repl.prototype.inject = function( obj ) {
  Object.keys( obj ).forEach(function( key ) {
    this.context[ key ] = obj[ key ];
  }, this);
};

module.exports = Repl;
