var Board = require("../lib/board.js"),
  Servo = require("../lib/servo.js"),
  __ = require("../lib/fn.js");

/**
 * Gripper
 *
 * Supports:
 *   [Parallax Boe-Bot gripper](http://www.parallax.com/Portals/0/Downloads/docs/prod/acc/GripperManual-v3.0.pdf)
 *
 *   [DFRobot LG-NS](http://www.dfrobot.com/index.php?route=product/product&filter_name=gripper&product_id=628#.UCvGymNST_k)
 *
 *
 * @param {[type]} servo [description]
 */

function Gripper(opts) {

  if (!(this instanceof Gripper)) {
    return new Gripper(opts);
  }

  // Default options mode, assume only when opts is a pin number
  if (typeof opts === "number") {
    opts = {
      servo: {
        pin: opts,
        range: [0, 180]
      },
      scale: [0, 10]
    };
  }

  // Default set() args to 0-10
  this.scale = opts.scale || [0, 10];

  // Setup servo
  // Allows pre-constructed servo or creating new servo.
  // Defaults for new Servo creation fall back to Servo defaults
  this.servo = opts.servo instanceof Servo ?
    opts.servo : new Servo(opts.servo);
}

[
  /**
   * open Open the gripper
   *
   * @return {Object} this
   */
  {
    name: "open",
    args: function() {
      return this.servo.range[0];
    }
  },
  /**
   * close Close the gripper
   *
   * @return {Object} this
   */
  {
    name: "close",
    args: function() {
      return this.servo.range[1];
    }
  },
  /**
   * set Set the gripper's open width
   *
   * @param  {Number} 0-10, 0 is closed, 10 is open
   *
   * @return {Object} this
   */
  {
    name: "set",
    args: function(position) {
      // Map/Scale position value to a value within
      // the servo's lo/hi range
      return Math.floor(
        __.map(
          position,
          this.scale[0], this.scale[1],
          this.servo.range[1], this.servo.range[0]
        )
      );
    }
  }
].forEach(function(api) {
  Gripper.prototype[api.name] = function() {
    return this.servo.to(
      api.args.apply(this, [].slice.call(arguments))
    );
  };
});

module.exports = Gripper;
