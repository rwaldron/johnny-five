var Board = require("../lib/board.js"),
    Descriptor = require("descriptor"),
    events = require("events"),
    util = require("util");

var priv = new WeakMap(),
    modes, value;

modes = {
  INPUT: 0x00,
  OUTPUT: 0x01,
  ANALOG: 0x02,
  PWM: 0x03,
  SERVO: 0x04
};

value = {
  low: 0,
  high: 1
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
  var isPin, addr, type;

  if ( !(this instanceof Pin) ) {
    return new Pin( opts );
  }

  // Hardware instance properties
  this.board = Board.mount();
  this.firmata = this.board.firmata;

  // console.log( this.firmata.pins );

  // Create a private side table
  priv.set(this, { mode: 0x00 });

  isPin = typeof opts !== "object";

  addr = isPin ? opts : opts.addr;
  type = opts.type || (typeof addr === "number" ? "digital" : "analog");

  // Create read-only "addr(address)" property
  Object.defineProperties( this, {
    type: new Descriptor( type ),
    addr: new Descriptor( addr, "!writable" )
  });

  this.firmata.pinMode( this.addr, 0x00 );
}

util.inherits( Pin, events.EventEmitter );

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
    callback.apply( pin, [].slice.call(arguments) );
  });
};


/**
 * high  Write high/1 to the pin
 * @return {Pin}
 */

/**
 * low  Write low/0 to the pin
 * @return {Pin}
 */
[ "high", "low" ].forEach(function( state ) {
  Pin.prototype[ state ] = function() {
    Pin.write( this, value[ state ] );
    this.emit( state );
    return this;
  };
});

/**
 * read  Read from the pin, value is passed to callback continuation
 * @return {Pin}
 */

/**
 * write  Write to a pin
 * @return {Pin}
 */
[ "read", "write" ].forEach(function( method ) {
  Pin.prototype[ method ] = function() {
    Pin[ method ]( this, value[ state ] );
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
