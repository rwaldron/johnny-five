var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util");

var priv = new WeakMap(),
    steppers = [];

var MAXSTEPPERS = 6; // correlates with MAXSTEPPERS in firmware


function Step( stepper ) {
  this.rpm = 180;
  this.direction = -1;
  this.speed = 0;
  this.accel = 0;
  this.decel = 0;

  this.stepper = stepper;
}

Step.PROPERTIES = [ "rpm", "direction", "speed", "accel", "decel" ];
Step.DEFAULTS =   [ 180, -1, 0, 0, 0 ];


function MotorPins(pins) {
  var k = 0;
  pins = pins.slice();
  while (pins.length) {
    this[ "motor" + (++k)] = pins.shift();
  }
}

/**
 * Stepper
 *
 * Class for handling steppers using AdvancedFirmata support for asynchronous stepper control
 *
 *
 * five.Stepper({
 *  type: constant,     // firmata.STEPPER.TYPE.*
 *  stepsPerRev: number,  // steps to make on revolution of stepper
 *  pins: {
 *    step: number,   // pin attached to step pin on driver (used for type DRIVER)
 *    dir: number,    // pin attached to direction pin on driver (used for type DRIVER)
 *    motor1: number, // (used for type TWO_WIRE and FOUR_WIRE)
 *    motor2: number, // (used for type TWO_WIRE and FOUR_WIRE)
 *    motor3: number, // (used for type FOUR_WIRE)
 *    motor4: number, // (used for type FOUR_WIRE)
 *  }
 * });
 *
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.DRIVER
 *  stepsPerRev: number,
 *  pins: {
 *    step: number
 *    dir: number
 *  }
 * });
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.DRIVER
 *  stepsPerRev: number,
 *  pins: [ step, dir ]
 * });
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.TWO_WIRE
 *  stepsPerRev: number,
 *  pins: {
 *    motor1: number,
 *    motor2: number
 *  }
 * });
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.TWO_WIRE
 *  stepsPerRev: number,
 *  pins: [ motor1, motor2 ]
 * });
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.FOUR_WIRE
 *  stepsPerRev: number,
 *  pins: {
 *    motor1: number,
 *    motor2: number,
 *    motor3: number,
 *    motor4: number
 *  }
 * });
 *
 * five.Stepper({
 *  type: five.Stepper.TYPE.FOUR_WIRE
 *  stepsPerRev: number,
 *  pins: [ motor1, motor2, motor3, motor4 ]
 * });
 *
 *
 * @param {Object} opts
 *
 */

function Stepper( opts ) {
  var initial, params = [];

  if ( !(this instanceof Stepper) ) {
    return new Stepper( opts );
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  if ( this.firmata.firmware.name.indexOf("AdvancedFirmata") === -1 ) {
    throw new Error(
      "Stepper requires AdvancedFirmata. https://github.com/soundanalogous/AdvancedFirmata"
    );
  }

  if ( !opts.pins ) {
    throw new Error(
      "Stepper requires a `pins` object or array"
    );
  }

  if ( !opts.stepsPerRev ) {
    throw new Error(
      "Stepper requires a `stepsPerRev` number value"
    );
  }

  this.id = steppers.length;

  if ( this.id >= MAXSTEPPERS ) {
    throw new Error(
      "Stepper cannot exceed max steppers (" + MAXSTEPPERS + ")"
    );
  }

  // Convert an array of pins to the appropriate named pin
  if ( Array.isArray(this.pins) ) {
    if ( this.pins.length === 2 ) {
      // Using an array of 2 pins requres a TYPE
      // to disambiguate DRIVER and TWO_WIRE
      if ( !opts.type ) {
        throw new Error(
          "Stepper requires a `type` number value (DRIVER, TWO_WIRE)"
        );
      }
    }

    if ( opts.type === Stepper.TYPE.DRIVER ) {
      this.pins = {
        step: this.pins[0],
        dir: this.pins[1]
      };
    } else {
      this.pins = new MotorPins(this.pins);
    }
  }

  // Attempt to guess the type if none is provided
  if ( !opts.type ) {
    if ( this.pins.dir ) {
      opts.type = Stepper.TYPE.DRIVER;
    } else {
      if ( this.pins.motor3 ) {
        opts.type = Stepper.TYPE.FOUR_WIRE;
      } else {
        opts.type = Stepper.TYPE.TWO_WIRE;
      }
    }
  }


  // Initial Stepper config params (same for all 3 types)
  params.push( this.id, opts.type, opts.stepsPerRev );


  if ( opts.type === Stepper.TYPE.DRIVER ) {
    if ( !this.pins.dir || !this.pins.step ) {
      throw new Error(
        "Stepper.TYPE.DRIVER expects: pins.dir, pins.step"
      );
    }

    params.push(
      this.pins.dir, this.pins.step
    );
  }

  if ( opts.type === Stepper.TYPE.TWO_WIRE ) {
    if ( !this.pins.motor1 || !this.pins.motor2 ) {
      throw new Error(
        "Stepper.TYPE.TWO_WIRE expects: pins.motor1, pins.motor2"
      );
    }

    params.push(
      this.pins.motor1, this.pins.motor2
    );
  }

  if ( opts.type === Stepper.TYPE.FOUR_WIRE ) {
    if ( !this.pins.motor1 || !this.pins.motor2 || !this.pins.motor3 || !this.pins.motor4 ) {
      throw new Error(
        "Stepper.TYPE.FOUR_WIRE expects: pins.motor1, pins.motor2, pins.motor3, pins.motor4"
      );
    }

    params.push(
      this.pins.motor1, this.pins.motor2, this.pins.motor3, this.pins.motor4
    );
  }

  this.firmata.stepperConfig.apply( this.firmata, params );

  steppers.push(this);

  initial = Step.PROPERTIES.reduce(function(state, key, i) {
    return (state[ key ] = typeof opts[ key ] !== "undefined" ? opts[ key ] : Step.DEFAULTS[i], state );
  }, { isRunning: false });

  console.log( initial );

  priv.set(this, initial);
}

Object.defineProperties(Stepper, {
  TYPE: {
    value: Object.freeze({
      DRIVER: 1,
      TWO_WIRE: 2,
      FOUR_WIRE: 4
    })
  },
  RUNSTATE: {
    value: Object.freeze({
      STOP: 0,
      ACCEL: 1,
      DECEL: 2,
      RUN: 3
    })
  },
  DIRECTION: {
    value: Object.freeze({
      CCW: 0,
      CW: 1
    })
  }
});


Stepper.prototype.rpm = function( rpm ) {
  var state = priv.get( this );

  if ( typeof rpm === "undefined" ) {
    return state.rpm;
  }
  state.rpm = rpm;
  state.speed = Math.floor( rpm / 60 * (2 * Math.PI) * 100 );
  return this;
};

Stepper.prototype.speed = function( speed ) {
  var state = priv.get( this );

  if ( typeof speed === "undefined" ) {
    return state.speed;
  }
  state.speed = Math.floor(speed);
  state.rpm = Math.floor(speed) / (2 * Math.PI) / 100 * 60;
  return this;
};

["direction", "accel", "decel"].forEach(function( prop ) {
  Stepper.prototype[ prop ] = function( value ) {
    var state = priv.get( this );

    if ( typeof value === "undefined" ) {
      return state[ prop ];
    }
    state[ prop ] = value;
    return this;
  };
});

Stepper.prototype.ccw = function() {
  return this.direction(0);
};

Stepper.prototype.cw = function() {
  return this.direction(1);
};

/**
 * step
 *
 * Move stepper motor a number of steps and call the callback on completion
 *
 * @param {Number} stepsOrOpts Steps to move using current settings for speed, accel, etc.
 * @param {Object} stepsOrOpts Options object containing any of the following:
 *    stepsOrOpts = {
 *      steps:
 *      rpm:
 *      speed:
 *      direction:
 *      accel:
 *      decel:
 *    }
 *
 * NOTE: *steps* is required.
 *
 * @param {Function} callback function(err, complete)
 */
Stepper.prototype.step = function( stepsOrOpts, callback ) {
  var steps, step, state, params, isValidStep;

  steps = typeof stepsOrOpts === "object" ?
    (stepsOrOpts.steps || 0) : Math.floor( stepsOrOpts );

  step = new Step( this );

  state = priv.get( this );

  params = [];

  isValidStep = true;

  function failback() {
    isValidStep = false;
    callback();
  }

  params.push( steps );

  if ( typeof stepsOrOpts === "object" ) {
    // If an object of property values has been provided,
    // call the correlating method with the value argument.
    Step.PROPERTIES.forEach(function( key ) {
      if ( typeof stepsOrOpts[ key ] !== "undefined" ) {
        this[ key ]( stepsOrOpts[ key ] );
      }
    }, this);
  }

  if ( !state.speed ) {
    this.rpm( state.rpm );
    step.speed = this.speed();
  }


  // Ensure that the property params are set in the
  // correct order, but without rpm
  Step.PROPERTIES.slice(1).forEach(function( key ) {
    params.push( step[ key ] = this[ key ]() );
  }, this);


  if ( steps === 0 ) {
    failback(
      new Error( "Must set a number of steps" )
    );
  }

  if ( step.direction < 0 ) {
    failback(
      new Error( "Must set a direction" )
    );
  }

  if ( isValidStep ) {
    state.isRunning = true;

    params.push(function(complete) {
      state.isRunning = false;
      callback( null, complete );
    });

    step.move.apply( step, params );
  }

  return this;
};

Step.prototype.move = function( steps, dir, speed, accel, decel, callback ) {
  // Restore the param order... (steps, dir => dir, steps)
  this.stepper.firmata.stepperStep.apply(
    this.stepper.firmata, [ this.stepper.id, dir, steps, speed, accel, decel, callback ]
  );
};

module.exports = Stepper;
