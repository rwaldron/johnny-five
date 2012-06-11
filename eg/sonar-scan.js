var five = require("../lib/johnny-five.js"),
    board;

board = new five.Board();

board.on("ready", function() {
  var center, collision, degrees, step, facing,
  range, redirect, look, isScanning, scanner, sonar, servos;

  // Collision distance (inches)
  collision = 6;

  // Starting scanner scanning position (degrees)
  degrees = 90;

  // Servo scanning steps (degrees)
  step = 10;

  // Current facing direction
  facing = "";

  // Scanning range (degrees)
  range = [ 0, 170 ];

  // Servo center point (degrees)
  center = range[ 1 ] / 2;

  // Redirection map
  redirect = {
    left: "right",
    right: "left"
  };

  // Direction to look after releasing scanner lock (degrees)
  look = {
    forward: center,
    left: 130,
    right: 40
  };

  // Scanning state
  isScanning = true;

  // Sonar instance (distance detection)
  sonar = new five.Sonar("A2");
  // Servo instance (panning)
  scanner = new five.Servo({
    pin: 12,
    range: range
  });

  servos = {
    right: new five.Servo({ pin: 10, type: "continuous" }),
    left: new five.Servo({ pin: 11, type: "continuous" })
  };

  // Initialize the scanner at it's center point
  // Will be exactly half way between the range's
  // lower and upper bound
  scanner.center();

  servos.right.move(90);
  servos.left.move(90);

  // Scanner/Panning loop
  this.loop( 100, function() {
    var bounds;

    bounds = {
      left: center + 10,
      right: center - 10
    };

    // During course change, scanning is paused to avoid
    // overeager redirect instructions[1]
    if ( isScanning ) {
      // Calculate the next step position
      if ( degrees >= scanner.range[1] || degrees === scanner.range[0] ){
        step *= -1;
      }

      // Update the position in degrees
      degrees += step;

      // The following three conditions will help determine
      // which way the bot should turn if a potential collision
      // may occur in the sonar "change" event handler[2]
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

  // [2] Sonar "change" events are emitted when the value of a
  // distance reading has changed since the previous reading
  //
  sonar.on("change", function( err ) {
    var turnTo;

    // Detect collision
    if ( Math.abs(this.inches) < collision && isScanning ) {
      // Scanning lock will prevent multiple collision detections
      // of the same obstacle
      isScanning = false;
      turnTo = redirect[ facing ] || Object.keys( redirect )[ Date.now() % 2 ];

      // Log collision detection to REPL
      console.log(
        [ Date.now(),
          "Collision detected " + this.inches + " inches away.",
          "Turning " + turnTo.toUpperCase() + " to avoid"
        ].join("\n")
      );

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


// Reference
//
// http://www.maxbotix.com/pictures/articles/012_Diagram_690X480.jpg
