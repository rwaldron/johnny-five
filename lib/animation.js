// TODO list
// Use functions as keyFrames
// Test metronomic on real animation

// Create jquery FX like queue

var ease = require("ease-component"),
  Emitter = require("events").EventEmitter,
  util = require("util"),
  __ = require("../lib/fn.js"),
  temporal;

Animation.DEFAULTS = {
  cuePoints: [0, 1],
  duration: 1000,
  easing: "linear",
  loop: false,
  loopback: 0,
  metronomic: false,
  currentSpeed: 1,
  progress: 0,
  fps: 60,
  rate: 1000 / 60,
  paused: false,
  segments: [],
  onstart: null,
  onpause: null,
  onstop: null,
  oncomplete: null,
  onloop: null
};

/**
 * Placeholders for Symbol
 */
Animation.normalize = "@@normalize";
Animation.render = "@@render";

/**
 * Animation
 * @constructor
 *
 * @param {target} A Servo or Servo.Array to be animated
 *
 * Animating a single servo
 *
 *   var servo = new five.Servo(10);
 *   var animation = new five.Animation(servo);
 *   animation.enqueue({
 *     cuePoints: [0, 0.25, 0.75, 1],
 *     keyFrames: [{degrees: 90}, 60, -120, {degrees: 90}],
 *     duration: 2000
 *   });
 *
 *
 * Animating a servo array
 *
 *   var a = new five.Servo(9),
 *     b = new five.Servo(10);
 *   var servos = new five.Servo.Array([a, b]);
 *   var animation = new five.Animation(servos);
 *   animation.enqueue({
 *     cuePoints: [0, 0.25, 0.75, 1],
 *     keyFrames: [
 *       [{degrees: 90}, 60, -120, {degrees: 90}],
 *       [{degrees: 180}, -120, 90, {degrees: 180}],
 *     ],
 *     duration: 2000
 *   });
 *
 */

function Animation(target) {

  // Necessary to avoid loading temporal unless necessary
  if (!temporal) {
    temporal = require("temporal");
  }

  if (!(this instanceof Animation)) {
    return new Animation(target);
  }

  this.defaultTarget = target;

  __.extend(this, Animation.DEFAULTS);

}

util.inherits(Animation, Emitter);

/**
 * Add an animation segment to the animation queue
 * @param {Object} opts Options: cuePoints, keyFrames, duration,
 *   easing, loop, metronomic, progress, fps, onstart, onpause,
 *   onstop, oncomplete, onloop
 */
Animation.prototype.enqueue = function(opts) {

  if (typeof opts.target === "undefined") {
    opts.target = this.defaultTarget;
  }

  __.defaults(opts, Animation.DEFAULTS);
  this.segments.push(opts);

  if (!this.paused) {
    this.next();
  }

  return this;

};

/**
 * Plays next segment in queue
 * Users need not call this. It's automatic
 */
Animation.prototype.next = function() {

  if (this.segments.length > 0) {

    __.extend(this, this.segments.shift());

    if (this.onstart) {
      this.onstart();
    }

    this.normalizedKeyFrames = __.cloneDeep(this.keyFrames);
    this.normalizedKeyFrames = this.target[Animation.normalize](this.normalizedKeyFrames);
    this.normalizedKeyFrames = this.normalizeKeyframes(this.normalizedKeyFrames, this.cuePoints);

    if (this.reverse) {
      this.currentSpeed *= -1;
    }

    if (this.currentSpeed !== 0) {
      this.play();
    } else {
      this.paused = true;
    }
  } else {
    this.playLoop.stop();
  }

};

/**
 * pause
 *
 * Pause animation while maintaining progress, speed and segment queue
 *
 */

Animation.prototype.pause = function() {

  this.emit("animation:pause");

  this.playLoop.stop();
  this.paused = true;

  if (this.onpause) {
    this.onpause();
  }

};

/**
 * stop
 *
 * Stop all animations
 *
 */

Animation.prototype.stop = function() {

  this.emit("animation:stop");

  this.segments = [];
  temporal.clear();

  if (this.onstop) {
    this.onstop();
  }

};

/**
 * speed
 *
 * Get or set the current playback speed
 *
 * @param {Number} speed
 *
 */

Animation.prototype.speed = function(speed) {

  if (typeof speed === "undefined") {
    return this.currentSpeed;
  } else {
    this.currentSpeed = speed;

    // Find our timeline endpoints and refresh rate
    this.scaledDuration = this.duration / Math.abs(this.currentSpeed);
    this.startTime = Date.now() - this.scaledDuration * this.progress;
    this.endTime = this.startTime + this.scaledDuration;
    return this;
  }
};

/**
 * play
 *
 * Start a segment
 */

Animation.prototype.play = function() {

  if (this.playLoop) {
    this.playLoop.stop();
  }

  this.paused = false;

  // Find our timeline endpoints and refresh rate
  this.scaledDuration = this.duration / Math.abs(this.currentSpeed);
  this.startTime = Date.now() - this.scaledDuration * this.progress;
  this.endTime = this.startTime + this.scaledDuration;

  if (this.fps) {
    this.rate = 1000 / this.fps;
  }

  this.rate = this.rate | 0;

  this.playLoop = temporal.loop(this.rate, function(loop) {
    // Note: "this" is bound to the animation object

    // Find the current timeline progress
    var progress = this.calculateProgress(loop.calledAt);

    // Find the left and right cuePoints/keyFrames;
    var indices = this.findIndices(progress);

    // Get tweened value
    var val = this.tweenedValue(indices, progress);

    // call render function
    this.target[Animation.render](val);

    // See if we have reached the end of the animation
    if ((progress === 1 && !this.reverse) || (progress === this.loopback && this.reverse)) {

      if (this.loop || (this.metronomic && !this.reverse)) {

        if (this.onloop) {
          this.onloop();
        }

        if (this.metronomic) {
          this.reverse = this.reverse ? false : true;
        }

        this.normalizedKeyFrames = __.cloneDeep(this.keyFrames);
        this.normalizedKeyFrames = this.target[Animation.normalize](this.normalizedKeyFrames);
        this.normalizedKeyFrames = this.normalizeKeyframes();

        this.progress = this.loopback;
        this.startTime = Date.now() - this.scaledDuration * this.progress;
        this.endTime = this.startTime + this.scaledDuration;

      } else {

        this.stop();
        if (this.oncomplete) {
          this.oncomplete();
        }
        this.next();

      }
    }

  }.bind(this));

};

Animation.prototype.findIndices = function(progress) {
  var indices = {
    left: null,
    right: null
  };

  // Find our current before and after cuePoints
  indices.right = this.cuePoints.findIndex(function(point) {
    return point >= progress;
  });

  indices.left = indices.right === 0 ? 0 : indices.right - 1;

  return indices;
};

Animation.prototype.calculateProgress = function(calledAt) {
  var progress = (calledAt - this.startTime) / this.scaledDuration;

  if (progress > 1) {
    progress = 1;
  }

  this.progress = progress;

  if (this.reverse) {
    progress = 1 - progress;
  }

  // Ease the timeline
  // to do: When reverse replace inFoo with outFoo and vice versa. skip inOutFoo
  progress = ease[this.easing](progress);

  progress = __.constrain(progress, 0, 1);

  return progress;
};

Animation.prototype.tweenedValue = function(indices, progress) {

  var tween = {
    duration: null,
    progress: null
  };

  var result = this.normalizedKeyFrames.map(function(keyFrame) {
    // Note: "this" is bound to the animation object

    var memberIndices = {
      left: null,
      right: null
    };

    // If the keyframe at indices.left is null, move left
    for (memberIndices.left = indices.left; memberIndices.left > -1; memberIndices.left--) {
      if (keyFrame[memberIndices.left] !== null) {
        break;
      }
    }

    // If the keyframe at indices.right is null, move right
    memberIndices.right = keyFrame.findIndex(function(frame, index) {
      return index >= indices.right && frame !== null;
    });

    // Find our progress for the current tween
    tween.duration = this.cuePoints[memberIndices.right] - this.cuePoints[memberIndices.left];
    tween.progress = (progress - this.cuePoints[memberIndices.left]) / tween.duration;

    // Catch divide by zero
    if (!Number.isFinite(tween.progress)) {
      tween.progress = this.reverse ? 0 : 1;
    }

    var left = keyFrame[memberIndices.left],
    right = keyFrame[memberIndices.right];

    // Apply tween easing to tween.progress
    // to do: When reverse replace inFoo with outFoo and vice versa. skip inOutFoo
    tween.progress = ease[right.easing](tween.progress);

    // Calculate this tween value
    var calcValue;

    if (right.position) {
      // This is a tuple
      calcValue = right.position.map(function(value, index) {
        return (value - left.position[index]) *
        tween.progress + left.position[index];
      });
    } else {
      calcValue = (right.value - left.value) *
      tween.progress + left.value;
    }

    return calcValue;

  }, this);

  return result;
};

// Make sure our keyframes conform to a standard
Animation.prototype.normalizeKeyframes = function() {

  var previousVal,
    keyFrameSet = this.normalizedKeyFrames,
    cuePoints = this.cuePoints;

  // keyFrames can be passed as a single dimensional array if
  // there is just one servo/device. If the first element is not an
  // array, nest keyFrameSet so we only have to deal with one format
  if (!Array.isArray(keyFrameSet[0])) {
    keyFrameSet = [keyFrameSet];
  }

  keyFrameSet.forEach(function(keyFrames) {

    // Pad the right side of keyFrames arrays with null
    for (var i = keyFrames.length; i < cuePoints.length; i++) {
      keyFrames.push(null);
    }

    keyFrames.forEach(function(keyFrame, i, source) {

      if (keyFrame !== null) {

        // keyFrames need to be converted to objects
        if (typeof keyFrame !== "object") {
          keyFrame = {
            step: keyFrame,
            easing: "linear"
          };
        }

        // Replace step values
        if (typeof keyFrame.step !== "undefined") {
          keyFrame.value = keyFrame.step === false ?
            previousVal : previousVal + keyFrame.step;
        }

        // Set a default easing function
        if (!keyFrame.easing) {
          keyFrame.easing = "linear";
        }

        // Copy value from another frame
        if (typeof keyFrame.copyValue !== "undefined") {
          keyFrame.value = source[keyFrame.copyValue].value;
        }

        // Copy everything from another keyframe in this array
        if (keyFrame.copyFrame) {
          keyFrame = source[keyFrame.copyFrame];
        }

        previousVal = keyFrame.value;

      } else {

        if (i === source.length - 1) {
          keyFrame = {
            value: previousVal,
            easing: "linear"
          };
        } else {
          keyFrame = null;
        }

      }
      source[i] = keyFrame;

    }, this);

  });
  return keyFrameSet;
};

module.exports = Animation;
