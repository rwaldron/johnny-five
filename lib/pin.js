var Board = require("../lib/board.js"),
    Descriptor = require("descriptor"),
    __ = require("../lib/fn.js"),
    events = require("events"),
    util = require("util");

var priv = new WeakMap(),
    modes;

modes = {
  INPUT: 0x00,
  OUTPUT: 0x01,
  ANALOG: 0x02,
  PWM: 0x03,
  SERVO: 0x04
};

/**
 * Pin
 * @constructor
 *
 * @description Direct Pin access objects
 *
 * @param {Object} opts Options: pin, freq, range
 */

function Pin( opts ) {
  var isPin, isAnalog, addr, type, highLow, value;

  if ( !(this instanceof Pin) ) {
    return new Pin( opts );
  }

  isAnalog = Pin.isAnalog( opts );

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  opts.addr = opts.addr || opts.pin;

  // Create a private side table
  priv.set(this, {
    mode: this.as || 0x00,
    last: null
  });

  isPin = typeof opts !== "object";
  addr = isPin ? opts : opts.addr;
  type = opts.type || (isAnalog ? "analog" : "digital");
  value = 0;

  // Create read-only "addr(address)" property
  Object.defineProperties( this, {
    type: new Descriptor( type ),
    addr: new Descriptor( addr, "!writable" ),
    value: {
      get: function() {
        return value;
      }
    }
  });

  this.firmata.pinMode(
    this.addr, priv.get(this).mode
  );

  highLow = function( state ) {
    return function( data ) {
      var privs, isNot, emit;

      // Update the value closure
      value = data;

      privs = priv.get(this);
      isNot = state ? "low" : "high";
      emit = state ? "high" : "low";

      if ( privs.mode === modes.INPUT ) {
        if ( privs.last === null ) {
          privs.last = isNot;
        }
        if ( data === state && privs.last === isNot ) {
          privs.last = emit;
          this.emit( emit );
        }
      }

      // Emit a firehose "data" event
      this.emit("data");

    }.bind(this);
  }.bind(this);

  // Debounced for noise reduction: more accurately
  // detect HIGH state.
  this.firmata[ type + "Read" ](
    this.addr, __.debounce( highLow(1), 50 )
  );

  // No debounce to read the constant stream
  // (very noisy, only care about 0)
  this.firmata[ type + "Read" ](
    this.addr, highLow(0)
  );
}

util.inherits( Pin, events.EventEmitter );

/**
 * Pin.@@MODE
 *
 * Read-only constants
 * Pin.INPUT   = 0x00
 * Pin.OUTPUT  = 0x01
 * Pin.ANALOG  = 0x02
 * Pin.PWM     = 0x03
 * Pin.SERVO   = 0x04
 *
 */
Object.keys( modes ).forEach(function( mode ) {
  Object.defineProperty( Pin, mode, {
    value: modes[ mode ]
  });
});


Pin.isAnalog = function( opts ) {
  if ( typeof opts === "string" && Pin.isPrefixed(opts, [ "I", "A" ]) ) {
    return true;
  }

  if ( typeof opts === "object" ) {
    return Pin.isAnalog(
      typeof opts.addr !== "undefined" ? opts.addr : opts.pin
    );
  }
};

Pin.isPrefixed = function( value, prefixes ) {
  value = value[0];

  return prefixes.reduce(function( resolution, prefix ) {
    if ( !resolution ) {
      return prefix === value;
    }
    return resolution;
  }, false);
};

Pin.write = function( pin, val ) {
  // Set the correct mode (OUTPUT)
  // This will only set if it needs to be set, otherwise a no-op
  pin.mode( modes.OUTPUT );

  // Create the correct type of write command
  pin.firmata[ pin.type + "Write" ]( pin.addr, val );
};

Pin.read = function( pin, callback ) {
  // Set the correct mode (INPUT)
  // This will only set if it needs to be set, otherwise a no-op
  pin.mode( modes.INPUT );

  pin.firmata[ pin.type + "Read" ]( pin.addr, function() {
    callback.apply( pin, arguments );
  });
};


// Pin.prototype.isDigital = function() {
//   return this.addr > 1;
// };

// Pin.prototype.isAnalog = function() {
//   return this.board > 1;
// };

// Pin.prototype.isPWM = function() {
// };

// Pin.prototype.isServo = function() {
// };

// Pin.prototype.isI2C = function() {
// };

// Pin.prototype.isSerial = function() {
// };

// Pin.prototype.isInterrupt = function() {
// };

// Pin.prototype.isVersion = function() {
// };


Pin.prototype.query = function( callback ) {
  function handler() {
    callback( this.firmata.pins[ this.addr ] );
  }

  this.firmata.queryPinState( this.addr, handler.bind(this) );

  return this;
};

/**
 * high  Write high/1 to the pin
 * @return {Pin}
 */

Pin.prototype.high = function() {
  var value = this.type === "analog" ? 255 : 1;
  Pin.write( this, value );
  this.emit("high");
  return this;
};

/**
 * low  Write low/0 to the pin
 * @return {Pin}
 */

Pin.prototype.low = function() {
  Pin.write( this, 0 );
  this.emit("low");
  return this;
};

/**
 * read  Read from the pin, value is passed to callback continuation
 * @return {Pin}
 */

/**
 * write  Write to a pin
 * @return {Pin}
 */
[ "read", "write" ].forEach(function( state ) {
  Pin.prototype[ state ] = function( valOrCallback ) {
    Pin[ state ]( this, valOrCallback );
    return this;
  };
});

/**
 * mode  Set or Get the mode
 *
 * @param {Hex|String} [mode] Set the IO or command mode for this pin
 *   INPUT: 0x00
 *   OUTPUT: 0x01
 *   ANALOG: 0x02
 *   PWM: 0x03
 *   SERVO: 0x04
 *
 * @return {Pin}
 *
 * @param {undefined} Get the mode for this pin
 * @return {Hex}
 */

Pin.prototype.mode = function( mode ) {
  if ( mode && priv.get(this).mode !== mode ) {
    // Allows setting the mode with strings, eg "INPUT", "OUTPUT"
    if ( typeof mode !== "number" && modes[ mode ] ) {
      mode = modes[ mode ];
    }
    this.firmata.pinMode(
      this.addr,
      priv.get(this).mode = mode
    );
    return this;
  }

  return priv.get(this).mode;
};


module.exports = Pin;
