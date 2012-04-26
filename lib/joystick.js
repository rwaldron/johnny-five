var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

function square(x) {
  return x * x;
}

function Joystick( opts ) {
  var offvalue,
      err = null,
      hardware = Board.mount( opts );

  this.firmata = hardware.firmata;
  this.mode = this.firmata.MODES.ANALOG;
  this.pins = opts.pins.map(function( pin ) {
    return Board.Pins.analog[ pin ];
  });

  this.freq = opts.freq || 500;

  this.magnitude = 0;

  this.normalized = {
    x: 0,
    y: 0
  };

  this.axis = {
    x: 0,
    y: 0
  };

  this.fixed = {
    x: 0,
    y: 0
  };

  // TODO: calculate joystick direction based on X/Y values
  this.direction = "";

  this.pins.forEach(function( pin ) {
    // Set the pin to input mode
    this.firmata.pinMode( pin, this.mode );

    // Arduino 0-1023  512
    this.firmata.analogRead( pin, function( data ) {

      var val = data / 1023;//?102300 / data - 100;

      // register X axis, L/R (A0)
      if ( pin === 1 ) {
        this.axis.x = val;
      // register Y axis, U/D (A1)
      } else {
        this.axis.y = val;
      }
    }.bind(this));
  }.bind(this));


  // Throttle
  setInterval(function() {

    this.magnitude = Math.sqrt(square(this.axis.x) + square(this.axis.y));

    this.normalized.y = this.axis.y / this.magnitude;
    this.normalized.x = this.axis.x / this.magnitude;

    this.fixed.y = this.axis.y.toFixed(2);
    this.fixed.x = this.axis.x.toFixed(2);


    this.emit( "axismove", err, new Date() );
  }.bind(this), this.freq );
}

util.inherits( Joystick, events.EventEmitter );


module.exports = Joystick;

// References
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-2-AxisJoystick-v1.2.pdf
// https://sites.google.com/site/parallaxinretailstores/home/2-axis-joystick
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-Axis%20JoyStick_B%20Schematic.pdf

// http://www.built-to-spec.com/blog/2009/09/10/using-a-pc-joystick-with-the-arduino/
// http://msdn.microsoft.com/en-us/library/windows/desktop/ee417001(v=vs.85).aspx
// http://retroblast.arcadecontrols.com/reviews/Ultimarc_Ultrastick_0925006-02.html

// 2-axis-joystick
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-2-AxisJoystick-v1.2.pdf
// http://myweb.wit.edu/johnsont/Classes/462/Arduino%20Tutorials.pdf
