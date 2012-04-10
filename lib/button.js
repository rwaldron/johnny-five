// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/button.js
var events = require("events"),
    util = require("util");

function Button( opts ) {
  this.firmata = opts.board.firmata;
  this.pin = opts.pin || 8;
  this.down = false;

  // Set the pin to input mode
  this.firmata.pinMode( this.pin, this.firmata.MODES.INPUT );

  // Digital Read event loop
  this.firmata.digitalRead( this.pin, function( data ) {

    // data = 0, this.down = true
    // indicates that the button has been released
    // after previously being pressed
    if ( !data && this.down ) {
      this.down = false;
      this.emit("up");
    }

    // data = 1, this.down = false
    // indicates that the button has been pressed
    // after previously being released
    if ( data && !this.down ) {
      this.down = true;
      this.emit("down");
    }
  }.bind(this));
};

util.inherits( Button, events.EventEmitter );

module.exports = Button;
