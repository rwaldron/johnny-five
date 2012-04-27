// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/button.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Button( opts ) {
  var hardware, pin, holdTimeout;

  if ( typeof opts === "number" ) {
    pin = opts;

    opts = {
      pin: pin
    };
  }

  hardware = Board.mount( opts );

  this.firmata = hardware.firmata;
  this.mode = this.firmata.MODES.ANALOG;
  this.pin = opts && opts.pin || 8;
  this.down = false;
  this.holdtime = opts && opts.holdtime || 500;

  // Set the pin to input mode
  this.firmata.pinMode( this.pin, this.mode );

  // Analog Read event loop
  this.firmata.analogRead( this.pin, function( data ) {
    var err = null;

    // data = 0, this.down = true
    // indicates that the button has been released
    // after previously being pressed
    if ( !data && this.down ) {
      if ( holdTimeout ) {
        clearTimeout( holdTimeout );
      }
      this.down = false;
      this.emit( "up", err );
    }

    // data = 1, this.down = false
    // indicates that the button has been pressed
    // after previously being released
    if ( data && !this.down ) {
      this.down = true;
      this.emit( "down", err );

      holdTimeout = setTimeout(function() {
        if ( this.down ) {
          this.emit( "hold", err );
        }
      }.bind(this), this.holdtime);
    }
  }.bind(this));
}

util.inherits( Button, events.EventEmitter );

module.exports = Button;
