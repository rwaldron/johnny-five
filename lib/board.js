var events = require("events"),
    child = require("child_process"),
    util = require("util"),
    colors = require("colors"),
    Firmata = require("firmata").Board,
    Repl = require("../lib/repl.js"),
    board,
    Serial;

Serial = {
  detect: function( callback ) {
    var instance = this;

    this.info( "Board", "Connecting..." );

    child.exec( "ls /dev | grep -iE 'usb|acm'", function( err, stdout, stderr ) {
      var found,
          usb = stdout.slice( 0, -1 ).split("\n").filter(function( val ) {
            return (/tty/i).test( val );
          })[ 0 ];

      try {
        found = new Firmata( "/dev/" + usb, function() {
          // Execute "ready" callback
          callback.call( instance, err, "ready", found );
        });
      } catch ( error ) {
        err = error;
      }

      if ( err ) {
        err = err.message || err;
      }

      // Execute "connected" callback
      callback.call( instance, err, "connected", found );
    });
  }
};

// Board constructor: Firmata Board wrapper
function Board( opts ) {

  // Ensure opts is an object
  opts = opts || {};

  var keys = Object.keys( opts ),
      key;

  // Copy opts to constructor instance
  while ( keys.length ) {
    key = keys.shift();

    this[ key ] = opts[ key ];
  }

  // Easily track state of hardware
  this.ready = false;

  // Initialize instance property to reference firmata board
  this.firmata = null;

  // Identify for connected hardware cache
  if ( !this.id ) {
    this.id = Board.uid();
  }

  // If no debug flag, default to false
  if ( !("debug" in this) ) {
    this.debug = false;
  }

  // Create a Repl instance and store as
  // instance property of this firmata/board.
  // This will reduce the amount of boilerplate
  // code required to _always_ have a Repl
  // session available.
  this.repl = new Repl({
    board: this
  });


  // Used for testing only
  if ( this.mock ) {

    this.firmata = new Firmata( this.mock, function() {
      // Execute "connected" and "ready" callbacks
      this.emit( "connected", null );
      this.emit( "ready", null );
      this.ready = true;
    }.bind(this));
  } else {

    Serial.detect.call( this, function( err, type, board ) {
      if ( err ) {
        this.error( "Board", err );
      } else {
        // Assign found board to instance
        this.firmata = board;
        this.info( "Serialport", type );
        this.info( "Board", type );
      }

      if ( type === "connected" ) {
        process.on( "SIGINT", function() {
          this.warn( "Board", "Closing connection to board, serialport" );
          // On ^c, make sure we close the process after the
          // board and serialport are closed. Approx 100ms
          // TODO: this sucks, need better solution
          setTimeout(function() {
            process.exit();
          }.bind(this), 100);
        }.bind(this));
      }

      if ( type === "ready" ) {
        // Update instance `ready` flag
        this.ready = true;

        // Trigger the repl to start
        process.stdin.emit( "data", 1 );
      }

      // emit connect|ready event
      this.emit( type, err );
    });
  }

  // Cache instance to allow access from module constructors
  Board.cache.push( this );
}

// Inherit event api
util.inherits( Board, events.EventEmitter );

Board.prototype.log = function( /* type, module, message [, long description] */ ) {
  var args = [].slice.call( arguments ),
      type = args.shift(),
      module = args.shift(),
      message = args.shift(),
      color = Board.prototype.log.types[ type ];

  if ( this.debug ) {
    console.log([
      // Timestamp
      String(+new Date()).grey,
      // Module, color matches type of log
      module.magenta,
      // Message
      message[ color ],
      // Miscellaneous args
      args.join(", ")
    ].join(" "));
  }
};

Board.prototype.log.types = {
  error: "red",
  fail: "orange",
  warn: "yellow",
  info: "cyan"
};

// Make shortcuts to all logging methods
Object.keys( Board.prototype.log.types ).forEach(function( type ) {
  Board.prototype[ type ] = function() {
    var args = [].slice.call( arguments );
    args.unshift( type );

    this.log.apply( this, args );
  };
});

// Static API

// Returns a reasonably unique id string
Board.uid = function() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(chr) {
    var rnd = Math.random() * 16 | 0;
    return (chr === "x" ? rnd : (rnd & 0x3 | 0x8)).toString(16);
  }).toUpperCase();
};

// Return hardware instance, based on param:
// @param {arg}
//   object, user specified
//   index, specified in cache
//   none, defaults to first in cache
//
// Used to reduce the amount of boilerplate
// code required in any given module or program, by
// giving the developer the option of omitting an
// explicit Board reference in a module
// constructor's options
Board.mount = function( arg ) {
  var index = typeof arg === "number" && arg,
      hardware;

  // board was explicitly provided
  if ( arg && arg.board ) {
    return arg.board;
  }

  // index specified, attempt to return
  // hardware instance. Return null if not
  // found or not available
  if ( index ) {
    hardware = Board.cache[ index ];
    return hardware && hardware || null;
  }

  // If no arg specified and hardware instances
  // exist in the cache
  if ( Board.cache.length ) {
    return Board.cache[ 0 ];
  }

  // No mountable hardware
  return null;
};

// Used when mode is ANALOG
Board.analog = {
  pins: {
    "A0": 14,
    "A1": 15,
    "A2": 16,
    "A3": 17,
    "A4": 18,
    "A5": 19
  }
};

// Board.analog = {
//   pins: {
//     "A0": 0, //14,
//     "A1": 1, //15,
//     "A2": 2, //16,
//     "A3": 3, //17,
//     "A4": 4, //18,
//     "A5": 5  //19
//   }
// };

// Cached hardware
Board.cache = [];




module.exports = Board;
