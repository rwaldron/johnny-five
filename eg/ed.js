var five = require("../lib/johnny-five.js"),
    compulsive = require("compulsive"),
    board, ED, biped, servos;


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

  // Minor normalization of incoming properties
  opts.right = opts.right || {};
  opts.left = opts.left || {};

  // Initialize the right and left cooperative servos
  // TODO: Support pre-initialized servo instances
  this.servos = {
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

  // Wait 10ms, stand at attention
  this.wait( 10, this.attn.bind(this) );
}

/**
 * attn Stop and stand still
 * @return {Object} this
 */
ED.prototype.attn = function() {
  this.side = "right";

  return this.move({
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

    // Return to attention (centered on all joints)
    this.servos.right.hip.center();
    this.servos.right.foot.center();
    this.servos.left.hip.center();
    this.servos.left.foot.center();


    // Wait 1.5s, update current direction and
    // continue with new stepping direction
    this.wait( 1500, function() {
      this.direction = direction;
      this.step( direction );
    }.bind(this));

    return;
  }

  this.direction = direction;

  // Determine if this is the left foot
  // Used in phase 3 to conditionally control the servo degrees
  isLeft = this.side === "left";

  // Determine if the bot is moving fwd
  // Used in phase 3 to conditionally control the servo degrees
  isFwd = this.direction === "fwd";


  // Opposing leg side, used in prestep and phase 2;
  opposing = isLeft ? "right" : "left";


  // Prestep
  this.servos[ opposing ].foot.center();
  this.servos[ this.side ].foot.center();


  this.queue([

    // Phase 1
    {
      wait: 100,
      task: function() {

        // Lift the currently stepping foot
        this.servos[ this.side ].foot.move(
          isLeft ? 120 : 60
        );

      }.bind(this)
    },

    // Phase 2
    {
      wait: 100,
      task: function() {

        // Lean on the opposing foot
        this.servos[ opposing ].foot.move(
          isLeft ? 60 : 120
        );

      }.bind(this)
    },

    // Phase 3
    {
      wait: 1000,
      task: function() {

        var degrees = isLeft ?
            ( isFwd ? 40 : 140 ) :
            ( isFwd ? 140 : 40 );

        // Swing currently stepping hips
        this.move({
          right: {
            hip: degrees
          },
          left: {
            hip: degrees
          }
        });
      }.bind(this)
    }
  ]);

  console.log( "Stepped ", this.side );
};



ED.prototype.back = function() {
  this.step("rev");
};

ED.prototype.fwd = function() {
  this.step("fwd");
};


/**
 * move Move the bot in an arbitrary direction
 * @param  {Object} positions left/right hip/foot positions
 *
 */
ED.prototype.move = function( positions ) {

  var start;

  if ( this.history.length ) {
    start = this.history[ this.history.length - 1 ];
  }

  [ "foot", "hip" ].forEach(function( section ) {
    [ "right", "left" ].forEach(function( side ) {
      var interval, endAt, startAt, servo, degree, step;

      endAt = positions[ side ][ section ];
      servo = this.servos[ side ][ section ];
      degree = this.degrees[ side ][ section ];


      if ( !endAt || endAt === degree ) {
        return;
      }

      if ( start ) {
        startAt = start[ side ][ section ];
        step = 2;

        // Determine degree step direction
        if ( endAt < startAt ) {
          step *= -1;
        }

        setInterval(function() {
          if ( startAt === endAt ) {
            clearInterval( this );
          }
          // Move the servo to the next 2° step
          servo.move( startAt += step );
        }, 20);

      } else {
        // TODO: Stop doing this
        servo.move( endAt );
        five.Fn.sleep(500);
      }
    }, this );
  }, this );


  // Push a record object into the stepping history
  this.history.push(
    five.Fn.extend({
      timestamp: Date.now(),
      side: this.side
    }, positions )
  );
};

// Borrow API from Compulsive
[ "wait", "loop", "repeat", "queue" ].forEach(function( api ) {
  ED.prototype[ api ] = compulsive[ api ];
});

// Begin program when the board, serial and
// firmata are connected and ready
(board = new five.Board()).on("ready", function() {

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
    s: servos,
    b: biped,
    ED: ED
  });

  // Controlled via REPL:
  // b.fwd(), b.back(), b.attn()
});



// http://www.lynxmotion.com/images/html/build112.htm
