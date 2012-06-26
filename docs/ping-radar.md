# Ping Radar

Run with:
```bash
node eg/ping-radar.js
```


```javascript
var five = require("johnny-five"),
    child = require("child_process"),
    app = require("http").createServer(handler),
    io = require("socket.io").listen(app),
    fs = require("fs"),
    board;

app.listen( 8000 );

function handler( req, res ) {

  var path = __dirname;

  if ( req.url === "/" ) {
    path += "/radar.html";
  } else {
    path += req.url;
  }

  fs.readFile( path, function( err, data ) {
    if ( err ) {
      res.writeHead( 500 );
      return res.end( "Error loading " + path );
    }

    res.writeHead( 200 );
    res.end( data );
  });
}

io.set( "log level", 1 );


board = new five.Board();

board.on("ready", function() {
  var center, degrees, step, facing,
  range, redirect, isScanning, scanner, soi, ping, last;


  // Open Radar view
  child.exec( "open http://localhost:8000/" );

  // Starting scanner scanning position (degrees)
  degrees = 1;

  // Servo scanning steps (degrees)
  step = 1;

  // Current facing direction
  facing = "";

  last = 0;

  // Scanning range (degrees)
  range = [ 0, 180 ];

  // Servo center point (degrees)
  center = range[ 1 ] / 2;

  // Redirection map
  redirect = {
    left: "right",
    right: "left"
  };


  // Scanning state
  isScanning = true;

  // ping instance (distance detection)
  ping = new five.Ping(7);

  // Servo instance (panning)
  scanner = new five.Servo({
    pin: 12,
    range: range
  });

  this.repl.inject({
    scanner: scanner
  });

  // Initialize the scanner at it's center point
  // Will be exactly half way between the range's
  // lower and upper bound
  scanner.min();

  // Scanner/Panning loop
  this.loop( 50, function() {
    var bounds;

    bounds = {
      left: center + 5,
      right: center - 5
    };

    // During course change, scanning is paused to avoid
    // overeager redirect instructions[1]
    if ( isScanning ) {
      // Calculate the next step position
      if ( degrees > scanner.range[1] || degrees <= scanner.range[0] ) {

        if ( degrees > scanner.range[1] ) {
          io.sockets.emit("reset");
          degrees = 0;
          last = -1;
        } else {
          step *= -1;
        }
      }

      // Update the position in degrees
      degrees += step;

      // The following three conditions will help determine
      // which way the bot should turn if a potential collision
      // may occur in the ping "change" event handler[2]
      if ( degrees > bounds.left ) {
        facing = "left";
      }

      if ( degrees < bounds.right ) {
        facing = "right";
      }

      if ( degrees > bounds.right && degrees < bounds.left ) {
        facing = "forward";
      }

      scanner.move( degrees );
    }
  });


  // [2] ping "change" events are emitted when the value of a
  // distance reading has changed since the previous reading
  //

  io.sockets.on( "connection", function( socket ) {

    soi = socket;

    console.log( "Socket Connected" );

    ping.on("read", function() {

      if ( last !== degrees ) {
        io.sockets.emit( "ping", {
          degrees: degrees,
          distance: this.cm
        });
      }

      last = degrees;
    });
  });


});


// // Reference
// //
// // http://www.maxbotix.com/pictures/articles/012_Diagram_690X480.jpg

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
