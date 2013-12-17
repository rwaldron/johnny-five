var five = require("../lib/johnny-five.js"),
  __ = require("../lib/fn.js"),
  board, Navigator, navigator, servos,
  pivotExpansion, directionMap, scale;


directionMap = {
  reverse: {
    right: "left",
    left: "right",
    fwd: "rev",
    rev: "fwd"
  },
  translations: [{
    f: "forward",
    r: "reverse",
    fwd: "forward",
    rev: "reverse"
  }, {
    r: "right",
    l: "left"
  }]
};

scale = function(speed, low, high) {
  return Math.floor(five.Fn.map(speed, 0, 5, low, high));
};


/**
 * Navigator
 * @param {Object} opts Optional properties object
 */

function Navigator(opts) {

  // Boe Navigator continuous are calibrated to stop at 90°
  this.center = opts.center || 90;

  // Initialize the right and left cooperative servos
  this.servos = {
    right: new five.Servo({
      pin: opts.right,
      type: "continuous"
    }),
    left: new five.Servo({
      pin: opts.left,
      type: "continuous"
    })
  };

  // Set the initial servo cooperative direction
  this.direction = opts.direction || {
    right: this.center,
    left: this.center
  };

  this.compass = opts.compass || null;
  this.gripper = opts.gripper || null;

  // Store the cooperative speed
  this.speed = opts.speed === undefined ? 0 : opts.speed;

  // Store a recallable history of movement
  // TODO: Include in savable history
  this.history = [];

  // Initial direction
  this.which = "forward";

  // Track directional state
  this.isTurning = false;

  // Wait 10ms, send fwd pulse on, then off to
  // "wake up" the servos
  setTimeout(function() {
    this.fwd(1).fwd(0);
  }.bind(this), 10);
}


Navigator.DIR_MAP = directionMap;

/**
 * move Move the bot in an arbitrary direction
 * @param  {Number} right Speed/Direction of right servo
 * @param  {Number} left  Speed/Direction of left servo
 * @return {Object} this
 */
Navigator.prototype.move = function(right, left) {

  // Quietly ignore duplicate instructions
  if (this.direction.right === right &&
    this.direction.left === left) {
    return this;
  }

  // Cooperative servo motion.
  // Servos are mounted opposite of each other,
  // the values for left and right will be in
  // opposing directions.
  this.servos.right.to(right);
  this.servos.left.to(left);

  // Push a record object into the history
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


[
  /**
   * forward Move the bot forward
   * fwd Move the bot forward
   *
   * @param  {Number} 0-5, 0 is stopped, 5 is fastest
   * @return {Object} this
   */
  {
    name: "forward",
    abbr: "fwd",
    args: function(center, val) {
      return [center - (val - center), val];
    }
  },

  /**
   * reverse Move the bot in reverse
   * rev Move the bot in reverse
   *
   * @param  {Number}0-5, 0 is stopped, 5 is fastest
   * @return {Object} this
   */
  {
    name: "reverse",
    abbr: "rev",
    args: function(center, val) {
      return [val, center - (val - center)];
    }
  }

].forEach(function(dir) {

  var method = function(speed) {
    // Set default direction method
    speed = speed === undefined ? 1 : speed;

    this.speed = speed;
    this.which = dir.name;

    return this.move.apply(this,
      dir.args(this.center, scale(speed, this.center, 110))
    );
  };

  Navigator.prototype[dir.name] = Navigator.prototype[dir.abbr] = method;
});

/**
 * stop Stops the bot, regardless of current direction
 * @return {Object} this
 */
Navigator.prototype.stop = function() {
  this.speed = this.center;
  this.which = "stop";

  return this.to(this.center, this.center);
};


[
  /**
   * right Turn the bot right
   * @return {Object} this
   */
  "right",

  /**
   * left Turn the bot left
   * @return {Object} this
   */
  "left"

].forEach(function(dir) {
  Navigator.prototype[dir] = function(time) {

    // Use direction value and reverse direction map to
    // derive the direction values for moving the
    // cooperative servos
    var actual = this.direction[directionMap.reverse[dir]];

    time = time || 500;

    if (!this.isTurning) {
      // Set turning lock
      this.isTurning = true;

      // Send turning command
      this.to(actual, actual);

      // Cap turning time
      setTimeout(function() {

        // Restore direction after turn
        this[this.which](this.speed || 2);

        // Release turning lock
        this.isTurning = false;

      }.bind(this), time);
    }

    return this;
  };
});

pivotExpansion = function(which) {
  var parts;

  if (which.length === 2) {
    parts = [which[0], which[1]];
  }

  if (/\-/.test(which)) {
    parts = which.split("-");
  }

  return parts.map(function(val, i) {
    console.log(val);
    return directionMap.translations[i][val];
  }).join("-");
};


/**
 * pivot Pivot the bot with combo directions:
 * rev Move the bot in reverse
 *
 * @param  {String} which Combination directions:
 *                        "forward-right", "forward-left",
 *                        "reverse-right", "reverse-left"
 *                        (aliased as: "f-l", "f-r", "r-r", "r-l")
 *
 * @return {Object} this
 */
Navigator.prototype.pivot = function(which, time) {
  var actual, directions, scaled;

  scaled = scale(this.speed, this.center, 110);

  directions = {
    "forward-right": function() {
      this.to(this.center, scaled);
    },
    "forward-left": function() {
      this.to(this.center - (scaled - this.center), this.center);
    },
    "reverse-right": function() {
      this.to(scaled, this.center);
    },
    "reverse-left": function() {
      this.to(this.center, this.center - (scaled - this.center));
    }
  };

  which = directions[which] || directions[pivotExpansion(which)];

  which.call(this, this.speed);

  setTimeout(function() {

    this[this.which](this.speed);

  }.bind(this), time || 1000);

  return this;
};




// Begin program when the board, serial and
// firmata are connected and ready

(board = new five.Board()).on("ready", function() {

  // TODO: Refactor into modular program code

  var center, collideAt, degrees, step, facing,
    range, laser, look, isScanning, scanner, gripper, isGripping, sonar, gripAt, ping, mag, bearing;

  // Collision distance (inches)
  collideAt = 6;

  gripAt = 2;

  // Servo scanning steps (degrees)
  step = 2;

  // Current facing direction
  facing = "";

  // Scanning range (degrees)
  range = [10, 170];

  // Servo center point (degrees)
  center = ((range[1] - range[0]) / 2) + range[0];

  // Starting scanner scanning position (degrees)
  degrees = center;

  // Direction to look after releasing scanner lock (degrees)
  // look = {
  //   forward: center,
  //   left: 130,
  //   right: 40
  // };

  // Scanning state
  isScanning = true;

  // Gripping state
  isGripping = false;

  // compass/magnetometer
  mag = new five.Magnetometer();

  // Servo gripper
  gripper = new five.Gripper({
    servo: {
      pin: 13,
      range: [20, 160]
    },
    scale: [0, 10]
  });

  // New base navigator
  // right servo = pin 10, left servo = pin 11
  navigator = new Navigator({
    right: 10,
    left: 11,
    compass: mag,
    gripper: gripper
  });

  // The laser is just a special case Led
  laser = new five.Led(9);

  // Digital PWM (range)
  ping = new five.Ping(7);

  // Analog Voltage (range)
  // sonar = new five.Sonar("A0");


  // Servo scanner instance (panning)
  scanner = new five.Servo({
    pin: 12,
    range: range
  });


  // Inject navigator object into REPL
  this.repl.inject({
    b: navigator,
    g: gripper
  });


  // Initialize the scanner at it's center point
  // Will be exactly half way between the range's
  // lower and upper bound
  scanner.center();

  // Wait 1000ms, then initialize forward movement
  this.wait(1000, function() {
    // navigator.fwd(3);
  });


  // Scanner/Panning loop
  this.loop(50, function() {
    var bounds;

    bounds = {
      left: center + 15, //center + 10,
      right: center - 15 //center - 10
    };

    // During course change, scanning is paused to avoid
    // overeager redirect instructions[1]
    if (isScanning) {
      // Calculate the next step position
      if (degrees >= scanner.range[1] || degrees <= scanner.range[0]) {
        step *= -1;
      }

      // Update the position in degrees
      degrees += step;

      // The following three conditions will help determine
      // which way the navigator should turn if a potential collideAt
      // may occur in the ping "change" event handler[2]
      if (degrees > bounds.left) {
        facing = "left";
      }

      if (degrees < bounds.right) {
        facing = "right";
      }

      // if ( degrees > bounds.right && degrees < bounds.left ) {
      if (__.range(bounds.right, bounds.left).indexOf(degrees) > -1) {
        facing = "fwd";
      }


      scanner.to(degrees);
    }
  });

  // sonar.on("change", function() {
  // ping.on("change", function() {
  //   var distance = Math.abs(this.inches);

  //   // TODO: Wrap this behaviour in an abstraction
  //   if ( distance <= collideAt && !isGripping ) {
  //     gripper.max();

  //     // simulate drop instruction
  //     setTimeout(function() {
  //       isGripping = false;
  //       gripper.min();
  //     }, 5000);
  //   }
  // });

  // Compass heading monitor
  // mag.on("headingchange", function() {

  //   if ( !/[\-by]/.test(this.bearing.name) && this.bearing.name !== bearing ) {
  //     bearing = this.bearing.name;

  //     console.log( this.bearing );
  //   }
  // });

  // [2] ping "change" events are emitted when the value of a
  // distance reading has changed since the previous reading
  //
  // TODO: Avoid false positives?
  ping.on("data", function(err) {
    var release = 750,
      distance = Math.abs(this.inches),
      isReverse = false,
      turnTo;

    if (navigator.isTurning) {
      return;
    }

    // If distance value is null or NaN
    if (distance === null || isNaN(distance)) {
      return;
    }



    // Detect collideAt
    // && isScanning
    if (distance <= collideAt && isScanning) {

      laser.strobe();

      // Scanning lock will prevent multiple collideAt
      // detections piling up for the same obstacle
      isScanning = false;

      // Determine direction to turn
      turnTo = Navigator.DIR_MAP.reverse[facing];

      // Set reversal flag.
      isReverse = turnTo === "rev";

      // Log collideAt detection to REPL
      console.log(
        [Date.now(),
          "\tCollision detected " + this.inches + " inches away.",
          "\tTurning " + turnTo.toUpperCase() + " to avoid"
        ].join("\n")
      );

      // Turn the navigator
      navigator[turnTo](navigator.speed);


      if (isReverse) {
        release = 1500;
      }

      // [1] Allow Nms to pass and release the scanning lock
      // by setting isScanning state to true.
      board.wait(release, function() {
        console.log("Release Scanner Lock");

        degrees = 89;

        scanner.center();

        if (isReverse) {
          // navigator.fwd( navigator.speed );
          navigator.pivot("reverse-right");
          navigator.which = "fwd";
        }

        laser.brightness(0);
        isScanning = true;
      });
    }
  });
});


// References
//
// http://www.maxbotix.com/documents/MB1010_Datasheet.pdf
