# Boe Navigator

```javascript
var five = require("johnny-five"),
    board, Navigator, navigator, servos,
    expandWhich, reverseDirMap, scale;

reverseDirMap = {
  right: "left",
  left: "right"
};

scale = function( speed, low, high ) {
  return Math.floor( five.Fn.map( speed, 0, 5, low, high ) );
};


/**
 * Navigator
 * @param {Object} opts Optional properties object
 */
function Navigator( opts ) {

  // Boe Navigator continuous are calibrated to stop at 90°
  this.center = opts.center || 90;

  this.servos = {
    right: new five.Servo({ pin: opts.right, type: "continuous" }),
    left: new five.Servo({ pin: opts.left, type: "continuous" })
  };

  this.direction = opts.direction || {
    right: this.center,
    left: this.center
  };

  this.speed = opts.speed == null ? 0 : opts.speed;

  this.history = [];
  this.which = "forward";
  this.isTurning = false;

  setTimeout(function() {
    this.fwd(1).fwd(0);
  }.bind(this), 10);
}

/**
 * move
 * @param  {Number} right Speed/Direction of right servo
 * @param  {Number} left  Speed/Direction of left servo
 * @return {Object} this
 */
Navigator.prototype.move = function( right, left ) {

  // Quietly ignore duplicate instructions
  if ( this.direction.right === right &&
        this.direction.left === left ) {
    return this;
  }

  // Servos are mounted opposite of each other,
  // the values for left and right will be in
  // opposing directions.
  this.servos.right.move( right );
  this.servos.left.move( left );

  // Store a recallable history of movement
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


// TODO: DRY OUT!!!!!!!


/**
 * forward Move the bot forward
 * fwd Move the bot forward
 *
 * @param  {Number}0-5, 0 is stopped, 5 is fastest
 * @return {Object} this
 */
Navigator.prototype.forward = Navigator.prototype.fwd = function( speed ) {
  speed = speed == null ? 1 : speed;

  var scaled = scale( speed, this.center, 110 );

  this.speed = speed;
  this.which = "forward";

  return this.move( this.center - (scaled - this.center), scaled );
};

/**
 * reverse Move the bot in reverse
 * rev Move the bot in reverse
 *
 * @param  {Number}0-5, 0 is stopped, 5 is fastest
 * @return {Object} this
 */
Navigator.prototype.reverse = Navigator.prototype.rev = function( speed ) {
  speed = speed == null ? 1 : speed;

  var scaled = scale( speed, this.center, 110 );

  this.speed = speed;
  this.which = "reverse";

  console.log( scaled, this.center - (scaled - this.center) );

  return this.move( scaled, this.center - (scaled - this.center) );
};

/**
 * stop Stops the bot, regardless of current direction
 * @return {Object} this
 */
Navigator.prototype.stop = function() {
  this.speed = this.center;
  this.which = "stop";

  return this.move( this.center, this.center );
};

/**
 * right Turn the bot right
 * @return {Object} this
 */

/**
 * left Turn the bot lefts
 * @return {Object} this
 */


[ "right", "left" ].forEach(function( dir ) {
  Navigator.prototype[ dir ] = function() {
    var actual = this.direction[ reverseDirMap[ dir ] ];

    if ( !this.isTurning ) {
      this.isTurning = true;
      this.move( actual, actual );

      // Restore direction after turn
      setTimeout(function() {

        this[ this.which ]( this.speed );
        this.isTurning = false;

      }.bind(this), 750);
    }

    return this;
  };
});

expandWhich = function( which ) {
  var parts, translations;

  translations = [
    {
      f: "forward",
      r: "reverse",
      fwd: "forward",
      rev: "reverse"
    },
    {
      r: "right",
      l: "left"
    }
  ];

  if ( which.length === 2 ) {
    parts = [ which[0], which[1] ];
  }

  if ( !parts.length && /\-/.test(which) ) {
    parts = which.split("-");
  }

  return parts.map(function( val, i ) {
    return translations[ i ][ val ];
  }).join("-");
};

Navigator.prototype.pivot = function( which, time ) {
  var actual, directions, scaled;

  scaled = scale( this.speed, this.center, 110 );
  which = expandWhich( which );

  directions = {
    "forward-right": function() {
      this.move( this.center, scaled );
    },
    "forward-left": function() {
      this.move( this.center - (scaled - this.center), this.center );
    },
    "reverse-right": function() {
      this.move( scaled, this.center );
    },
    "reverse-left": function() {
      this.move( this.center, this.center - (scaled - this.center) );
    }
  };

  directions[ which ].call( this, this.speed );

  setTimeout(function() {

    this[ this.which ]( this.speed );

  }.bind(this), time || 1000 );

  return this;
};


// Begin program when the board, serial and
// firmata are connected and ready
board = new five.Board();
board.on("ready", function() {
  var collision, degrees, step, facing,
  range, redirect, look, isScanning, scanner, sonar;

  // Collision distance (inches)
  collision = 6;

  // Servo scanning steps (degrees)
  step = 10;

  // Current facing direction
  facing = "";

  // Scanning range (degrees)
  range = [ 20, 140 ];

  // Servo center point (degrees)
  center = ((range[1] - range[0]) / 2 ) + range[0];

  // Starting scanner scanning position (degrees)
  degrees = center;

  // Redirection map
  redirect = {
    left: "right",
    right: "left"
  };

  // Direction to look after releasing scanner lock (degrees)
  // look = {
  //   forward: center,
  //   left: 130,
  //   right: 40
  // };

  // Scanning state
  isScanning = true;

  // New base navigator
  // right servo = pin 10, left servo = pin 11
  navigator = new Navigator({
    right: 10,
    left: 11
  });

  // Inject navigator object into REPL
  this.repl.inject({
    b: navigator
  });

  // Sonar instance (distance detection)
  sonar = new five.Sonar("A2");

  // Servo scanner instance (panning)
  scanner = new five.Servo({
    pin: 12,
    range: range
  });

  // Initialize the scanner at it's center point
  // Will be exactly half way between the range's
  // lower and upper bound
  scanner.center();

  // Wait 1000ms, then initialize forward movement
  this.wait( 1000, function() {
    navigator.fwd();
  });


  // Scanner/Panning loop
  this.loop( 75, function() {
    var bounds;

    bounds = {
      left: center + 10,
      right: center - 10
    };

    // During course change, scanning is paused to avoid
    // overeager redirect instructions[1]
    if ( isScanning ) {
      // Calculate the next step position
      if ( degrees >= scanner.range[1] || degrees === scanner.range[0] ) {
        step *= -1;
      }

      // Update the position in degrees
      degrees += step;

      // The following three conditions will help determine
      // which way the navigator should turn if a potential collision
      // may occur in the sonar "change" event handler[2]
      if ( degrees > bounds.left ) {
        facing = "left";
      }

      if ( degrees < bounds.right ) {
        facing = "right";
      }

      if ( degrees > bounds.right && degrees < bounds.left ) {
        facing = "forward"
      }

      scanner.move( degrees );
    }
  });

  // [2] Sonar "change" events are emitted when the value of a
  // distance reading has changed since the previous reading
  //
  sonar.on("change", function( err ) {
    var turnTo;

    // Detect collision
    if ( Math.abs(this.inches) < collision ) {
      // Scanning lock will prevent multiple collision
      // detections of the same obstacle
      //
      isScanning = false;

      // Determine direction to turn
      turnTo = redirect[ facing ] || Object.keys( redirect )[ Date.now() % 2 ];

      // Log collision detection to REPL
      console.log(
        [ Date.now(),
          "Collision detected " + this.inches + " inches away.",
          "Turning " + turnTo.toUpperCase() + " to avoid"
        ].join("\n")
      );

      // Turn the navigator
      navigator[ turnTo ]();

      // Override the next scan position (degrees)
      // degrees = look[ turnTo ];

      // [1] Allow 1000ms to pass and release the scanning lock
      // by setting isScanning state to true.
      board.wait( 1500, function() {
        console.log( "Release Scanner Lock" );
        isScanning = true;
      });
    }
  });
});


// References
//
// http://www.maxbotix.com/documents/MB1010_Datasheet.pdf

```

## Breadboard




## Documentation

_(Nothing yet)_









## Contributing
All contributions must adhere to the the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
