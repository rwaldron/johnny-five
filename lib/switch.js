var Board = require("../lib/board.js"),
    __ = require("../lib/fn.js"),
    events = require("events"),
    util = require("util"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

// Switch instance private data
var priv = new WeakMap(),
    aliases = {
      closed: [ "close", "closed", "on" ],
      open: [ "open", "off" ]
    },
    // Create a 5 ms debounce boundary on event triggers
    // this avoids Switch events firing on
    // press noise and false positives
    trigger = __.debounce(function( key ) {
      aliases[ key ].forEach(function( type ) {
        this.emit( type, null );
      }, this);
    }, 7);


/**
 * Switch
 * @constructor
 *
 * five.Switch();
 *
 * five.Switch({
 *   pin: 10
 * });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Switch( opts ) {

  if ( !(this instanceof Switch) ) {
    return new Switch( opts );
  }

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.mode = this.firmata.MODES.INPUT;
  this.pin = opts.pin;

  // Set the pin to INPUT mode
  this.firmata.pinMode( this.pin, this.mode );

  // Create a "state" entry for privately
  // storing the state of the Switch
  priv.set( this, { isClosed: false });

  // Analog Read event loop
  this.firmata.digitalRead( this.pin, function( data ) {
    var err = null;

    // data = 0, this.isClosed = true
    // indicates that the Switch has been opened
    // after previously being closed
    if ( !data && this.isClosed ) {
      priv.set( this, { isClosed: false });

      trigger.call( this, "open" );
    }

    // data = 1, this.isClosed = false
    // indicates that the Switch has been closed
    // after previously being open
    if ( data && !this.isClosed ) {

      // Update private data
      priv.set( this, { isClosed: true });

      // Call debounced event trigger for given "key"
      // This will trigger all event aliases assigned
      // to "key"
      trigger.call( this, "closed" /* key */ );
    }
  }.bind(this));

  Object.defineProperties( this, {
    isClosed: {
      get: function() {
        return priv.get( this ).isClosed;
      }
    }
  });
}

util.inherits( Switch, events.EventEmitter );


/**
 * Fired when the Switch is closed
 *
 * @event
 * @name closed
 * @memberOf Switch
 */


/**
 * Fired when the Switch is opened
 *
 * @event
 * @name open
 * @memberOf Switch
 */


module.exports = Switch;