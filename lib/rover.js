// Control 2-servo rover. Based heavily on
// https://github.com/rwldrn/johnny-five/blob/master/eg/navigator.js
var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    Servo = require("../lib/servo.js"),
    __ = require("../lib/fn.js");

scale = function( speed, low, high ) {
  return Math.floor( __.map( speed, 0, 5, low, high ) );
};

/**
 * Rover
 * @constructor
 *
 * @param {Object} opts Options: right, left, center
 */
function Rover( opts ) {
  if ( !(this instanceof Rover) ) {
    return new Rover( opts );
  }

  opts = Board.options( opts );

  // Default center calibration at 90°
  this.center = opts.center || 90;

  // Initialize the right and left cooperative servos
  this.servos = {
    right: new Servo({ pin: opts.right, type: "continuous" }),
    left: new Servo({ pin: opts.left, type: "continuous" })
  };

  // Set the initial servo cooperative direction
  this.direction = {
    right: this.center,
    left: this.center
  };

  // Store the cooperative speed. Int. 0-5
  this.speed = 0;

  // Initial direction
  this.which = "stop";

  // Store a recallable history of movement
  // TODO: Include in savable history
  this.history = [];

  // Wait 10ms, send forward pulse on, then off to
  // "wake up" the servos
  setTimeout(function() {
    this.forward(1).stop(0);

    this.emit.call( this, "ready", null );
  }.bind(this), 10);
}

util.inherits( Rover, events.EventEmitter );

/**
 * move Move the bot in an arbitrary direction
 * @param  {Number} right Speed/Direction of right servo
 * @param  {Number} left  Speed/Direction of left servo
 * @return {Object} this
 */
Rover.prototype.move = function( right, left ) {

  // Quietly ignore duplicate instructions
  if ( this.direction.right === right &&
        this.direction.left === left ) {
    return this;
  }

  // Cooperative servo motion.
  // Servos are mounted opposite of each other,
  // the values for left and right will be in
  // opposing directions.
  this.servos.right.move( right );
  this.servos.left.move( left );

  // Push a record object into the history
  this.history.push({
    timestamp: Date.now(),
    right: right,
    left: left
  });

  // Update the stored direction state
  this.direction.right = right;
  this.direction.left = left;

  return this;
};

/**
 * stop Stops the rover, regardless of current direction
 * @return {Object} this
 */
Rover.prototype.stop = function() {
  this.speed = 0;
  this.which = "stop";

  return this.move( this.center, this.center );
};

/**
 * go Makes rover go, forward or reverse
 * @return {Object} this
 */
Rover.prototype.go = function( direction, speed ) {
  this.speed = speed || 1;
  this.which = direction;
  var args = function( direction, center, val ) {
    if ( direction === "forward" ) {
      return [ center - (val - center), val ];
    }
    else if ( direction === "reverse" ) {
      return [ val, center - (val - center) ];
    }
    return [ center, center ];
  };

  // TODO: Should 110 not be the high point of the servo's range?
  return this.move.apply( this, args( direction, this.center, scale( this.speed, this.center, 110 ) ) );
};

/**
 * pivot Pivots the rover around its own axis
 * @return {Object} this
 */
Rover.prototype.pivot = function( direction, duration, speed ) {
  // Scale the current speed to a servo speed
  speed = speed || this.speed || 1;
  var scaled = scale( speed, this.center, 110 );
  if ( direction === "left" ) {
    scaled = this.center - (scaled - this.center);
  }

  // Set both servos to same number to pivot
  this.move(scaled, scaled);

  // Resume forward or reverse movement after turn has finished
  // Only if duration has been set
  if ( duration ) {
    setTimeout(function(){
      this[ this.which ](this.speed);
    }.bind(this), duration);
  }

  return this;
};

/**
 * forward Moves rover forward at given speed
 * @return {Object} this
 */
Rover.prototype.forward = function( speed ) {
  return this.go( "forward", speed );
};

/**
 * reverse Moves rover in reverse at given speed
 * @return {Object} this
 */
Rover.prototype.reverse = function( speed ) {
  return this.go( "reverse", speed );
};

/**
 * right Pivots rover right around own axis
 * @return {Object} this
 */
Rover.prototype.right = function( duration, speed ) {
  return this.pivot( "right", duration, speed );
};

/**
 * left Pivots rover left around own axis
 * @return {Object} this
 */
Rover.prototype.left = function( duration, speed ) {
  return this.pivot( "left", duration, speed );
};

// TODO: left/right are pivoting functions.
// Would be useful to also have the ability to turn while
// maintaining forward/reverse motion while turning
// by speeding up or slowing down one of the tracks

module.exports = Rover;

