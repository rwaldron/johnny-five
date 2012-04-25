var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");


function Joystick( opts ) {
  var offvalue,
      err = null,
      hardware = Board.mount( opts );

  this.firmata = hardware.firmata;
  this.mode = this.firmata.MODES.ANALOG;
  this.pins = opts.pins.map(function( pin ) {
    return Board.analog.pins[ pin ];
  });

  this.freq = opts.freq || 500;

  this.axis = {
    x: 0,
    y: 0
  };

  this.direction = "";

  this.pins.forEach(function( pin ) {
    // Set the pin to input mode
    this.firmata.pinMode( pin, this.mode );


    // ((offvalue * internal_timing_capacitor) /
    // new_potentiometer_value) – internal_timing_capacitor
    // 0.01 uf

    // Arduino 0-1023  512
    this.firmata.analogRead( pin, function( data ) {
      // register Y axis, U/D (A0)
      if ( pin === 0 ) {
        this.axis.y = data;
      // register X axis, L/R (A1)
      } else {
        this.axis.x = data;
      }
    }.bind(this));
  }.bind(this));


  // Throttle
  setInterval(function() {
    // if ( this. > 510 || data < 500 ) {
      this.emit( "axismove", err, new Date() );
    // }
  }.bind(this), this.freq );
}

util.inherits( Joystick, events.EventEmitter );


module.exports = Joystick;

// References
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-2-AxisJoystick-v1.2.pdf
// https://sites.google.com/site/parallaxinretailstores/home/2-axis-joystick
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-Axis%20JoyStick_B%20Schematic.pdf


// 2-axis-joystick
// http://www.parallax.com/Portals/0/Downloads/docs/prod/sens/27800-2-AxisJoystick-v1.2.pdf
// http://myweb.wit.edu/johnsont/Classes/462/Arduino%20Tutorials.pdf
