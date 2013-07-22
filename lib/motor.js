var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util");

var priv = new WeakMap();

/**
 * Motor
 * @constructor
 *
 * @param {Object} opts Options: pin|pins{pwm, dir}
 * @param {Number} pin A single pin for basic
 *
 *
 * Initializing "Hobby Motors"
 *
 *    new five.Motor(9);
 *
 * ...is the same as...
 *
 *    new five.Motor({
 *      pin: 9
 *    });
 *
 *
 * Initializing Bi-Directional DC Motors:
 *
 *    new five.Motor([ 3, 12 ]);
 *
 * ...is the same as...
 *
 *    new five.Motor({
 *      pins: [ 3, 12 ]
 *    });
 *
 * ...is the same as...
 *
 *    new five.Motor({
 *      pins: {
 *        pwm: 3,
 *        dir: 12
 *      }
 *    });
 *
 */
function Motor( opts ) {

  if ( !(this instanceof Motor) ) {
    return new Motor( opts );
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  this.pins = opts.pins;

  this.type = typeof this.pins === "undefined" ?
    Motor.TYPE.NONDIRECTIONAL :
    Motor.TYPE.DIRECTIONAL;

  this.threshold = typeof opts.threshold !== "undefined" ?
    opts.threshold : 30;

  this.speed = typeof opts.speed !== "undefined" ?
    opts.speed : 128;

  if ( this.type === Motor.TYPE.NONDIRECTIONAL ) {
    this.pins  = { pwm: this.pin };
  } else {
    if ( Array.isArray(this.pins) ) {
      this.pins = {
        pwm: this.pins[0],
        dir: this.pins[1]
      };
    }
  }

  // Set the PWM pin to PWM mode
  this.firmata.pinMode( this.pins.pwm, this.firmata.MODES.PWM );

  if ( this.type === Motor.TYPE.DIRECTIONAL ) {
    this.firmata.pinMode( this.pins.dir, this.firmata.MODES.OUTPUT );
  }

  // Create a "state" entry for privately
  // storing the state of the motor
  priv.set( this, {
    isOn: false
  });

  Object.defineProperties( this, {
    // Calculated, read-only motor on/off state
    // true|false
    isOn: {
      get: function() {
        return priv.get( this ).isOn;
      }
    }
  });
}

util.inherits( Motor, events.EventEmitter );

// start a motor - essetially just switch it on like a normal motor
Motor.prototype.start = function( speed ) {
  // Send a signal to turn on the motor and run at given speed in whatever
  // direction is currently set.

  // set half speed if nothing provided.
  speed = speed || 128;

  this.firmata.analogWrite( this.pins.pwm, speed );

  // Update the stored instance state
  priv.get( this ).isOn = true;

  // "start" event is fired when the motor is started
  this.emit( "start", null, new Date() );

  return this;
};

Motor.prototype.stop = function() {
  // Send a LOW signal to shut off the motor
  this.firmata.analogWrite( this.pins.pwm, 0 );

  // Update the stored instance state
  priv.get( this ).isOn = false;

  // "stop" event is fired when the motor is stopped
  this.emit( "stop", null, new Date() );

  return this;
};



[
  /**
   * forward Turn the Motor in its forward direction
   * fwd Turn the Motor in its forward direction
   *
   * @param  {Number} 0-255, 0 is stopped, 255 is fastest
   * @return {Object} this
   */
  {
    name: "forward",
    abbr: "fwd",
    value: 1
  },
  /**
   * reverse Turn the Motor in its reverse direction
   * rev Turn the Motor in its reverse direction
   *
   * @param  {Number} 0-255, 0 is stopped, 255 is fastest
   * @return {Object} this
   */
  {
    name: "reverse",
    abbr: "rev",
    value: 0
  }
].forEach(function( dir ) {

  var method = function( speed ) {
    // Send a PWM signal to the motor and set going forward

    if ( this.type === Motor.TYPE.DIRECTIONAL ) {
      speed = Board.constrain( speed, 0, 255 );

      if ( speed > this.threshold ) {
        this.stop();

        this.firmata.digitalWrite( this.pins.dir, dir.value );
        this.start( speed );

        // Update the stored instance state
        priv.get( this ).isOn = true;

        this.emit( dir.name, null, new Date() );
      } else {
        this.stop();
      }
    } else {
      console.log( "Non-directional motor type" );
    }

    return this;
  };


  Motor.prototype[ dir.name ] = Motor.prototype[ dir.abbr ] = method;
});


Object.defineProperties(Motor, {
  TYPE: {
    value: Object.freeze({
      NONDIRECTIONAL: 0x00,
      DIRECTIONAL: 0x01
    })
  }
});

module.exports = Motor;

// References
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM
