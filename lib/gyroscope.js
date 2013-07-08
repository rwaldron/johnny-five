var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js");

// Resolution probably a better word here
function resolution( axis, vRange, sensitivity ) {
  var voltage;

  // convert raw reading to voltage
  // (read * vRange / 1024) - (vRange / 2)
  voltage = ( axis * vRange / 1024 ) - ( vRange / 2 );

  // 800mV sensitivity
  return voltage / sensitivity;
}

// build data based on types and axes passed in
// initialize at zero
function dataStr( types, axes ) {
  var container = {};
  types.forEach(function( type ){
    container[ type ] = {};
    axes.forEach(function( axis ) {
      container[ type ][ axis ] = [ 0 ];
    });
  });
  return container;
}

// relatively terse updating function
// vs. this.data.thing.axis.whatever = value
// queue is the array on whatever object we want to update
function update( queue, value, extent ) {
  queue.push( value );
  if (queue.length > extent) {
    queue.shift();
  }
  return queue;
}

function integral( data, freq, axes ) {
  var container = {};
  axes.forEach(function( element ) {
    var axis = data.velocity[ element ];
    container[ element ] = axis.reduce(function( first, second, index ) {
      return first + (second * ((freq * index) / 1000)) / 2;
    });
  });
  return container;
}

function Gyroscope( opts ) {

  if ( !(this instanceof Gyroscope) ) {
    return new Gyroscope( opts );
  }

  var err = null;

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  this.mode = this.firmata.MODES.ANALOG;

  // Gyroscope instance properties
  this.voltage = opts.voltage || 5.0;
  this.sensitivity = opts.sensitivity || 0.67;

  // axis keys
  this.axes = opts.axes || [ "pitch", "roll" ];

  // types (not really important unless you need them)
  this.types = opts.types || [ "position", "velocity" ];

  // how many past values to store
  this.extent = opts.extent || 1;
  this.freq = opts.freq || 100;

  // build data based on types and axes passed in
  // initialize at zero
  this.data = dataStr( this.types, this.axes );

  // Setup read listeners for each pin, update instance
  // properties as they are received. Special values are
  // calculated during the throttled event emit phase
  this.pins.forEach(function( pin, index ) {

    // Set the pin to input mode to ANALOG
    this.firmata.pinMode( pin, this.mode );

    this.firmata.analogRead( pin, function( data ) {
      var paxis, velocity, sink;
      paxis = this.axes[ index ];
      velocity = resolution( data, this.voltage, this.sensitivity );
      sink = this.data.velocity[ paxis ];
      // The output we're interested in most of the time
      this.data.velocity[ paxis ] = update( sink , velocity, this.extent );

    }.bind( this ));

  }, this );
  // Throttle event emitter
  setInterval(function() {
    this.data.position = integral( this.data, this.freq, this.axes );
    var data = {
      velocity: this.data.velocity,
      position: this.data.position
    };

    this.emit( "acceleration", err, data );

  }.bind(this), this.freq );
}


util.inherits( Gyroscope, events.EventEmitter );

module.exports = Gyroscope;
