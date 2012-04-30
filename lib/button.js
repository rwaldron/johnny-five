// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/button.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

// Button Constructor specific arrays
var buttons = [],
    states = [];

function updateState( button, state ) {
  states[ buttons.indexOf( button ) ] = state;
}

function Button( opts ) {
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
  buttons.push( this );
  states.push( false );

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
      updateState( this, false );
      this.emit( "up", err );
    }

    // data = 1, this.isDown = false
    // indicates that the button has been pressed
    // after previously being released
    if ( data && !this.isDown ) {
      updateState( this, true );
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
    get: function() {
      return states[ buttons.indexOf(this) ];
    }
  });
}

util.inherits( Button, events.EventEmitter );

module.exports = Button;
