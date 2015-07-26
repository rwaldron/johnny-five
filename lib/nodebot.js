var Servo = require("../lib/servo.js"),
  __ = require("../lib/fn.js"),
  DIR_TRANSLATION,
  temporal;


function scale(speed, low, high) {
  return Math.floor(__.scale(speed, 0, 5, low, high));
}

DIR_TRANSLATION = {
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

function Movement(move) {
  __.extend(this, move, {
    timestamp: Date.now()
  });
}

Movement.prototype.toString = function() {
  return "<" + [this.timestamp, "L" + this.left, "R" + this.right].join(" ") + ">";
};

/**
 * Nodebot
 * @param {Object} opts Optional properties object
 */

function Nodebot(opts) {

  opts.board = opts.board || null;

  // Boe Nodebot continuous are calibrated to stop at 90°
  this.center = opts.center || 90;

  if (typeof opts.right === "number") {
    opts.right = new Servo({
      board: opts.board,
      pin: opts.right,
      type: "continuous"
    });
  }

  if (typeof opts.left === "number") {
    opts.left = new Servo({
      board: opts.board,
      pin: opts.left,
      type: "continuous"
    });
  }

  // Initialize the right and left cooperative servos
  this.servos = {
    right: opts.right,
    left: opts.left
  };

  // Set the initial servo cooperative direction
  this.direction = {
    right: this.center,
    left: this.center
  };

  // Store the cooperative speed
  this.speed = opts.speed === undefined ? 0 : opts.speed;

  // Used to record a recallable history of movement.
  this.history = [];

  // Initial motion state
  this.motion = "forward";

  // Track directional state
  this.isTurning = false;

  // Garbage hack to avoid including
  if (!temporal) {
    temporal = require("temporal");
  }


  // Wait 10ms, send fwd pulse on, then off to
  // "wake up" the servos
  temporal.wait(10, function() {
    this.fwd(1).fwd(0);
  }.bind(this));
}


Nodebot.DIR_TRANSLATION = DIR_TRANSLATION;

/**
 * move Move the bot in an arbitrary direction
 * @param  {Number} right Speed/Direction of right servo
 * @param  {Number} left  Speed/Direction of left servo
 * @return {Object} this
 */
Nodebot.prototype.move = function(right, left) {

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
    toArguments: function(center, val) {
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
    toArguments: function(center, val) {
      return [val, center - (val - center)];
    }
  }

].forEach(function(dir) {

  var method = function(speed) {
    // Set default direction method
    speed = speed === undefined ? this.speed : speed;

    this.speed = speed;
    this.motion = dir.name;

    return this.move.apply(this,
      dir.toArguments(this.center, scale(speed, this.center, 110))
    );
  };

  Nodebot.prototype[dir.name] = Nodebot.prototype[dir.abbr] = method;
});

/**
 * stop Stops the bot, regardless of current direction
 * @return {Object} this
 */
Nodebot.prototype.stop = function() {
  this.speed = this.center;
  this.motion = "stop";

  return this.move(this.center, this.center);
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
  Nodebot.prototype[dir] = function(time) {

    if (dir === "right") {
      this.move(110, 110);
    } else {
      this.move(70, 70);
    }

    if (time) {
      temporal.wait(time, this[this.motion].bind(this));
    }

    return this;
  };
});


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
Nodebot.prototype.pivot = function(instruct, time) {
  var directions, scaled, expansion;

  scaled = scale(this.speed, this.center, 110);

  // Directions are declared where |this| is in scope
  directions = {
    "forward-right": function() {
      this.move(this.center, scaled);
    },
    "forward-left": function() {
      this.move(this.center - (scaled - this.center), this.center);
    },
    "reverse-right": function() {
      this.move(scaled, this.center);
    },
    "reverse-left": function() {
      this.move(this.center, this.center - (scaled - this.center));
    }
  };

  //
  expansion = this.pivot.translate(instruct);
  instruct = directions[instruct] || directions[expansion];

  // Commence pivot...
  instruct.call(this, this.speed);

  // ...Until... time or 1000ms and then
  temporal.wait(time || 1000, function() {
    this[this.motion](this.speed);
  }.bind(this));

  return this;
};


Nodebot.prototype.pivot.translate = function(instruct) {
  var instructions;

  if (instruct.length === 2) {
    instructions = [instruct[0], instruct[1]];
  }

  if (/\-/.test(instruct)) {
    instructions = instruct.split("-");
  }

  return instructions.map(function(val, i) {
    return DIR_TRANSLATION.translations[i][val];
  }).join("-");
};

module.exports = Nodebot;
