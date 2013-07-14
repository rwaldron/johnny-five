var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util");

  var priv = new WeakMap(),
  advancedFirmataEnabled = null,
  steppers = [];

var MAXSTEPPERS = 6; // correlates with MAXSTEPPERS in firmware

/**
 * Stepper - Class for handling steppers using AdvancedFirmata support for asynchronous stepper control
 * @constructor
 *
 * five.Stepper({
 *  type: constant,     // firmata.STEPPER.TYPE.*
 *  stepsPerRev: number,  // steps to make on revolution of stepper
 *  pins: {
 *      dir: number,    // pin attached to direction pin on driver (used for type DRIVER)
 *      step: number,   // pin attached to step pin on driver (used for type DRIVER)
 *      motor1: number, // (used for type TWO_WIRE and FOUR_WIRE)
 *      motor2: number, // (used for type TWO_WIRE and FOUR_WIRE)
 *      motor3: number, // (used for type FOUR_WIRE)
 *      motor4: number, // (used for type FOUR_WIRE)
 *  }
 * });
 *
 * @param {Object} opts
 *
 */

function Stepper( opts ) {

  if ( !(this instanceof Stepper) ) {
    return new Stepper( opts );
  }

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  if ( this.firmata.firmware.name.indexOf('AdvancedFirmata') === -1 ) {
      throw new Error( "Firmware must be AdvancedFirmata in order to use stepper functionality: see https://github.com/soundanalogous/AdvancedFirmata" );
  }

  if ( !opts.pins ) { throw new Error( "Must provide opts.pins for the stepper" ); }
  this.pins = opts.pins;

  this.id = steppers.length;
  if ( this.id >= MAXSTEPPERS ) {
    throw new Error( "Unable to configure more than " + MAXSTEPPERS + " steppers" );
  }

  if ( !opts.stepsPerRev ) { throw new Error( "Must set stepsPerRev for a stepper" ); }

  switch(opts.type) {
    case this.firmata.STEPPER.TYPE.DRIVER:
      if( !( this.pins.dir > 0 && this.pins.step > 0 ) ) {
        throw new Error( "Must set pins.dir and pins.step for DRIVER type stepper" );
      }
      this.firmata.stepperConfig( this.id, opts.type, opts.stepsPerRev, this.pins.dir, this.pins.step );
      break;
    case this.firmata.STEPPER.TYPE.TWO_WIRE:
      if( !( this.pins.motor1 > 0 && this.pins.motor2 > 0 ) ) {
        throw new Error( "Must set pins.motor1 and pins.motor2 for TWO_WIRE type stepper" );
      }
      this.firmata.stepperConfig( this.id, opts.type, opts.stepsPerRev, this.pins.motor1, this.pins.motor2 );
      break;
    case this.firmata.STEPPER.TYPE.FOUR_WIRE:
      if( !( this.pins.motor1 > 0 && this.pins.motor2 > 0 && this.pins.motor3 > 0 && this.pins.motor4 > 0 ) ) {
        throw new Error( "Must set pins.motor1, pins.motor2, pins.motor3, pins.motor4 for FOUR_WIRE type stepper" );
      }
      this.firmata.stepperConfig( this.id, opts.type, opts.stepsPerRev, this.pins.motor1, this.pins.motor2, this.pins.motor3, this.pins.motor4 );
      break;
    default:
      throw new Error( "Type must be one of firmata.STEPPER.TYPE.*" );
  }

  steppers.push(this);
  priv.set(this, {
    running: false,
    rpm: 0,
    speed: 0,
    accel: 0,
    decel: 0,
    direction: -1
  });
};

Stepper.prototype.rpm = function(rpm) {
  if ( typeof rpm === 'undefined' ) {
    return priv.get(this).rpm;
  }
  priv.get(this).rpm = rpm;
  priv.get(this).speed = Math.floor( rpm / 60 * (2 * Math.PI) * 100 );
  return this;
};

Stepper.prototype.speed = function(speed) {
  if ( typeof speed === 'undefined' ) {
    return priv.get(this).speed;
  }
  priv.get(this).speed = Math.floor(speed);
  priv.get(this).rpm = Math.floor(speed) / (2 * Math.PI) / 100 * 60;
  return this;
};

["direction", "accel", "decel"].forEach(function( prop ) {
  Stepper.prototype[ prop ] = function( value ) {
    if ( typeof value === "undefined" ) {
      return priv.get( this )[ prop ];
    }
    priv.get( this )[ prop ] = value;
    return this;
  };
});


/**
 * Move stepper motor a number of steps and call the callback on completion
 * stepsOrOpts can be a number of steps to move using current settings for speed, accel, etc
 *    or it can be an object with any of the following to set/override current settings (at a minimum it must have steps)
 *    stepsOrOpts = {
 *      steps:
 *      rpm:
 *      speed:
 *      direction:
 *      accel:
 *      decel:
 *    }
 *
 * @param {number|object} stepsOrOpts
 * @param {function} callback function(err, complete)
 */
Stepper.prototype.step = function(stepsOrOpts, callback) {
  var steps = 0;
  var opts = {
    direction: -1,
    speed: 0,
    accel: 0,
    decel: 0
  };

  if ( typeof stepsOrOpts === 'object' ) {
    steps = stepsOrOpts.steps || 0;
    // speed will always override rpm
    if ( typeof stepsOrOpts.rpm !== 'undefined' ) { this.rpm(stepsOrOpts.rpm); }
    Object.keys(opts).forEach(function(key) {
      if ( typeof stepsOrOpts[key] !== 'undefined' ) { this[key](stepsOrOpts[key]); }
    }, this);
  } else if (typeof stepsOrOpts === 'number') {
    steps = Math.floor(stepsOrOpts);
  }
  Object.keys(opts).forEach(function(key) {
    opts[key] = this[key]();
  }, this);
  if ( steps === 0 ) { return callback( new Error("Must set a number of steps" ) ); }
  if ( opts.direction < 0 ) { return callback( new Error( "Must set a direction" ) ); }
  if ( opts.speed < 0 ) { return callback( new Error( "Must set a speed" ) ); }
  var state = priv.get(this);
  state.running = true;
  this.firmata.stepperStep( this.id, opts.direction, steps, opts.speed, opts.accel, opts.decel, function(complete) {
    state.running = false;
    return callback( null, complete );
  });
};



module.exports = Stepper;
