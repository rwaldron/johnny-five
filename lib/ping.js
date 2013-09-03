var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

/**
 * Ping
 * @param {Object} opts Options: pin
 */

function Ping( opts ) {

  if ( !(this instanceof Ping) ) {
    return new Ping( opts );
  }

  var settings, last, samples, median;

  last = null;
  samples = [];

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  this.pin = opts && opts.pin || 7;

  // Ping instance properties
  //
  //
  this.freq = opts.freq || 100;
  // this.sensitivity
  this.pulse = opts.pulse || 500;

  this.microseconds = null;

  // Private settings object
  settings = {
    pin: this.pin,
    value: this.firmata.HIGH,
    pulseOut: 5
  };

  this.firmata.setMaxListeners( 100 );
  // Interval for polling pulse duration
  setInterval(function() {
    this.firmata.pulseIn( settings, function( duration ) {

      this.microseconds = duration;
      samples.push( duration );

    }.bind(this));
  }.bind(this), this.pulse );

  // Interval for throttled event
  setInterval(function() {
    var err;

    err = null;

    median = samples.sort()[ Math.floor( samples.length / 2 ) ];

    if ( !median ) {
      median = last;
    }

    // @DEPRECATE
    this.emit( "read", err, median );
    // The "read" event has been deprecated in
    // favor of a "data" event.
    this.emit( "data", err, median );

    // If the median value for this interval is not the same as the
    // median value in the last interval, fire a "change" event.
    if ( Board.range( last - 32, last + 32 ).indexOf( median ) === -1 ) {
      this.emit( "change", err, median );
    }

    // Store this media value for comparison
    // in next interval
    last = median;

    // Reset samples;
    samples.length = 0;
  }.bind(this), this.freq );


  Object.defineProperties( this, {
    // Based on the round trip travel time in microseconds,
    // Calculate the distance in inches and centimeters
    inches: {
      get: function() {
        return +( median / 74 / 2 ).toFixed(2);
      }
    },
    cm: {
      get: function() {
        return +( median / 29 / 2 ).toFixed(3);
      }
    }
  });
}

util.inherits( Ping, events.EventEmitter );


module.exports = Ping;


//http://itp.nyu.edu/physcomp/Labs/Servo
//http://arduinobasics.blogspot.com/2011/05/arduino-uno-flex-sensor-and-leds.html
//http://protolab.pbworks.com/w/page/19403657/TutorialPings
