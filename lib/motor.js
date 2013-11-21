var Board = require("../lib/board.js"),
    Driver = require("../lib/driver.js"),
    events = require("events"),
    util = require("util");

var priv = new WeakMap(),
    Devices;

Devices = {
  "NONDIRECTIONAL": {
    start: function( motor, speed ) {
      // Send a signal to turn on the motor and run at given speed in whatever
      // direction is currently set.

      // set half speed if nothing provided.
      speed = speed || 128;

      motor.firmata.analogWrite( motor.pins.pwm, speed );

      // Update the stored instance state
      priv.get( motor ).isOn = true;

      // "start" event is fired when the motor is started
      motor.emit( "start", null, new Date() );
    },
    stop: function( motor ) {
        // Send a LOW signal to shut off the motor
        motor.firmata.analogWrite( this.pins.pwm, 0 );

        // Update the stored instance state
        priv.get( motor ).isOn = false;

        // "stop" event is fired when the motor is stopped
        motor.emit( "stop", null, new Date() );
    },
    dir: function( motor, speed, dir ) {
      console.log( "Non-directional motor type" );
      return this;
    }
  },
  "DIRECTIONAL": {
    dir: function( motor, speed, dir ) {
      // Send a PWM signal to the motor and set going forward
      speed = Board.constrain( speed, 0, 255 );

      if ( speed > motor.threshold ) {
        motor.stop();

        motor.firmata.digitalWrite( motor.pins.dir, dir.value );
        motor.start( speed );

        // Update the stored instance state
        priv.get( motor ).isOn = true;

        motor.emit( dir.name, null, new Date() );
      } else {
        motor.stop();
      }

      return this;
    }
  },
  "ADAFRUIT": {
    init: function( motor ) {
      // shift register and pwm pins attribution
      // see: http://learn.adafruit.com/adafruit-motor-shield/faq
      switch ( motor.motorNumber ) {
        case 1:
          this.a = 2;
          this.b = 3;
          this.pwm = 11;
          break;
        case 2:
          this.a = 1;
          this.b = 4;
          this.pwm = 3;
          break;
        case 3:
          this.a = 0;
          this.b = 6;
          this.pwm = 5;
          break;
        case 4:
          this.a = 5;
          this.b = 7;
          this.pwm = 6;
          break;
      }
      motor.firmata.pinMode( this.pwm, motor.driver.firmata.MODES.PWM );
      motor.driver.init();
      motor.driver.latchState &= ~1<<this.a & ~1<<this.b;
      motor.driver.latchTx();

      return this;
    },
    stop: function( motor ) {
      motor.firmata.analogWrite( motor.device.pwm, motor.firmata.LOW );
      motor.driver.latchState &= ~(1<<motor.device.a);
      motor.driver.latchState &= ~(1<<motor.device.b);
      motor.driver.latchTx();
    },
    dir: function( motor, speed, dir ) {
      motor.firmata.analogWrite( motor.device.pwm, speed );
      if (dir.value) {
        motor.driver.latchState |= 1<<motor.device.a;
        motor.driver.latchState &= ~(1<<motor.device.b);
      }
      else {
        motor.driver.latchState &= ~(1<<motor.device.a);
        motor.driver.latchState |= 1<<motor.device.b;
      }
      motor.driver.latchTx();
      motor.emit( dir.name, null, new Date() );
    }
  },
  init: function() {
    // since theses are the same no need to write it twice
    this["DIRECTIONAL"].start = this["NONDIRECTIONAL"].start;
    this["DIRECTIONAL"].stop = this["NONDIRECTIONAL"].stop;
  }
};

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

  if (opts.device === "ADAFRUIT") {
    this.type = Motor.TYPE.ADAFRUIT;
  }

  this.threshold = typeof opts.threshold !== "undefined" ?
    opts.threshold : 30;

  this.speed = typeof opts.speed !== "undefined" ?
    opts.speed : 128;

  if ( this.type === Motor.TYPE.NONDIRECTIONAL ) {
    this.pins  = { pwm: this.pin };
    this.device = Devices["NONDIRECTIONAL"];
  } else if ( this.type === Motor.TYPE.DIRECTIONAL ) {
    if ( Array.isArray(this.pins) ) {
      this.pins = {
        pwm: this.pins[0],
        dir: this.pins[1]
      };
      this.device = Devices["DIRECTIONAL"];
    }
  } else {
    this.motorNumber = typeof opts.motorNumber !== "undefined" ?
      opts.motorNumber : 1;
    this.device = Devices["ADAFRUIT"];
    this.driver = typeof opts.driver !== "undefined" ?
      opts.driver : new Driver();

    this.device.init(this);
  }

  console.log(this.type);
  if (this.type !== Motor.TYPE.ADAFRUIT ) {
    // Set the PWM pin to PWM mode
    this.firmata.pinMode( this.pins.pwm, this.firmata.MODES.PWM );

    if ( this.type === Motor.TYPE.DIRECTIONAL ) {
      this.firmata.pinMode( this.pins.dir, this.firmata.MODES.OUTPUT );
    }
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
  if (this.type !== Motor.TYPE.ADAFRUIT ) {
    this.device.forward( this, speed );
  }
  else {
    this.device.start( this, speed );
  }

  // Update the stored instance state
  priv.get( this ).isOn = true;

  // "start" event is fired when the motor is started
  this.emit( "start", null, new Date() );

  return this;
};

Motor.prototype.stop = function() {
  this.device.stop( this );

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
    this.device.dir( this, speed, dir );
  };

  Motor.prototype[ dir.name ] = Motor.prototype[ dir.abbr ] = method;
});


Object.defineProperties(Motor, {
  TYPE: {
    value: Object.freeze({
      NONDIRECTIONAL: 0x00,
      DIRECTIONAL: 0x01,
      ADAFRUIT: 0x03
    })
  }
});

module.exports = Motor;

// References
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM
