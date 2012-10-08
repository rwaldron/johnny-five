var five = require("../lib/johnny-five.js"),
    compulsive = require("compulsive"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap;

var board, ED, biped, servos,
    priv = new WeakMap();


/**
 * ED
 *
 * Enforcement Droid Series
 *
 * @param {Object} opts Optional properties object
 */
function ED( opts ) {

  opts = opts || {};

  // Standard servos center at 90°
  this.center = opts.center || 90;

  // Initiale movement is fwd
  this.direction = "fwd";

  // Accessor for reading the current servo position will
  // be defined and assigned to this.degrees object.
  this.degrees = {};

  // Store "next" move function calls here, if necessary.
  // Used by attn to allow bot to stop walking before commencing
  // in the next direction.
  //
  //    1. attn() -> stop walking stand, set this.next = dir
  //    2. recall attn(), comple
  this.next = null;

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
    balance: opts.balance && new five.Servo({
      pin: opts.balance /*, range: [ 40, 140 ]*/
    }),
    right: {
      hip: opts.right.hip && new five.Servo( opts.right.hip ),
      foot: opts.right.foot && new five.Servo( opts.right.foot )
    },
    left: {
      hip: opts.left.hip && new five.Servo( opts.left.hip ),
      foot: opts.left.foot && new five.Servo( opts.left.foot )
    }
  };


  // Setup degree history accessor descriptors
  [ "right", "left" ].forEach(function( key ) {

    var descriptor = {};

    [ "foot", "hip" ].forEach(function( part ) {
      descriptor[ part ] = {
        get: function() {
          var history = this.servos[ key ][ part ].history,
              last = history[ history.length - 1 ];

          return last && last.degrees || 90;
        }.bind(this)
      };
    }, this);

    this.degrees[ key ] = {};

    // And finally, create properties with the generated descriptor
    Object.defineProperties( this.degrees[ key ], descriptor );
  }, this );


  Object.defineProperty( this, "isCentered", {
    get: function() {
      var right, left;

      right = this.degrees.right;
      left = this.degrees.left;

      if ( (right.foot === 90 && right.hip === 90) &&
              (left.foot === 90 && left.foot === 90) ) {
        return true;
      }
      return false;
    }
  });


  // Store a recallable history of movement
  // TODO: Include in savable history
  this.history = [];

  // Create an entry in the private data store.
  priv.set( this, {
    // `isWalking` is used in:
    //    Ed.prototype.(attn|stop)
    //    Ed.prototype.(forward|fwd;reverse|rev)
    isWalking: false
  });

  // Wait 10ms, stand at attention
  this.wait( 10, this.attn.bind(this) );
}

/**
 * attn Stop and stand still
 * @return {Object} this
 */
//ED.prototype.attn = ED.prototype.stop = function() {
ED.prototype.attn = function( next ) {
  this.side = "right";

  // Check to see if the bot is currently walking
  if ( priv.get(this).isWalking && this.next === null ) {

    // If so, update the private isWalking state,
    // setting the value to `false`
    priv.set( this, {
      isWalking: false
    });

    // Initiate a wait behaviour of 500ms, then
    // recall this.attn();
    this.wait( 500, this.attn.bind(this) );

    // Set next
    this.next = next;

  } else {
    // Center all servos
    // this.move({
    //   type: "attn",
    //   right: {
    //     hip: 90,
    //     foot: 90
    //   },
    //   left: {
    //     hip: 90,
    //     foot: 90
    //   }
    // });

    this.queue([
      {
        wait: 10,
        task: function() {
          // this.servos.right.hip.center();
          // this.servos.right.foot.center();
          // this.servos.left.hip.center();
          // this.servos.left.foot.center();
          //

          if ( this.servos.balance ) {
            this.servos.balance.move( 90 );
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

        }.bind(this)
      },
      {
        wait: 150,
        task: function() {
          if ( this.next !== null && this[ this.next ] ) {
            // Call next specified
            this[ this.next ]();

            // Reset this.next as cleanup measure.
            this.next = null;
          }
        }.bind(this)
      }
    ]);
  }
};

/**
 * step Take a step
 *
 * @param {String} instruct Give the step function a specific instruction,
 *                          one of: (fwd, rev, left, right)
 *
 */
ED.prototype.step = function( instruct ) {
  var isLeft, isFwd, opposing, direction;

  if ( instruct === "fwd" || instruct === "rev" ) {
    direction = instruct;
    instruct = undefined;
  }
  else {
    direction = "fwd";
  }

  // Derive which side to step on; based on last step or explicit step
  this.side = instruct || ( this.side !== "right" ? "right" : "left" );

  // When changing direction, the bot needs to first stand at
  // attention. This is done to provide a discreet means of
  // re-calibrating the servos before proceeding in the new
  // direction.
  if ( this.direction !== direction && !this.isCentered ) {

    console.log( "RECALIBRATION" );
    // Return to attention (centered on all joints)
    this.attn();

    // Initiate a wait behaviour of 1500ms (1.5s);
    // Update current direction and
    // continue with new stepping direction
    this.wait( 1500, function() {
      this.direction = direction;
      this.step( direction );
    }.bind(this));

    return;
  }

  // Update the value of the current direction
  this.direction = direction;

  // Determine if this is the left foot
  // Used in phase 3 to conditionally control the servo degrees
  isLeft = this.side === "left";

  // Determine if the bot is moving fwd
  // Used in phase 3 to conditionally control the servo degrees
  isFwd = this.direction === "fwd";

  // Opposing leg side, used in prestep and phase 2;
  opposing = isLeft ? "right" : "left";

  // Begin stepping movements.
  //
  //

  // Prestep
  // Set both foot servos to 90°
  // this.servos[ opposing ].foot.center();
  // this.servos[ this.side ].foot.center();

  // console.log( this.side );

  if ( this.servos.balance ) {
    this.servos.balance[ isLeft ? "min" : "max" ]();
  }



  this.queue([

    // Phase 1
    {
      wait: 500,
      task: function() {

        var instruct = {};

        // Lift the currently stepping foot
        instruct[ this.side ] = {
          foot: isLeft ? 40 : 140
        };

        instruct[ opposing ] = {
          foot: isLeft ? 70 : 110
        };

        // Swing currently stepping hips
        this.move( instruct );

      }.bind(this)
    },

    // Phase 2
    {
      wait: 1500,
      task: function() {
        var degrees = isLeft ?
            ( isFwd ? 120 : 60 ) :
            ( isFwd ? 60 : 120 );

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
      wait: 2000,
      task: function() {

        // Flatten feet to surface

        this.servos[ opposing ].foot.center();
        this.servos[ this.side ].foot.center();

      }.bind(this)
    }
  ]);

  // console.log( "Stepped ", this.side );
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

].forEach(function( dir ) {

  ED.prototype[ dir.name ] = ED.prototype[ dir.abbr ] = function() {

    if ( this.direction === dir.abbr ) {
      return;
    }
    // Update the private state to indicate
    // that the bot is currently walking.
    //
    // This is used by the behaviour loop to
    // conditionally continue walking or to terminate.
    //
    // Walk termination occurs in the ED.prototype.attn method
    //

    this.direction = dir.abbr;

    // Initiate a loop behaviour of 2000ms (2s)
    //
    // During each turn, check if the but is still
    // in the `isWalking` state. If true, continue
    // with the next step.
    //
    // Otherwise, stop the loop
    //
    this.queue([
      {
        wait: 10,
        task: function() {
          this.step( dir.abbr );
        }.bind(this)
      },
      {
        // may need to extend this length. previously 2250
        loop: 4000,
        // this.times.step + this.times.attn
        task: function( loop ) {
          if ( !priv.get(this).isWalking ) {
            this.step( dir.abbr );
          } else {
            loop.stop();
          }
        }.bind(this)
      }
    ]);
  };
});


/**
 * move Move the bot in an arbitrary direction
 * @param  {Object} positions left/right hip/foot positions
 *
 */



ED.prototype.move = function( positions ) {
  var start, type, step;

  if ( this.history.length ) {
    start = this.history[ this.history.length - 1 ];
  }

  type = positions.type || "step";

  // Degrees per step
  step = 2;


  [ "foot", "hip" ].forEach(function( section ) {
    [ "right", "left" ].forEach(function( side ) {
      var interval, endAt, startAt, servo,
          s, sTime;

      endAt = positions[ side ][ section ];
      servo = this.servos[ side ][ section ];
      startAt = this.degrees[ side ][ section ];

      s = Date.now();
      sTime = Date.now();

      if ( !endAt || endAt === startAt ) {
        return;
      }

      if ( start ) {
        // Determine degree step direction
        if ( endAt < startAt ) {
          step *= -1;
        }

        // Repeat each step for required number of steps to move
        // servo into new position. Each step is ~20ms duration
        this.repeat( Math.abs( endAt - startAt ) / step, 10, function() {
          console.log( startAt );
          servo.move( startAt += step );

          // if ( startAt === endAt ) {
          //   this.times[ type ] = (this.times[ type ] + (Date.now() - s)) / step;
          // }
        }.bind(this));

      } else {
        // TODO: Stop doing this
        servo.move( endAt );
        five.Fn.sleep(500);
      }
    }, this );
  }, this );

// console.log( "positions.right", positions.right );
// console.log( "last", this.degrees.right.hip );

  // Push a record object into the stepping history
  this.history.push({
    timestamp: Date.now(),
    side: this.side,
    right: five.Fn.extend(
      { hip: 0, foot: 0 }, this.degrees.right, positions.right
    ),
    left: five.Fn.extend(
      { hip: 0, foot: 0 }, this.degrees.left, positions.left
    )
  });
};

// Borrow API from Compulsive
[ "wait", "loop", "queue", "repeat" ].forEach(function( api ) {
  ED.prototype[ api ] = compulsive[ api ];
});

// Begin program when the board, serial and
// firmata are connected and ready
(board = new five.Board()).on("ready", function() {

  // Create new Enforcement Droid
  // assign servos
  biped = new ED({
    // balance: 6,
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
    b: biped,
    ED: ED
  });



  biped.attn();

  biped.wait(1000, function() {
    biped.step();
  });



  // Controlled via REPL:
  // b.fwd(), b.back(), b.attn()
});



// http://www.lynxmotion.com/images/html/build112.htm
