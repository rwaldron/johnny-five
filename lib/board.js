var events = require("events"),
    child = require("child_process"),
    util = require("util"),
    colors = require("colors"),
    Firmata = require("firmata").Board,
    board,
    Serial;

Serial = {
  detect: function( callback ) {
    var instance = this;

    this.info( "Board", "Connecting..." );

    child.exec("ls /dev | grep -i usb", function( err, stdout, stderr ) {
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

  // Used for testing only
  if ( this.mock ) {

    this.firmata = new Firmata( this.mock, function() {
      // Execute "connected" and "ready" callbacks
      this.emit( "connected", null );
      this.emit( "ready", null );

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

          // Close in 100 ms
          setTimeout(function() {
            process.exit();
          }.bind(this), 100);
        }.bind(this));
      }
      // emit connect|ready event
      this.emit( type, err );
    });
  }

  // Cache instance to allow access from module constructors
  Board.cache.push( this );
};

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
Board.uid = function() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(chr) {
    var rnd = Math.random() * 16 | 0;
    return (chr === "x" ? rnd : (rnd & 0x3 | 0x8)).toString(16);
  }).toUpperCase();
};

// Cached hardware
Board.cache = [];


module.exports = Board;
