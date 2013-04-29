# Bug

Run with:
```bash
node eg/bug.js
```


```javascript
var five = require("johnny-five");

function Bug( servos ) {
  var part, k;

  this.isMoving = false;

  // Initialize list of body parts
  this.parts = [ "front", "left", "right", "rear" ];

  // Servo positions
  this.history = [];

  // Interval id table
  this.intervals = {
    fwd: null,
    rev: null
  };

  k = -1;
  // Initialize Servo properties from "servos" argument
  while ( ++k < this.parts.length ) {
    part = this.parts[ k ];

    this[ part ] = servos[ part ] || null;
  }

  // Unwind and wait ~10ms, center servos
  setTimeout(function() {
    this.idle();
  }.bind(this), 10);
}

Bug.STEP_MAP = {
  // steps
  fwd: [
    [ 10, -30 ],
    [ -15, 30 ]
  ],
  rev: [
    [ -15, 30 ],
    [ 15, -30 ]
  ]
};

/**
 * idle Set the bug legs to center position and
 * @return {Bug}
 */
Bug.prototype.idle = function() {

  // If the bug is actually in motion,
  // stop the servo intervals
  if ( this.isMoving ) {
    this.stop();
  }

  // set to center position°
  this.front.move( 90 );
  this.rear.move( 90 );

  //return this;
};

/**
 * step Take a full or half step
 *
 * @param  {Dict} opts Properties:
 *                     half {Boolean}
 *                     dir {String}
 * @return {Bug}
 */
Bug.prototype.step = function( opts ) {
  var dir, move, last, front, rear, step;

  opts = opts || {};

  // Get last move from history if any history exists
  // Provide a "fake" history if needed (first call)
  last = this.history.length ?
          this.history[ this.history.length - 1 ] :
          { step: 1 };

  // increment the last step
  step = last.step + 1;

  // If step is too high, step back to 0
  if ( step > 1 ) {
    step = 0;
  }

  // Derive direction if provided,
  // defaults to fwd
  dir = opts.dir || "fwd";

  // Derive position° for next move
  move = Bug.STEP_MAP[ dir ][ step ];

  // Assign position° from center
  front = 90 + move[0];
  rear = 90 + move[1];

  // Write position° to servos
  this.front.move( front );
  this.rear.move( rear );

  // Allow half step or full if provided,
  // defaults to full
  // enum(false|null|undefined)
  if ( !opts.half ) {
    // Wait one second and move servos back to
    // center idling position, 90°
    setTimeout(function() {
      this.idle();
    }.bind(this), 1000);
  }

  // Push a step into history array;
  // will be used as a reference for the subsequent step
  this.history.push(
    // NOTE: this is a great use case example for
    //        ES.next concise object initializers
    { dir: dir, step: step, front: front, rear: rear }
  );
};

/**
 * stop Stop the bug by clearing the intervals
 * @return {Bug}
 */
Bug.prototype.stop = function() {
  Object.keys( this.intervals ).forEach(function( key ) {
    if ( this.intervals[ key ] ) {
      clearInterval( this.intervals[ key ] );
    }
  }, this);
  //return this;
};

[
  /**
   * fwd Move the bug forward continuously
   * @return {Bug}
   */
  "fwd",

  /**
   * rev Move the bug backwards continuously
   * @return {Bug}
   */
  "rev"

].forEach(function( dir, k ) {

  Bug.prototype[ dir ] = function() {

    this.isMoving = true;

    this.intervals[ dir ] = setInterval(function() {
      this.step({ dir: dir, half: true });
    }.bind(this), 750 );

    // //return this;
  };
});




five.Board().on("ready", function() {
  var bug, ranges, servos;

  bug = new Bug({
    front: new five.Servo(9),
    rear: new five.Servo(10)
    //,
    //left: new five.Servo({ pin: 5, range: [ 70, 115 ] }),
    //right: new five.Servo({ pin: 6, range: [ 70, 115 ] })
  });

  // Inject the Servo Array into the REPL as "s"
  this.repl.inject({
    bug: bug,
    s: new five.Servos()
  });


  // bug.step();
});

```

## Breadboard/Illustration





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
