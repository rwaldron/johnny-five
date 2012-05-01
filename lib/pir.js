// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/pir.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Pir( opts ) {

  if ( !(this instanceof Pir) ) {
    return new Pir( opts );
  }

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.mode = this.firmata.MODES.INPUT;
  this.pin = opts && opts.pin;

  // PIR instance properties
  this.state = null;
  this.calibrated = false;

  // Set the pin to INPUT mode
  this.firmata.pinMode( this.pin, this.mode );

  // Analog Read event loop
  // TODO: make this "throttle-able"
  this.firmata.digitalRead( this.pin, function( data ) {
    var timestamp = new Date(),
        err = null;

    // If this is not a calibration event
    if ( this.state != null && this.state !== +data ) {

      // Update current state of PIR instance
      this.state = +data;

      // "motionstart" event fired when motion occurs
      // within the observable range of the PIR sensor
      if ( data ) {
        this.emit( "motionstart", err, timestamp );
      }

      // "motionend" event fired when motion has ceased
      // within the observable range of the PIR sensor
      if ( !data ) {
        this.emit( "motionend", err, timestamp );
      }
    }

    // "calibrated" event fired when PIR sensor is
    // ready to detect movement/motion in observable range
    if ( !this.calibrated ) {
      this.calibrated = true;
      this.state = +data;
      this.emit( "calibrated", err, timestamp );
    }
  }.bind(this));
}

util.inherits( Pir, events.EventEmitter );

module.exports = Pir;

// More information:
// http://www.ladyada.net/learn/sensors/pir.html
