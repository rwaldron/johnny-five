const Emitter = require("events");
const ease = require("./easing");
const { cloneDeep, constrain } = require("./fn");
let temporal;

// TODO list
// Use functions as keyFrames
// Test metronomic on real animation
// Create jquery FX like queue

/**
 * The max time we want to allow a temporal animation segment to run.
 * When running, temporal can push CPU utilization to 100%. When this
 * time (in ms) is reached we will fall back to setInterval which is less
 * accurate (by nanoseconds) but perfectly serviceable.
 **/
let temporalTTL = 5000;

/**
 * Animation
 * @constructor
 *
 * @param {target} A Servo or Servo.Collection to be animated
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
 *   var servos = new five.Servo.Collection([a, b]);
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

class Animation extends Emitter {
  constructor(target) {
    super();

    // Necessary to avoid loading temporal unless necessary
    if (!temporal) {
      temporal = require("temporal");
    }

    Object.assign(this, new Animation.Segment());

    this.defaultTarget = target || {};
  }
  /**
   * Add an animation segment to the animation queue
   * @param {Object} options Options: cuePoints, keyFrames, duration,
   *   easing, loop, metronomic, progress, fps, onstart, onpause,
   *   onstop, oncomplete, onloop
   */
  enqueue(options = {}) {
    /* istanbul ignore else */
    if (typeof options.target === "undefined") {
      options.target = this.defaultTarget;
    }

    this.segments.push(options);

    /* istanbul ignore if */
    if (!this.paused && !this.isRunning) {
      this.next();
    }

    return this;
  }

  /**
   * Plays next segment in queue
   * Users need not call this. It's automatic
   */
  next() {

    if (this.isRunning) {
      return this;
    } else {
      this.isRunning = true;
    }

    if (this.segments.length > 0) {
      Object.assign(this, new Animation.Segment(this.segments.shift()));
      this.paused = this.currentSpeed === 0 ? true : false;

      if (this.onstart) {
        this.onstart();
      }

      this.normalizeKeyframes();

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

    return this;
  }

  /**
   * pause
   *
   * Pause animation while maintaining progress, speed and segment queue
   *
   */
  pause() {

    this.emit("animation:pause");

    if (this.playLoop) {
      this.playLoop.stop();
    }
    this.paused = true;

    if (this.onpause) {
      this.onpause();
    }

  }

  /**
   * stop
   *
   * Stop all animations
   *
   */
  stop() {

    this.emit("animation:stop");

    this.segments = [];
    this.isRunning = false;
    if (this.playLoop) {
      this.playLoop.stop();
    }

    if (this.onstop) {
      this.onstop();
    }

  }

  /**
   * speed
   *
   * Get or set the current playback speed
   *
   * @param {Number} speed
   *
   */
  speed(speed) {

    if (typeof speed === "undefined") {
      return this.currentSpeed;
    } else {
      this.currentSpeed = speed;

      // Find our timeline endpoints and refresh rate
      this.scaledDuration = this.duration / Math.abs(this.currentSpeed);
      this.startTime = Date.now() - this.scaledDuration * this.progress;
      this.endTime = this.startTime + this.scaledDuration;

      if (!this.paused) {
        this.play();
      }
      return this;
    }
  }

  /**
   * This function is called in each frame of our animation
   * Users need not call this. It's automatic
   */
  loopFunction({calledAt}) {

    // Find the current timeline progress
    const progress = this.calculateProgress(calledAt);

    // Find the left and right cuePoints/keyFrames;
    const indices = this.findIndices(progress);

    // call render function with tweened value
    this.target[Animation.render](this.tweenedValue(indices, progress));

    /**
     * If this animation has been running in temporal for too long
     * fall back to using setInterval so we don't melt the user's CPU
     **/
    if (calledAt > this.fallBackTime) {
      this.fallBackTime = Infinity;
      if (this.playLoop) {
        this.playLoop.stop();
      }
      this.playLoop = new Animation.TemporalFallback(this);
    }

    // See if we have reached the end of the animation
    /* istanbul ignore else */
    if ((this.progress === 1 && !this.reverse) || (progress === this.loopback && this.reverse)) {

      if (this.loop || (this.metronomic && !this.reverse)) {

        if (this.onloop) {
          this.onloop();
        }

        if (this.metronomic) {
          this.reverse = this.reverse ? false : true;
        }

        this.normalizeKeyframes();
        this.progress = this.loopback;
        this.startTime = Date.now() - this.scaledDuration * this.progress;
        this.endTime = this.startTime + this.scaledDuration;
      } else {

        this.isRunning = false;

        if (this.oncomplete) {
          process.nextTick(() => this.oncomplete());
        }

        if (this.segments.length > 0) {
          process.nextTick(() => this.next());
        } else {
          this.stop();
        }
      }
    }
  }

  /**
   * play
   *
   * Start a segment
   */
  play() {
    const now = Date.now();

    if (this.playLoop) {
      this.playLoop.stop();
    }

    this.paused = false;
    this.isRunning = true;

    // Find our timeline endpoints and refresh rate
    this.scaledDuration = this.duration / Math.abs(this.currentSpeed);
    this.startTime = now - this.scaledDuration * this.progress;
    this.endTime = this.startTime + this.scaledDuration;

    // If our animation runs for more than 5 seconds switch to setTimeout
    this.fallBackTime = now + temporalTTL;
    this.frameCount = 0;

    /* istanbul ignore else */
    if (this.fps) {
      this.rate = 1000 / this.fps;
    }

    this.rate = this.rate | 0;

    this.playLoop = temporal.loop(this.rate, data => this.loopFunction(data));
  }

  findIndices(progress) {
    const indices = {
      left: null,
      right: null
    };

    // Find our current before and after cuePoints
    indices.right = this.cuePoints.findIndex(point => point >= progress);
    indices.left = indices.right === 0 ? /* istanbul ignore next */ 0 : indices.right - 1;

    return indices;
  }

  calculateProgress(calledAt) {

    let progress = (calledAt - this.startTime) / this.scaledDuration;

    if (progress > 1) {
      progress = 1;
    }

    this.progress = progress;

    if (this.reverse) {
      progress = 1 - progress;
    }

    // Ease the timeline
    // to do: When reverse replace inFoo with outFoo and vice versa. skip inOutFoo
    return constrain(ease[this.easing](progress), 0, 1);
  }

  tweenedValue(indices, progress) {

    const tween = {
      duration: null,
      progress: null
    };

    const result = this.normalizedKeyFrames.map(keyFrame => {
      const kIndices = {
        left: null,
        right: null
      };

      // If the keyframe at indices.left is null, move left
      for (kIndices.left = indices.left; kIndices.left > -1; kIndices.left--) {
        /* istanbul ignore else */
        if (keyFrame[kIndices.left] !== null) {
          break;
        }
      }

      // If the keyframe at indices.right is null, move right
      kIndices.right = keyFrame.findIndex((frame, index) =>
        index >= indices.right && frame !== null
      );

      // Find our progress for the current tween
      tween.duration = this.cuePoints[kIndices.right] - this.cuePoints[kIndices.left];
      tween.progress = (progress - this.cuePoints[kIndices.left]) / tween.duration;

      // Catch divide by zero
      if (!Number.isFinite(tween.progress)) {
        /* istanbul ignore next */
        tween.progress = this.reverse ? 0 : 1;
      }

      const left = keyFrame[kIndices.left];
      const right = keyFrame[kIndices.right];

      // Apply tween easing to tween.progress
      // to do: When reverse replace inFoo with outFoo and vice versa. skip inOutFoo
      tween.progress = ease[right.easing](tween.progress);

      // Calculate this tween value
      let calcValue;

      if (right.position) {
        // This is a tuple
        calcValue = right.position.map((value, index) => (value - left.position[index]) *
          tween.progress + left.position[index]);
      } else {
        if (typeof right.value === "number" && typeof left.value === "number") {
          calcValue = (right.value - left.value) * tween.progress + left.value;
        } else {
          calcValue = this.target[Animation.keys].reduce((accum, key) => {
            accum[key] = (right.value[key] - left.value[key]) * tween.progress + left.value[key];
            return accum;
          }, {});
        }
      }

      return calcValue;
    });

    return result;
  }

  // Make sure our keyframes conform to a standard
  normalizeKeyframes() {
    let previousVal;
    let keyFrameSet = cloneDeep(this.keyFrames);
    const cuePoints = this.cuePoints;

    // Run through the target's normalization
    keyFrameSet = this.target[Animation.normalize](keyFrameSet);

    // keyFrames can be passed as a single dimensional array if
    // there is just one servo/device. If the first element is not an
    // array, nest keyFrameSet so we only have to deal with one format
    if (!Array.isArray(keyFrameSet[0])) {
      keyFrameSet = [keyFrameSet];
    }

    keyFrameSet.forEach(function(keyFrames) {

      // Pad the right side of keyFrames arrays with null
      for (let i = keyFrames.length; i < cuePoints.length; i++) {
        keyFrames.push(null);
      }

      keyFrames.forEach((keyFrame, i, source) => {

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
          /* istanbul ignore if */
          if (typeof keyFrame.copyValue !== "undefined") {
            keyFrame.value = source[keyFrame.copyValue].value;
          }

          // Copy everything from another keyframe in this array
          /* istanbul ignore if */
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

    this.normalizedKeyFrames = keyFrameSet;

    return this;
  }
}


/**
 * Placeholders for Symbol
 */
Animation.keys = "@@keys";
Animation.normalize = "@@normalize";
Animation.render = "@@render";

/**
 * Temporal will run up the CPU. temporalFallback is used
 * for long running animations.
 */
Animation.TemporalFallback = class {
  constructor(animation) {
    this.interval = setInterval(() => {
      animation.loopFunction({
        calledAt: Date.now()
      });
    }, animation.rate);
  }
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
};


/**
 * Animation.Segment()
 *
 * Create a defaulted segment.
 *
 * Every property ever used on an animation segment
 * MUST be listed here, otherwise properties will
 * persist across segments. This default object is
 * primarily for resetting state.
 *
 */
Animation.Segment = class {
  constructor(options) {
    this.cuePoints = [0, 1];
    this.duration = 1000;
    this.easing = "linear";
    this.loop = false;
    this.loopback = 0;
    this.metronomic = false;
    this.currentSpeed = 1;
    this.progress = 0;
    this.fps = 60;
    this.rate = 1000 / 60;
    this.paused = false;
    this.isRunning = false;
    this.segments = [];
    this.onstart = null;
    this.onpause = null;
    this.onstop = null;
    this.oncomplete = null;
    this.onloop = null;

    if (options) {
      Object.assign(this, options);

      if (options.segments) {
        this.segments = options.segments.slice();
      }
    }
  }
};

module.exports = Animation;
