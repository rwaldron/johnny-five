# Ed

Run with:
```bash
node eg/ed.js
```


```javascript
var five = require("johnny-five"),
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
  if ( priv.get(this).isWalking ) {

    // If so, update the private isWalking state,
    // setting the value to `false`
    priv.set( this, {
      isWalking: false
    });

    // Initiate a wait behaviour of 500ms, then
    // recall this.attn();
    this.wait( 500, this.attn.bind(this) );

    this.attn.next = next;

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
          if ( this.attn.next ) {
            this[ this.attn.next ]();
          }
          console.log( this.attn.next );
        }.bind(this)
      }
    ]);

  }
};

ED.prototype.attn.next = null;

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
        // Previously using....
        //     ( isFwd ? 40 : 140 ) :
        //     ( isFwd ? 140 : 40 );

        // var degrees = isLeft ?
        //     ( isFwd ? 60 : 120 ) :
        //     ( isFwd ? 120 : 60 );


        var degrees = isLeft ?
            ( isFwd ? 120 : 60 ) :
            ( isFwd ? 60 : 120 );

        // Swing currently stepping hips
        this.move({
          type: "step",
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

    if ( this.direction !== dir.abbr ) {
      this.attn( dir.abbr );
    }
    // Update the private state to indicate
    // that the bot is currently walking.
    //
    // This is used by the behaviour loop to
    // conditionally continue walking or to terminate.
    //
    // Walk termination occurs in the ED.prototype.attn method
    //

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
        wait: 1000,
        task: function() {
          this.step( dir.abbr );
        }.bind(this)
      },
      {
        // may need to extend this length. previously 2250
        loop: 1000,
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

    // this.loop( 2250, function( loop ) {
    //   if ( priv.get(this).isWalking ) {

    //     this.step( dir.abbr );

    //   } else {
    //     loop.stop();
    //   }
    // }.bind(this));
  };
});


/**
 * move Move the bot in an arbitrary direction
 * @param  {Object} positions left/right hip/foot positions
 *
 */
ED.prototype.move = function( positions ) {

  var start, type;

  if ( this.history.length ) {
    start = this.history[ this.history.length - 1 ];
  }

  type = positions.type || "step";


  [ "foot", "hip" ].forEach(function( section ) {
    [ "right", "left" ].forEach(function( side ) {
      var interval, endAt, startAt, servo, degree, step;

      endAt = positions[ side ][ section ];
      servo = this.servos[ side ][ section ];
      degree = this.degrees[ side ][ section ];


      var s = Date.now();

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

        interval = setInterval(function() {
          if ( startAt === endAt ) {
            clearInterval( interval );
            this.times[ type ] = (this.times[ type ] + (Date.now() - s)) / 2;
          }
          // Move the servo to the next 2° step
          servo.move( startAt += step );
        }.bind(this), 20);

      } else {
        // TODO: Stop doing this
        servo.move( endAt );
        five.Fn.sleep(500);
      }
    }, this );
  }, this );


  // Push a record object into the stepping history
  this.history.push({
    timestamp: Date.now(),
    side: this.side,
    right: five.Fn.extend({ hip: 0, foot: 0 }, positions.right ),
    left: five.Fn.extend({ hip: 0, foot: 0 }, positions.left )
  });
};

// Borrow API from Compulsive
[ "wait", "loop", "queue" ].forEach(function( api ) {
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
    s: new five.Servo.Array(),
    b: biped,
    ED: ED
  });

  // Controlled via REPL:
  // b.fwd(), b.back(), b.attn()
});



// http://www.lynxmotion.com/images/html/build112.htm

```

## Breadboard





## Devices




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
