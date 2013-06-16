var Board = require("../lib/board.js"),
    __ = require("../lib/fn.js"),
    events = require("events"),
    util = require("util");

// Button instance private data
var priv = new WeakMap(),
    aliases = {
      down: [ "down", "press", "tap", "impact", "hit" ],
      up: [ "up", "release" ]
    },
    // Create a 5 ms debounce boundary on event triggers
    // this avoids button events firing on
    // press noise and false positives
    trigger = __.debounce(function( key ) {
      aliases[ key ].forEach(function( type ) {
        this.emit( type, null );
      }, this);
    }, 7);


/**
 * Button
 * @constructor
 *
 * five.Button();
 *
 * five.Button({
 *   pin: 10
 * });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Button( opts ) {

  if ( !(this instanceof Button) ) {
    return new Button( opts );
  }

  var timeout;

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  // Set the pin to INPUT mode
  this.mode = this.firmata.MODES.INPUT;
  this.firmata.pinMode( this.pin, this.mode );

  // Turns out some button circuits will send
  // 0 for up and 1 for down, and some the inverse,
  // so we can invert our function with this option.
  this.invert = opts.invert || false;

  this.downValue = this.invert ? 0 : 1;
  this.upValue = this.invert ? 1 : 0;

  // Button instance properties
  this.holdtime = opts && opts.holdtime || 500;

  // Create a "state" entry for privately
  // storing the state of the button
  priv.set( this, { isDown: false });

  // Analog Read event loop
  this.firmata.digitalRead( this.pin, function( data ) {
    var err = null;

    // data = upValue, this.isDown = true
    // indicates that the button has been released
    // after previously being pressed
    if ( data === this.upValue && this.isDown ) {
      if ( timeout ) {
        clearTimeout( timeout );
      }
      priv.get( this ).isDown = false;

      trigger.call( this, "up" );
    }

    // data = downValue, this.isDown = false
    // indicates that the button has been pressed
    // after previously being released
    if ( data === this.downValue && !this.isDown ) {

      // Update private data
      priv.get( this ).isDown = true;

      // Call debounced event trigger for given "key"
      // This will trigger all event aliases assigned
      // to "key"
      trigger.call( this, "down" /* key */ );

      timeout = setTimeout(function() {
        if ( this.isDown ) {
          this.emit( "hold", err );
        }
      }.bind(this), this.holdtime);
    }
  }.bind(this));

  Object.defineProperties( this, {
    isDown: {
      get: function() {
        return priv.get( this ).isDown;
      }
    }
  });
}

util.inherits( Button, events.EventEmitter );


/**
 * Fired when the button is pressed down
 *
 * @event
 * @name down
 * @memberOf Button
 */

/**
 * Fired when the button is held
 *
 * @event
 * @name hold
 * @memberOf Button
 */

/**
 * Fired when the button is released
 *
 * @event
 * @name up
 * @memberOf Button
 */


module.exports = Button;
