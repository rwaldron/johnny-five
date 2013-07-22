# Magnetometer North

Run with:
```bash
node eg/magnetometer-north.js
```


```javascript
var color = require("colors"),
    five = require("johnny-five"),
    board, colors, servo, mag, count, dirs, isNorth, isSeeking, last;

board = new five.Board();

board.on("ready", function() {

  count = -1;
  dirs = [ "cw", "ccw" ];
  isNorth = false;
  isSeeking = false;

  [
    [ 95, "ccw" ],
    [ 85, "cw" ]

  ].forEach(function( def ) {
    five.Servo.prototype[ def[1] ] = function() {
      this.move( def[0] );
    };
  });


  // Create a new `servo` hardware instance.
  servo = new five.Servo({
    pin: 9,
    // `type` defaults to standard servo.
    // For continuous rotation servos, override the default
    // by setting the `type` here
    type: "continuous"
  });


  // Create an I2C `Magnetometer` instance
  mag = new five.Magnetometer();

  this.repl.inject({
    servo: servo,
    mag: mag
  });

  // set the continuous servo to stopped
  servo.move( 90 );

  // As the heading changes, log heading value
  mag.on("read", function() {
    var heading = Math.floor( this.heading );

    if ( heading > 345 || heading < 15 ) {

      if ( !isNorth ) {
        console.log( "FOUND north!".yellow );
        isSeeking = false;
      }

      isNorth = true;
      servo.stop();

    } else {
      isNorth = false;

      if ( !isSeeking ) {
        console.log( "find north!".red, heading );
        isSeeking = true;
      }


      if ( heading < 270 ) {
        servo.ccw();
      } else {
        servo.cw();
      }
    }
  });
});

colors = {
  N: "red",
  NbE: "red",
  NNE: "red",
  NEbN: "red",
  NE: "yellow",
  NEbE: "yellow",
  ENE: "yellow",
  EbN: "yellow",
  E: "green",
  EbS: "green",
  ESE: "green",
  SEbE: "green",
  SE: "green",
  SEbS: "cyan",
  SSE: "cyan",
  SbE: "cyan",
  S: "cyan",
  SbW: "cyan",
  SSW: "cyan",
  SWbS: "blue",
  SW: "blue",
  SWbW: "blue",
  WSW: "blue",
  WbS: "blue",
  W: "magenta",
  WbN: "magenta",
  WNW: "magenta",
  NWbW: "magenta",
  NW: "magenta",
  NWbN: "magenta",
  NNW: "magenta",
  NbW: "red"
};

```













## Contributing
All contributions must adhere to the [Idiomatic.js Style Guide](https://github.com/rwldrn/idiomatic.js),
by maintaining the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>
Licensed under the MIT license.
