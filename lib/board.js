var events = require("events"),
    child = require("child_process"),
    util = require("util"),
    colors = require("colors"),
    Firmata = require("firmata").Board,
    _ = require("lodash"),
    Repl = require("../lib/repl.js"),
    __ = require("../lib/fn.js"),
    board,
    boards,
    grepFor,
    Serial;


boards = [];

grepFor = "ls /dev | grep -iE 'usb|acm'";

Serial = {
  online: false,
  detect: function( callback ) {
    var instance = this;

    this.info( "Board", "Connecting..." );
    // TODO:
    // Confirm bluetooth serial connections
    // eg. /dev/tty.RN42-1203-SPP-
    // http://www.rioleo.org/setting-up-the-arduino-pro-mini-and-bluetooth-mate-on-mac.php
    child.exec( grepFor, function( err, stdout, stderr ) {
      var found, usb;

      usb = stdout.slice( 0, -1 ).split("\n").filter(function( val ) {
        return (/tty/i).test( val );
      })[ 0 ];

      try {
        found = new Firmata( "/dev/" + usb, function() {
          // Set online flag to true to prevent re-connection attempts
          Serial.online = true;

          // Execute "ready" callback
          callback.call( this, err, "ready", found );
        }.bind(this));
      } catch ( error ) {
        err = error;
      }

      if ( err ) {
        err = err.message || err;
      }

      // Execute "connected" callback
      callback.call( this, err, "connected", found );
    }.bind(this));
  }
};

// Board constructor: Firmata Board wrapper
function Board( opts ) {

  if ( !(this instanceof Board) ) {
    return new Board( opts );
  }

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
    this.id = __.uid();
  }

  // If no debug flag, default to false
  // TODO: Remove override
  this.debug = true;

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

    if ( !Serial.online ) {
      Serial.detect.call( this, function( err, type, board ) {
        if ( err ) {
          this.error( "Board", err );
        } else {
          // Assign found board to instance
          this.firmata = board;
          this.info( "Board " + ( type === "connected" ? "->" : "<-" ) + " Serialport", type );
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
  }

  // Cache instance to allow access from module constructors
  boards.push( this );
}

// Inherit event api
util.inherits( Board, events.EventEmitter );


[ "pinMode", "analogWrite", "analogRead", "digitalWrite", "digitalRead" ].forEach(function( method ) {
  Board.prototype[ method ] = function( pin, arg ) {
    this.firmata[ method ]( pin, arg );
  };
});

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


// Aliasing.
// (temporary, while ironing out API details)
// The idea is to match existing hardware programming apis
// or simply find the words that are most intuitive.

// Eventually, there should be a queuing process
// for all new callbacks added

Board.prototype.wait = function( time, callback ) {
  return setTimeout( callback.bind(this), time );
};

Board.prototype.loop = function( time, callback ) {
  return setInterval( callback.bind(this), time );
};

//
// Board.prototype.timeout = Board.prototype.wait;
// Board.prototype.delay = Board.prototype.wait;
// Board.prototype.interval = Board.prototype.loop;


// ----------
// Static API
// ----------

// Board.map( val, fromLow, fromHigh, toLow, toHigh )
//
// Re-maps a number from one range to another.
// Based on arduino map()
Board.map = __.map;

// Board.constrain( val, lower, upper )
//
// Constrains a number to be within a range.
// Based on arduino constrain()
Board.constrain = __.constrain;

// Board.range( upper )
// Board.range( lower, upper )
// Board.range( lower, upper, tick )
//
// Returns a new array range
//
Board.range = __.range;

// Board.range.prefixed( prefix, upper )
// Board.range.prefixed( prefix, lower, upper )
// Board.range.prefixed( prefix, lower, upper, tick )
//
// Returns a new array range, each value prefixed
//
Board.range.prefixed = __.range.prefixed;

// Board.uid()
//
// Returns a reasonably unique id string
//
Board.uid = __.uid;

// Board.mount()
// Board.mount( index )
// Board.mount( object )
//
// Return hardware instance, based on type of param:
// @param {arg}
//   object, user specified
//   number/index, specified in cache
//   none, defaults to first in cache
//
// Notes:
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
    hardware = boards[ index ];
    return hardware && hardware || null;
  }

  // If no arg specified and hardware instances
  // exist in the cache
  if ( boards.length ) {
    return boards[ 0 ];
  }

  // No mountable hardware
  return null;
};

Board.options = function( arg ) {
  var pin,
      isArray = Array.isArray(arg),
      opts = {};

  if ( typeof arg === "number" ||
        typeof arg === "string" ||
        isArray ) {
    // Arrays are on a "pins" property
    // String/Numbers are on a "pin" property
    opts[ isArray ? "pins" : "pin" ] = arg;
  } else {
    opts = arg;
  }

  // Auto-normalize pin values, this reduces boilerplate code
  // inside module constructors
  if ( opts.pin || opts.pins && opts.pins.length ) {

    // When an array of pins is present, attempt to
    // normalize them if necessary
    if ( opts.pins ) {
      opts.pins = opts.pins.map(function( pin ) {
        var p = Board.Pins.analog[ pin ];

        return p != null ? p : pin;
      });
    } else {
      pin = Board.Pins.analog[ opts.pin ];

      opts.pin = pin != null ? pin : opts.pin;
    }
  }

  return opts;
};


Board.Pin = {
  //  Require a pin to be a digital PWM pin
  isPWM: function( pin ) {
    return Board.Pins.pwm[ pin ];
  },
  isAnalog: function( pin ) {
    return !!Board.Pins.analog[ pin ];
  },
  isDigital: function( pin ) {
    return Board.Pins.digital[ pin ];
  },
  isSerial: function( pin ) {
    return Board.Pins.serial[ pin ];
  }
};

// TODO: Make this this all private?, delegate to
// Board.Pin.is___()

// TODO: Improve/Overhaul all docs
Board.Pins = {
  analog: {
    "A0": 0, //14,
    "A1": 1, //15,
    "A2": 2, //16,
    "A3": 3, //17,
    "A4": 4, //18,
    "A5": 5  //19
    //     "A0": 14,
    //     "A1": 15,
    //     "A2": 16,
    //     "A3": 17,
    //     "A4": 18,
    //     "A5": 19
  },
  // Used for HIGH/LOW input / output
  digital: {},

  // PWM (8-bit) output with the analogWrite() function.
  // [SecretsOfArduinoPWM](http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM)
  // Used for Servo (or any PWM hardware)
  pwm: {},
  // Used to receive / transmit TTL serial data
  serial: {
    // RX, Receive
    0: true,
    // TX, Transmit
    1: true
  },
  interrupt: {
    2: true,
    3: true
  },
  // These pins support SPI communication using the SPI library.
  spi: {
    10: true,
    11: true,
    12: true,
    13: true
  },
  // There is a built-in LED connected to digital pin 13.
  // When the pin is HIGH value, the LED is on, when the pin is LOW, it's off.
  led: {
    13: true
  }
};

// Add all Digital pins
Board.range( 0, 13 ).forEach(function( val ) {
  Board.Pins.digital[ val ] = true;
});

// Add all PWM pins
[ 3, 5, 6, 9, 10, 11, 12, 13 ].forEach(function( val ) {
  Board.Pins.pwm[ val ] = true;
});


// Define a user-safe, unwritable hardware cache access
Object.defineProperty( Board, "cache", {
  get: function() {
    return boards;
  }
});



module.exports = Board;


// References:
// http://arduino.cc/en/Main/arduinoBoardUno
