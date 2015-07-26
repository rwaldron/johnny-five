var five = require("../lib/johnny-five.js"),
  board, Navigator, bot, left, right, sonar, scanner, servos,
  expandWhich, reverseDirMap, scale;

reverseDirMap = {
  right: "left",
  left: "right"
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
Navigator.prototype.move = function(right, left) {

  // Quietly ignore duplicate instructions
  if (this.direction.right === right &&
    this.direction.left === left) {
    return this;
  }

  // Servos are mounted opposite of each other,
  // the values for left and right will be in
  // opposing directions.
  this.servos.right.to(right);
  this.servos.left.to(left);

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
Navigator.prototype.forward = Navigator.prototype.fwd = function(speed) {
  speed = speed == null ? 1 : speed;

  var scaled = scale(speed, this.center, 110);

  this.speed = speed;
  this.which = "forward";

  return this.to(this.center - (scaled - this.center), scaled);
};

/**
 * reverse Move the bot in reverse
 * rev Move the bot in reverse
 *
 * @param  {Number}0-5, 0 is stopped, 5 is fastest
 * @return {Object} this
 */
Navigator.prototype.reverse = Navigator.prototype.rev = function(speed) {
  speed = speed == null ? 1 : speed;

  var scaled = scale(speed, this.center, 110);

  this.speed = speed;
  this.which = "reverse";

  console.log(scaled, this.center - (scaled - this.center));

  return this.to(scaled, this.center - (scaled - this.center));
};

/**
 * stop Stops the bot, regardless of current direction
 * @return {Object} this
 */
Navigator.prototype.stop = function() {
  this.speed = this.center;
  this.which = "stop";

  return this.to(this.center, this.center);
};

/**
 * right Turn the bot right
 * @return {Object} this
 */

/**
 * left Turn the bot lefts
 * @return {Object} this
 */


["right", "left"].forEach(function(dir) {
  Navigator.prototype[dir] = function() {
    var actual = this.direction[reverseDirMap[dir]];

    if (!this.isTurning) {
      this.isTurning = true;
      this.to(actual, actual);

      // Restore direction after turn
      setTimeout(function() {

        this[this.which](this.speed);
        this.isTurning = false;

      }.bind(this), 750);
    }

    return this;
  };
});

expandWhich = function(which) {
  var parts, translations;

  translations = [{
    f: "forward",
    r: "reverse",
    fwd: "forward",
    rev: "reverse"
  }, {
    r: "right",
    l: "left"
  }];

  if (which.length === 2) {
    parts = [which[0], which[1]];
  }

  if (!parts.length && /\-/.test(which)) {
    parts = which.split("-");
  }

  return parts.map(function(val, i) {
    return translations[i][val];
  }).join("-");
};

Navigator.prototype.pivot = function(which, time) {
  var actual, directions, scaled;

  scaled = scale(this.speed, this.center, 110);
  which = expandWhich(which);

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

  directions[which].call(this, this.speed);

  setTimeout(function() {

    this[this.which](this.speed);

  }.bind(this), time || 1000);

  return this;
};


board = new five.Board();
board.on("ready", function() {

  sonar = new five.Sonar({
    pin: "A2",
    freq: 100
  });
  sonar.on("change", function() {
    console.log("Object is " + this.inches + "inches away");
  });

  scanner = new five.Servo(12);
  scanner.sweep();

  this.repl.inject({
    // create a bot, right servo = pin 10, left servo = pin 11
    b: new Navigator({
      right: 10,
      left: 11
    })
  });
});
