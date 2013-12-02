var five = require("../lib/johnny-five.js"),
  compulsive = require("compulsive");

var ED,
  priv = new WeakMap();


/**
 * ED
 *
 * Enforcement Droid Series
 *
 * http://www.lynxmotion.com/images/jpg/bratjr00.jpg
 * http://www.lynxmotion.com/images/html/build112.htm
 * Hardware:
  - 1 x Alum. Channel - 3" Single Pack (ASB-503)
  - 2 x Multi-Purpose Servo Bracket Two Pack (ASB-04)
  - 1 x "L" Connector Bracket Two Pack (ASB-06)
  - 1 x "C" Servo Bracket w/ Ball Bearings Two Pack (ASB-09)
  - 1 x Robot Feet Pair (ARF-01)
  - 1 x SES Electronics Carrier (EC-02)
  - 1 x SSC-32 Servo Controller (SSC-32)
  - 4 x HS-422 (57oz.in.) Standard Servo (S422)
 *
 * @param {Object} opts Optional properties object
 */

function ED(opts) {

  opts = opts || {};

  // Standard servos center at 90°
  this.center = opts.center || 90;

  // Initiale movement is forward
  this.direction = "fwd";

  // Accessor for reading the current servo position will
  // be defined and assigned to this.degrees object.
  this.degrees = {};

  // holds a reference to the current repeating/looping sequence
  this.sequence = null;

  // Table of times (avg) to complete tasks
  this.times = {
    step: 0,
    attn: 0
  };

  // Minor normalization of incoming properties
  opts.right = opts.right || {};
  opts.left = opts.left || {};

  // Initialize the right and left cooperative servos
  // TODO: Support pre-initialized servo instances
  this.servos = {
    right: {
      hip: opts.right.hip && new five.Servo(opts.right.hip),
      foot: opts.right.foot && new five.Servo(opts.right.foot)
    },
    left: {
      hip: opts.left.hip && new five.Servo(opts.left.hip),
      foot: opts.left.foot && new five.Servo(opts.left.foot)
    }
  };

  // Create shortcut properties
  this.right = this.servos.right;
  this.left = this.servos.left;

  // Create accessor descriptors:
  //
  //  .left { .foot, .hip }
  //  .right { .foot, .hip }
  //
  ["right", "left"].forEach(function(key) {

    var descriptor = {};

    ["foot", "hip"].forEach(function(part) {
      descriptor[part] = {
        get: function() {
          var history = this.servos[key][part].history,
            last = history[history.length - 1];

          return last && last.degrees || 90;
        }.bind(this)
      };
    }, this);

    this.degrees[key] = {};

    // And finally, create properties with the generated descriptor
    Object.defineProperties(this.degrees[key], descriptor);
  }, this);


  Object.defineProperty(this, "isCentered", {
    get: function() {
      var right, left;

      right = this.degrees.right;
      left = this.degrees.left;

      if ((right.foot === 90 && right.hip === 90) &&
        (left.foot === 90 && left.foot === 90)) {
        return true;
      }
      return false;
    }
  });

  // Store a recallable history of movement
  // TODO: Include in savable history
  this.history = [{
    timestamp: Date.now(),
    side: "right",
    right: {
      hip: 0,
      foot: 0
    },
    left: {
      hip: 0,
      foot: 0
    }
  }];

  // Create an entry in the private data store.
  priv.set(this, {
    // `isWalking` is used in:
    //    ED.prototype.(attn|stop)
    //    ED.prototype.(forward|fwd;reverse|rev)
    isWalking: false,

    // Allowed to hit the dance floor.
    canDance: true
  });
}

/**
 * attn Stop and stand still
 * @return {Object} this
 */
//ED.prototype.attn = ED.prototype.stop = function() {
ED.prototype.attn = function(options) {
  options = options || {};

  if (!options.isWalking) {

    if (this.sequence) {
      this.sequence.stop();
      this.sequence = null;
    }

    priv.set(this, {
      isWalking: false
    });
  }

  this.move({
    type: "attn",
    right: {
      hip: 90,
      foot: 90
    },
    left: {
      hip: 90,
      foot: 90
    }
  });
};

/**
 * step Take a step
 *
 * @param {String} instruct Give the step function a specific instruction,
 *                          one of: (fwd, rev, left, right)
 *
 */
ED.prototype.step = function(direct) {
  var isLeft, isFwd, opposing, direction, state;

  state = priv.get(this);

  if (/fwd|rev/.test(direct)) {
    direction = direct;
    direct = undefined;
  } else {
    direction = "fwd";
  }

  // Derive which side to step on; based on last step or explicit step
  this.side = direct || (this.side !== "right" ? "right" : "left");

  // Update the value of the current direction
  this.direction = direction;

  // Determine if the bot is moving fwd
  // Used in phase 3 to conditionally control the servo degrees
  isFwd = this.direction === "fwd";

  // Determine if this is the left foot
  // Used in phase 3 to conditionally control the servo degrees
  isLeft = this.side === "left";

  // Opposing leg side, used in prestep and phase 2;
  // opposing = isLeft ? "right" : "left";

  // Begin stepping movements.
  //
  this.queue([

    // Phase 1
    {
      wait: 500,
      task: function() {
        var stepping, opposing, instruct;

        stepping = isLeft ? "left" : "right";
        opposing = isLeft ? "right" : "left";

        instruct = {};

        // Lift the currently stepping foot, while
        // leaning on the currently opposing foot.
        instruct[stepping] = {
          foot: isLeft ? 40 : 140
        };
        instruct[opposing] = {
          foot: isLeft ? 70 : 110
        };

        // Swing currently stepping hips
        this.move(instruct);
      }.bind(this)
    },

    // Phase 2
    {
      wait: 500,
      task: function() {
        var degrees = isLeft ?
          (isFwd ? 120 : 60) :
          (isFwd ? 60 : 120);

        // Swing currently stepping hips
        this.move({
          type: "swing",
          right: {
            hip: degrees
          },
          left: {
            hip: degrees
          }
        });

      }.bind(this)
    },

    // Phase 3
    {
      wait: 500,
      task: function() {

        // Flatten feet to surface
        this.servos.right.foot.center();
        this.servos.left.foot.center();



      }.bind(this)
    }
  ]);
};

[
  /**
   * forward, fwd
   *
   * Move the bot forward
   */
  {
    name: "forward",
    abbr: "fwd"
  },

  /**
   * reverse, rev
   *
   * Move the bot in reverse
   */
  {
    name: "reverse",
    abbr: "rev"
  }

].forEach(function(dir) {

  ED.prototype[dir.name] = ED.prototype[dir.abbr] = function() {
    var startAt, stepper, state;

    startAt = 10;
    state = priv.get(this);

    // If ED is already walking in this direction, return immediately;
    // This prevents multiple movement loops from being scheduled.
    if (this.direction === dir.abbr && state.isWalking) {
      return;
    }

    // If a sequence reference exists, kill it. This will
    // clear all pending queue repeaters.
    if (this.sequence) {
      this.sequence.stop();
      this.sequence = null;
    }


    this.direction = dir.abbr;

    // Update the private state to indicate
    // that the bot is currently walking.
    //
    // This is used by the behaviour loop to
    // conditionally continue walking or to terminate.
    //
    // Walk termination occurs in the ED.prototype.attn method
    //
    priv.set(this, {
      isWalking: true
    });

    stepper = function(loop) {
      // Capture of sequence queue reference
      if (this.sequence === null) {
        this.sequence = loop;
      }

      this.step(dir.abbr);

      if (!priv.get(this).isWalking) {
        loop.stop();
      }
    }.bind(this);

    // If the bot is not centered, ie. all servos at 90degrees,
    // bring the bot to attention before proceeding.
    if (!this.isCentered) {
      this.attn({
        isWalking: true
      });
      // Offset the amount ms required for attn() to complete
      startAt = 750;
    }

    this.queue([{
      wait: startAt,
      task: function() {
        this.step(dir.abbr);
      }.bind(this)
    }, {
      loop: 1500,
      task: stepper
    }]);
  };
});

ED.prototype.dance = function() {
  var isLeft, restore, state;

  // Derive which side to step on; based on last step or explicit step
  this.side = this.side !== "right" ? "right" : "left";

  // Determine if this is the left foot
  // Used in phase 3 to conditionally control the servo degrees
  isLeft = this.side === "left";

  this.attn();

  if (typeof this.moves === "undefined") {
    this.moves = 0;
  }

  this.queue([
    // Phase 1
    {
      wait: 500,
      task: function() {
        var degrees = isLeft ? 120 : 60;

        if (this.moves % 2 === 0) {
          this.move({
            type: "attn",
            right: {
              hip: 90,
              foot: 60
            },
            left: {
              hip: 90,
              foot: 120
            }
          });
        } else {

          this.move({
            type: "attn",
            right: {
              hip: 90,
              foot: 120
            },
            left: {
              hip: 90,
              foot: 60
            }
          });
        }

        // Swing currently stepping hips
        this.move({
          type: "swing",
          right: {
            hip: degrees
          },
          left: {
            hip: degrees
          }
        });

        // restore = this.servos[ this.side ].foot.last.degrees;
        // this.servos[ this.side ].foot.move( restore === 140 ? 120 : 60 );

      }.bind(this)
    },

    // Phase 2
    {
      wait: 500,
      task: function() {
        var degrees = isLeft ? 60 : 120;

        // Swing currently stepping hips
        this.move({
          type: "swing",
          right: {
            hip: degrees
          },
          left: {
            hip: degrees
          }
        });

        // this.servos[ this.side ].foot.move( restore );

      }.bind(this)
    },

    // Phase 3
    {
      wait: 500,
      task: function() {

        this.move({
          type: "attn",
          right: {
            hip: 90,
            foot: 90
          },
          left: {
            hip: 90,
            foot: 90
          }
        });

        this.dance();

      }.bind(this)
    }
  ]);

  this.moves++;
};


/**
 * move Move the bot in an arbitrary direction
 * @param  {Object} positions left/right hip/foot positions
 *
 */
ED.prototype.move = function(positions) {
  var start, type;

  if (this.history.length) {
    start = this.history[this.history.length - 1];
  }

  type = positions.type || "step";

  ["foot", "hip"].forEach(function(section) {
    ["right", "left"].forEach(function(side) {
      var interval, endAt, startAt, servo, step, s;

      if (typeof positions[side] === "undefined") {
        return;
      }

      endAt = positions[side][section];
      servo = this.servos[side][section];
      startAt = this.degrees[side][section];

      // Degrees per step
      step = 2;

      s = Date.now();

      if (!endAt || endAt === startAt) {
        return;
      }

      if (start) {
        // Determine degree step direction
        if (endAt < startAt) {
          step *= -1;
        }

        // Repeat each step for required number of steps to move
        // servo into new position. Each step is ~20ms duration
        this.repeat(Math.abs(endAt - startAt) / 2, 10, function() {
          // console.log( startAt );
          servo.move(startAt += step);

          if (startAt === endAt) {
            this.times[type] = (this.times[type] + (Date.now() - s)) / 2;
          }
        }.bind(this));

      } else {
        // TODO: Stop doing this
        servo.move(endAt);
        five.Fn.sleep(500);
      }
    }, this);
  }, this);

  // Push a record object into the stepping history
  this.history.push({
    timestamp: Date.now(),
    side: this.side,
    right: five.Fn.extend({
      hip: 0,
      foot: 0
    }, this.degrees.right, positions.right),
    left: five.Fn.extend({
      hip: 0,
      foot: 0
    }, this.degrees.left, positions.left)
  });
};

// Borrow API from Compulsive
["wait", "loop", "queue", "repeat"].forEach(function(api) {
  ED.prototype[api] = compulsive[api];
});

// Begin program when the board, serial and
// firmata are connected and ready
(new five.Board()).on("ready", function() {
  var biped;

  // Create new Enforcement Droid
  // assign servos
  biped = new ED({
    right: {
      hip: 9,
      foot: 11
    },
    left: {
      hip: 10,
      foot: 12
    }
  });

  // Inject into REPL for manual controls
  this.repl.inject({
    s: new five.Servo.Array(),
    b: biped
  });

  biped.attn();

  biped.wait(1000, function() {
    biped.fwd();
  });

  // Controlled via REPL:
  // b.fwd(), b.rev(), b.attn()
});



// http://www.lynxmotion.com/images/html/build112.htm
