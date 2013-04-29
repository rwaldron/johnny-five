# Magnetometer Log

Run with:
```bash
node eg/magnetometer-log.js
```


```javascript
var color = require("colors"),
    five = require("johnny-five"),
    board, colors, servo, mag, count, dirs, lock;

(board = new five.Board()).on("ready", function() {

  count = -1;
  dirs = [ "cw", "ccw" ];
  lock = false;

  [
    // Medium Speed Counter Clock Wise
    [ 92, "ccw" ],
    // Medium Speed Clock Wise
    [ 88, "cw" ]

  ].forEach(function( def ) {

    // Define a directional method and default speed
    five.Servo.prototype[ def[1] ] = function( speed ) {
      speed = speed || def[0];

      this.move( speed );
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

  // Inject the servo and magnometer into the REPL
  this.repl.inject({
    servo: servo,
    mag: mag
  });

  // set the continuous servo to stopped
  servo.move( 90 );

  // As the heading changes, log heading value
  mag.on("headingchange", function() {
    var log;

    log = ( this.bearing.name + " " + Math.floor(this.heading) + "°" );

    console.log(
      log[ colors[ this.bearing.abbr ] ]
    );



    if ( !lock && this.bearing.name === "North" ) {
      // Set redirection lock
      lock = true;

      // Redirect
      servo[ dirs[ ++count % 2 ] ]();

      // Release redirection lock
      board.wait( 2000, function() {
        lock = false;
      });
    }
  });

  this.wait( 2000, function() {
    servo[ dirs[ ++count % 2 ] ]();
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
