var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  Sensor = require("../lib/sensor.js");

var priv = new WeakMap();

var Devices = {
  NONDIRECTIONAL: {
    pins: {
      get: function() {
        return { pwm: this.opts.pin };
      }
    },
    dir: {
      value: function() {
        console.log( "Non-directional motor type" );
        return this;
      }
    }
  },
  DIRECTIONAL: {
    pins: {
      get: function() {
        if (Array.isArray(this.opts.pins)) {
          return {
            pwm: this.opts.pins[0],
            dir: this.opts.pins[1]
          };
        } else {
          return this.opts.pins;
        }
      }
    },
    dir: {
      value: function( motor, speed, dir ) {
        // Send a PWM signal to the motor and set going forward
        speed = Board.constrain( speed, 0, 255 );
        this.release();
        
        if ( speed > motor.threshold ) {
          this.stop();
  
          this.io.digitalWrite( this.pins.dir, dir.value );
          this.start( speed );
  
          // Update the stored instance state
          priv.get( this ).isOn = true;
  
          this.emit( dir.name, null, new Date() );
        } else {
          this.stop();
        }
  
        return this;
      }
    },
    brake: {
      value: function(  ) {
        
        if( this.pins.brake ) {
          this.io.digitalWrite( this.pins.brake, 1 );  
          this.emit( 'brake', null, new Date() );
        } else {
          this.stop();
        }
        
        priv.get( this ).isOn = true;
        return this;
      }
    },
    release: {
      value: function(  ) {
        
        if( this.pins.brake ) {
          this.io.digitalWrite( this.pins.brake, 0 );  
          this.emit( 'release', null, new Date() );
        } else {
          this.stop();
        }
        
        return this;
      }
    }
  },
  CDIR: {
    pins: {
      get: function() {
        if (Array.isArray(this.opts.pins)) {
          return {
            pwm: this.opts.pins[0],
            dir: this.opts.pins[1],
            cdir: this.opts.pins[2]
          };
        } else {
          return this.opts.pins;
        }
      }
    },
    dir: {
      value: function( motor, speed, dir ) {
        // Send a PWM signal to the motor and set going forward
        speed = Board.constrain( speed, 0, 255 );
          
        if ( speed > motor.threshold ) {
          this.stop();
  
          // We need to make sure that we write low first
          if (dir.name === "forward") {
            this.io.digitalWrite( this.pins.cdir, 0 );
            this.io.digitalWrite( this.pins.dir, 1 );
          } else {
            this.io.digitalWrite( this.pins.dir, 0 );
            this.io.digitalWrite( this.pins.cdir, 1 );
          }
          
          this.start( speed );
  
          // Update the stored instance state
          priv.get( this ).isOn = true;
  
          this.emit( dir.name, null, new Date() );
        } else {
          this.stop();
        }
  
        return this;
      }
    }
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

function Motor(opts) {

  if (!(this instanceof Motor)) {
    return new Motor(opts);
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, this.opts = Board.Options(opts)
  );
  
  // Interface overrides device  
  if (this.opts.interface) {
    this.opts.device = this.opts.interface;
  }
  
  // Derive device based on pins passed
  if (typeof this.opts.device === 'undefined') {
    
    this.opts.device = typeof this.opts.pins === "undefined" ? 
      "NONDIRECTIONAL" : "DIRECTIONAL";
        
    if (this.opts.pins && (this.opts.pins.cdir || this.opts.pins.length > 2)) {
      this.opts.device = 'CDIR';
    }
  
  }
  
  
  var device = typeof this.opts.device === "string" ?
    Devices[this.opts.device] : this.opts.device;  

  this.threshold = typeof this.opts.threshold !== "undefined" ?
    this.opts.threshold : 30;

  this.speed = typeof this.opts.speed !== "undefined" ?
    this.opts.speed : 128;

  Object.defineProperties(this, device);
  
  // Set the PWM pin to PWM mode
  this.io.pinMode(this.pins.pwm, this.io.MODES.PWM);
  
  if (this.pins.dir) {
    this.io.pinMode(this.pins.dir, this.io.MODES.OUTPUT);
  }
  
  if (this.pins.cdir) {
    this.io.pinMode(this.pins.cdir, this.io.MODES.OUTPUT);
  }
  
  if (this.pins.brake) {
    this.io.pinMode(this.pins.brake, this.io.MODES.OUTPUT);
  }
  
  if (this.opts.current) {
    this.currentSensor = new Sensor(this.opts.current);
  }

  // Create a "state" entry for privately
  // storing the state of the motor
  priv.set(this, {
    isOn: false
  });

  Object.defineProperties(this, {
    // Calculated, read-only motor on/off state
    // true|false
    isOn: {
      get: function() {
        return priv.get(this).isOn;
      }
    }
  });
}

util.inherits(Motor, events.EventEmitter);

// start a motor - essentially just switch it on like a normal motor
Motor.prototype.start = function(speed) {
  // Send a signal to turn on the motor and run at given speed in whatever
  // direction is currently set.

  // set half speed if nothing provided.
  speed = speed || 128;

  if (this.pins.brake)
    this.release();
  
  this.io.analogWrite(this.pins.pwm, speed);

  this.speed = speed;

  // Update the stored instance state
  priv.get(this).isOn = true;

  // "start" event is fired when the motor is started
  this.emit("start", null, new Date());

  return this;
};

Motor.prototype.stop = function() {
  // Send a LOW signal to shut off the motor
  this.io.analogWrite(this.pins.pwm, 0);
  
  if (this.pins.brake)
    this.release();
  
  // Update the stored instance state
  priv.get(this).isOn = false;

  // "stop" event is fired when the motor is stopped
  this.emit("stop", null, new Date());

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
].forEach(function(dir) {

  var method = function(speed) {
    this.dir( this, speed, dir );
    return this;
  };


  Motor.prototype[dir.name] = Motor.prototype[dir.abbr] = method;
});

module.exports = Motor;

// References
// http://arduino.cc/en/Tutorial/SecretsOfArduinoPWM
