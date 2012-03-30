var events = require("events"),
    child = require("child_process"),
    util = require("util"),
    colors = require("colors"),
    _ = require("underscore"),

    Firmata = require("firmata").Board,
    Board, board,
    Serial;


Serial = {
  detect: function( callback ) {
    var instance = this;

    this.log( "info", "Board", "Connecting..." );

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
Board = function( opts ) {

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
  this.board = null;

  // If no debug flag, default to false
  if ( !("debug" in this) ) {
    this.debug = false;
  }

  Serial.detect.call( this, function( err, type, board ) {

    if ( err ) {
      this.log( "error", "Board", err );
    } else {
      // Assign found board to instance
      this.board = board;
      this.log( "info", "Serialport", type );
      this.log( "info", "Board", type );
    }

    if ( type === "ready" ) {
      process.on("SIGINT", function() {

        this.log( "warn", "Board", "Closing connection to board, serialport" );

        setTimeout(function() {

          try {
            this.board.sp.on("close", function() {
              process.exit();
            });
            this.board.sp.close();
          } catch (e) {}

        }.bind(this), 500);

      }.bind(this));
    }

    this.emit( type, err );
  });
};

// Inherit event api
util.inherits( Board, events.EventEmitter );



Board.prototype.log = function( /* type, module, message [, description] */ ) {
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



module.exports = Board;
