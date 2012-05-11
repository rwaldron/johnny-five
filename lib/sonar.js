// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/ping.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function Sonar( opts ) {

  if ( !(this instanceof Sonar) ) {
    return new Sonar( opts );
  }

  var last, samples, median;

  last = null;
  samples = [];

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;
  this.mode = this.firmata.MODES.ANALOG;
  this.pin = opts.pin || 0;

  // Sonar instance properties
  this.freq = opts.freq || 100;
  this.voltage = null;

  // Set the pin to ANALOG mode
  this.firmata.pinMode( this.pin, this.mode );

  this.firmata.analogRead( this.pin, function( data ) {
    this.voltage = data;

    samples.push( data );
  }.bind(this));

  // Throttle
  setInterval(function() {
    var err;

    err = null;

    median = samples.sort()[ Math.floor( samples.length / 2 ) ];

    // Emit throttled event
    this.emit( "read", err, median );

    // If the median value for this interval is not the same as the
    // median value in the last interval, fire a "change" event.
    if ( median !== last ) {
      this.emit( "change", err, median );
    }

    // Store this media value for comparison
    // in next interval
    last = median;

    // Reset samples;
    samples.length = 0;
  }.bind(this), this.freq );


  Object.defineProperties( this, {
    // Based on the voltage,
    // Calculate the distance in inches and centimeters
    inches: {
      get: function() {
        return ( 254 / 1024 ) * 2 * median;
      }
    },
    cm: {
      get: function() {
        return ( median / 2 ) * 2.54;
      }
    }
  });
}

util.inherits( Sonar, events.EventEmitter );


module.exports = Sonar;


// Reference
//
// http://www.maxbotix.com/tutorials.htm#Code_example_for_the_BasicX_BX24p
// http://www.electrojoystick.com/tutorial/?page_id=285

// Tutorials
//
// http://www.sensorpedia.com/blog/how-to-interface-an-ultrasonic-rangefinder-with-sensorpedia-via-twitter-guide-2/
