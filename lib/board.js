var events = require("events"),
    util = require("util"),
    colors = require("colors"),
    Firmata = require("firmata").Board,
    _ = require("lodash"),
    __ = require("../lib/fn.js"),
    Repl = require("../lib/repl.js"),
    serialport = require("serialport"),
    board,
    boards,
    rport,
    Serial;


boards = [];
rport = /usb|acm|com/i;

/**
 * Process Codes
 * SIGHUP        1       Term    Hangup detected on controlling terminal
                              or death of controlling process
 * SIGINT        2       Term    Interrupt from keyboard
 * SIGQUIT       3       Core    Quit from keyboard
 * SIGILL        4       Core    Illegal Instruction
 * SIGABRT       6       Core    Abort signal from abort(3)
 * SIGFPE        8       Core    Floating point exception
 * SIGKILL       9       Term    Kill signal
 * SIGSEGV      11       Core    Invalid memory reference
 * SIGPIPE      13       Term    Broken pipe: write to pipe with no readers
 * SIGALRM      14       Term    Timer signal from alarm(2)
 * SIGTERM      15       Term    Termination signal
 *
 *
 *
 * http://www.slac.stanford.edu/BFROOT/www/Computing/Environment/Tools/Batch/exitcode.html
 *
 */

Serial = {
  used: [],

  detect: function( callback ) {

    this.info( "Board", "Connecting..." );

    // If a |port| was explicitly provided to the Board constructor,
    // invoke the detection callback and return immediately
    if ( this.port ) {
      callback.call( this, this.port );
      return;
    }

    serialport.list(function(err, result) {
      var ports = result.filter(function(val) {
        var available = true;

        // Match only ports that Arduino cares about
        // ttyUSB#, cu.usbmodem#, COM#
        if ( !rport.test(val.comName) ) {
          available = false
        }

        // Don't allow already used/encountered usb device paths
        if ( Serial.used.indexOf(val.comName) > -1 ) {
          available = false;
        }

        return available;
      }).map(function(val) {
        return val.comName;
      });

      length = ports.length;

      // If no ports are detected when scanning /dev/, then there is
      // nothing left to do and we can safely exit the program
      if ( !length ) {
        // Alert user that no devices were detected
        this.error( "Board", "No USB devices detected" );

        // Exit the program by sending SIGABRT
        process.exit(3);

        // Return (not that it matters, but this is a good way
        // to indicate to readers of the code that nothing else
        // will happen in this function)
        return;
      }

      // Continue with connection routine attempts
      this.info(
        "Serial",
        "Found possible serial port" + ( length > 1 ? "s" : "" ),
        ports.toString().grey
      );

      // Get the first available device path from the list of
      // detected ports
      callback.call( this, ports[0] );
    }.bind(this));
  },

  connect: function( usb, callback ) {
    var err, found, connected, eventType;

    // Add the usb device path to the list of device paths that
    // are currently in use - this is used by the filter function
    // above to remove any device paths that we've already encountered
    // or used to avoid blindly attempting to reconnect on them.
    Serial.used.push( usb );

    try {
      found = new Firmata( usb, function( error ) {
        if ( error !== undefined ) {
          err = error;
        }

        // Execute "ready" callback
        callback.call( this, err, "ready", found );
      }.bind(this));

      // Made this far, safely connected
      connected = true;
    } catch ( error ) {
      err = error;
    }

    if ( err ) {
      err = err.message || err;
    }

    // Determine the type of event that will be passed on to
    // the board emitter in the callback passed to Serial.detect(...)
    eventType = connected ? "connected" : "error";

    // Execute "connected" callback
    callback.call( this, err, eventType, found );
  }
};

// Board constructor: Firmata Board wrapper
function Board( opts ) {

  if ( !(this instanceof Board) ) {
    return new Board( opts );
  }

  // Ensure opts is an object
  opts = opts || {};

  var inject = {},
      keys = Object.keys( opts ),
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
  //
  // If a sesssion exists, use it
  // (instead of creating a new session)
  //
  if ( Repl.ref ) {

    inject[ this.id ] = this;

    Repl.ref.on( "ready", function() {
      Repl.ref.inject( inject );
    });

    this.repl = Repl.ref;
  } else {
    inject[ this.id ] = inject.board = this;
    this.repl = new Repl( inject );
  }


  // Used for testing only
  if ( this.mock ) {
    this.firmata = new Firmata( this.mock, function() {
      // Execute "connected" and "ready" callbacks
      this.emit( "connected", null );
      this.emit( "ready", null );
      this.ready = true;
    }.bind(this));
  } else {

    Serial.detect.call( this, function( port ) {
      Serial.connect.call( this, port, function( err, type, board ) {
        if ( err ) {
          this.error( "Board", err );
        } else {
          // Assign found board to instance
          this.firmata = board;
          this.info(
            "Board " + ( type === "connected" ? "->" : "<-" ) + " Serialport",
            type,
            port.grey
          );
        }

        if ( type === "connected" ) {
          process.on( "SIGINT", function() {
            this.warn( "Board", "Closing: firmata, serialport" );
            // On ^c, make sure we close the process after the
            // board and serialport are closed. Approx 100ms
            // TODO: this sucks, need better solution
            setTimeout(function() {
              process.exit();
            }, 100);
          }.bind(this));
        }

        if ( type === "ready" ) {
          // Update instance `ready` flag
          this.ready = true;
          this.port = port;

          // Trigger the repl to start
          process.stdin.emit( "data", 1 );
        }

        // emit connect|ready event
        this.emit( type, err );
      });
    });
  }

  // Cache instance to allow access from module constructors
  boards.push( this );
}

// Inherit event api
util.inherits( Board, events.EventEmitter );

/**
 * pinMode, analogWrite, analogRead, digitalWrite, digitalRead
 *
 * Pass through methods
 */
[ "pinMode", "analogWrite", "analogRead", "digitalWrite", "digitalRead" ].forEach(function( method ) {
  Board.prototype[ method ] = function( pin, arg ) {
    this.firmata[ method ]( pin, arg );
  };
});


/**
 *  shiftOut
 *
 */
Board.prototype.shiftOut = function( dataPin, clockPin, isBigEndian, value ) {
  var mask, write;

  write = function( value, mask ) {
    this.digitalWrite( clockPin, this.firmata.LOW );
    this.digitalWrite(
      dataPin, this.firmata[ value & mask ? "HIGH" : "LOW" ]
    );
    this.digitalWrite( clockPin, this.firmata.HIGH );
  }.bind(this);

  if ( arguments.length === 3 ) {
    value = arguments[2];
    isBigEndian = true;
  }

  if ( isBigEndian ) {
    for ( mask = 128; mask > 0; mask = mask >> 1 ) {
      write( value, mask );
    }
  } else {
    for ( mask = 0; mask < 128; mask = mask << 1 ) {
      write( value, mask );
    }
  }
};



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
//
// TODO: Repalce with compulsive API

Board.prototype.wait = function( time, callback ) {
  return setTimeout( callback.bind(this), time );
};

Board.prototype.loop = function( time, callback ) {
  return setInterval( callback.bind(this), time );
};

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
        return Board.Pin.normalize(
          Board.Pin.translate( pin )
        );
      });
    } else {
      opts.pin = Board.Pin.normalize(
        Board.Pin.translate( opts.pin )
      );
    }
  }

  return opts;
};

/**
 * Board.Device
 *
 * Initialize a new device instance
 *
 * Board.Device is a |this| senstive constructor,
 * and must be called as:
 *
 * Board.Device.call( this, opts );
 *
 *
 *
 * TODO: Migrate all constructors to use this
 *       to avoid boilerplate
 */

Board.Device = function( opts ) {
  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.pin = opts.pin || 0;
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
  },
  translate: function( pin ) {
    return Object.keys( Board.Pins.translations ).reduce(function( pin, map ) {
      var p = Board.Pins.translations[ map ][ pin ];
      return ( p != null && p ) || pin;
    }, pin );
  },
  normalize: function( pin ) {
    var p = Board.Pins.analog[ pin ];
    return p != null ? p : pin;
  }
};

// TODO: Make this this all private?, delegate to
// Board.Pin.is___()

// TODO: Improve/Overhaul all docs
Board.Pins = {
  analog: {
    A0: 0, //14,
    A1: 1, //15,
    A2: 2, //16,
    A3: 3, //17,
    A4: 4, //18,
    A5: 5  //19
    //     A0: 14,
    //     A1: 15,
    //     A2: 16,
    //     A3: 17,
    //     A4: 18,
    //     A5: 19
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
  },

  // Special kit-centric pin translations
  translations: {

    // TinkerKit
    tinker: {
      I0: "A0",
      I1: "A1",
      I2: "A2",
      I3: "A3",
      I4: "A4",
      I5: "A5",

      O0: 11,
      O1: 10,
      O2: 9,
      O3: 6,
      O4: 5,
      O5: 3,

      D13: 13,
      D12: 12,
      D8: 8,
      D7: 7,
      D4: 4,
      D2: 2
    }
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

/**
* Board event constructor.
* opts:
*   type - event type. eg: "read", "change", "up" etc.
*   target - the instance for which the event fired.
*   0..* other properties
*/
Board.Event = function( opts ) {

  if ( !(this instanceof Board.Event) ) {
    return new Board.Event( opts );
  }

  opts = opts || {};

  // default event is read
  this.type = opts.type || "read";

  // actual target instance
  this.target = opts.target || null;

  Object.keys( opts ).forEach(function( key ) {
    this[ key ] = opts[ key ];
  }, this);
};

module.exports = Board;


// References:
// http://arduino.cc/en/Main/arduinoBoardUno
