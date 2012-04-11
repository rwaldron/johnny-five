// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/button.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Button( opts ) {
  var holdTimeout,
      hardware = Board.mount( opts );

  this.firmata = hardware.firmata;
  this.pin = opts && opts.pin || 8;
  this.down = false;
  this.holdtime = opts && opts.holdtime || 500;

  // Set the pin to input mode
  this.firmata.pinMode( this.pin, this.firmata.MODES.INPUT );

  // Analog Read event loop
  this.firmata.analogRead( this.pin, function( data ) {

    // data = 0, this.down = true
    // indicates that the button has been released
    // after previously being pressed
    if ( !data && this.down ) {
      if ( holdTimeout ) {
        clearTimeout( holdTimeout );
      }
      this.down = false;
      this.emit("up");
    }

    // data = 1, this.down = false
    // indicates that the button has been pressed
    // after previously being released
    if ( data && !this.down ) {
      this.down = true;
      this.emit("down");

      holdTimeout = setTimeout(function() {
        if ( this.down ) {
          this.emit("hold");
        }
      }.bind(this), this.holdtime);
    }

    console.log( data );
  }.bind(this));
}

util.inherits( Button, events.EventEmitter );

module.exports = Button;
