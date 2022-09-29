const {Board, Servo, Servos, Proximity} = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {

  // Collision distance (in)
  const collision = 6;

  // Scanning range (degrees)
  const range = [0, 170];

  // Servo center point (degrees)
  const center = range[1] / 2;

  // Redirection map
  const redirect = {
    left: "right",
    right: "left"
  };

  // Direction to look after releasing scanner lock (degrees)
  const look = {
    forward: center,
    left: 130,
    right: 40
  };

  // Sonar instance (distance detection)
  const proximity = new Proximity({
    controller: "MB1230",
    pin: "A0"
  });

  // Servo instance (panning)
  const scanner = new Servo({
    pin: 12,
    range
  });

  const servos = {
    right: new Servo({
      pin: 10,
      type: "continuous"
    }),
    left: new Servo({
      pin: 11,
      type: "continuous"
    })
  };

  // Starting scanner scanning position (degrees)
  let degrees = 90;

  // Servo scanning steps (degrees)
  let step = 10;

  // Current facing direction
  let facing = "";

  // Scanning state
  let isScanning = true;

  // Initialize the scanner at it's center point
  // Will be exactly half way between the range's
  // lower and upper bound
  scanner.center();

  servos.right.to(90);
  servos.left.to(90);

  // Scanner/Panning loop
  board.loop(100, () => {
    let bounds;

    bounds = {
      left: center + 10,
      right: center - 10
    };

    // During course change, scanning is paused to avoid
    // overeager redirect instructions[1]
    if (isScanning) {
      // Calculate the next step position
      if (degrees >= scanner.range[1] || degrees === scanner.range[0]) {
        step *= -1;
      }

      // Update the position in degrees
      degrees += step;

      // The following three conditions will help determine
      // which way the bot should turn if a potential collision
      // may occur in the proximity "change" event handler[2]
      if (degrees > bounds.left) {
        facing = "left";
      }

      if (degrees < bounds.right) {
        facing = "right";
      }

      if (degrees > bounds.right && degrees < bounds.left) {
        facing = "forward";
      }

      scanner.to(degrees);
    }
  });

  // [2] Sonar "change" events are emitted when the value of a
  // distance reading has changed since the previous reading
  //
  proximity.on("change", () => {
    let turnTo;

    // Detect collision
    if (Math.abs(proximity.in) < collision && isScanning) {

      // Scanning lock will prevent multiple collision detections
      // of the same obstacle
      isScanning = false;
      turnTo = redirect[facing] || Object.keys(redirect)[Date.now() % 2];

      // Log collision detection to REPL
      console.log(`${Date.now()}
Collision detected ${proximity.in} in away.
Turning ${turnTo.toUpperCase()} to avoid`);

      // Override the next scan position (degrees)
      // degrees = look[ turnTo ];

      // [1] Allow 1000ms to pass and release the scanning lock
      // by setting isScanning state to true.
      board.wait(1500, () => {
        console.log("Release Scanner Lock");
        isScanning = true;
      });
    }
  });
});


// Reference
//
// http://www.maxbotix.com/pictures/articles/012_Diagram_690X480.jpg
