var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

// Button instance private data
var priv = new WeakMap();


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

  var holdTimeout;

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.mode = this.firmata.MODES.INPUT;
  this.pin = opts.pin;

  // Button instance properties
  this.holdtime = opts && opts.holdtime || 500;

  // Set the pin to INPUT mode
  this.firmata.pinMode( this.pin, this.mode );

  // Create a "state" entry for privately
  // storing the state of the button
  priv.set( this, { isDown: false });

  // Analog Read event loop
  this.firmata.digitalRead( this.pin, function( data ) {
    var err = null;

    // data = 0, this.isDown = true
    // indicates that the button has been released
    // after previously being pressed
    if ( !data && this.isDown ) {
      if ( holdTimeout ) {
        clearTimeout( holdTimeout );
      }
      priv.set( this, { isDown: false });
      this.emit( "up", err );
    }

    // data = 1, this.isDown = false
    // indicates that the button has been pressed
    // after previously being released
    if ( data && !this.isDown ) {
      priv.set( this, { isDown: true });
      this.emit( "down", err );

      holdTimeout = setTimeout(function() {
        if ( this.isDown ) {
          this.emit( "hold", err );
        }
      }.bind(this), this.holdtime);
    }
  }.bind(this));

  // Define a non-writable `isDown` property
  Object.defineProperty( this, "isDown", {
    /**
     * acceleration calculated x, y, z data
     * @name axis
     * @property
     * @type Object
     */
    get: function() {
      return priv.get( this ).isDown;
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
