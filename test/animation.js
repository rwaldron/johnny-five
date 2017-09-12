require("./common/bootstrap");

exports["Animation -- Servo"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.servoWrite = this.sandbox.spy(MockFirmata.prototype, "servoWrite");

    this.a = new Servo({
      pin: 3,
      board: this.board
    });

    this.b = new Servo({
      pin: 5,
      board: this.board,
      startAt: 20
    });

    this.c = new Servo({
      pin: 6,
      board: this.board
    });

    this.chain = {
      result: [],
      "@@render": function(args) {
        this.result = this.result.concat(args);
      },
      "@@normalize": function(keyFrames) {
        var last = [50, 0, -20];

        // If user passes null as the first element in keyFrames use current position
        if (keyFrames[0] === null) {
          keyFrames[0] = {
            position: last
          };
        }

        return keyFrames;
      }
    };

    this.servos = new Servo.Collection([this.a, this.b, this.c]);

    this.segment = {
      single: {
        duration: 500,
        fps: 10,
        cuePoints: [0, 0.33, 0.66, 1.0],
        keyFrames: [null, false, {
          degrees: 45
        }, 33],
        paused: true
      },
      multi: {
        duration: 500,
        fps: 10,
        cuePoints: [0, 0.33, 0.66, 1.0],
        keyFrames: [
          [null, false, {
            degrees: 45
          }, 33],
          [null, 46, {
            degrees: 180
          }, -120],
          [null, {
            degrees: 120
          }, {
            step: 60
          }]
        ],
        paused: true
      }
    };

    this.proto = [{
      name: "enqueue"
    }, {
      name: "pause"
    }, {
      name: "next"
    }, {
      name: "stop"
    }, {
      name: "play"
    }, {
      name: "speed"
    }];

    this.instance = [{
      name: "defaultTarget"
    }, {
      name: "segments"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.animation = new Animation(this.a);

    this.proto.forEach(function(method) {
      test.equal(typeof this.animation[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.animation[property.name], "undefined");
    }, this);

    test.done();
  },

  normalizeServo: function(test) {
    test.expect(4);

    var segment = this.segment.single;

    this.animation = new Animation(this.a);
    this.animation.enqueue(segment);

    this.animation.normalizeKeyframes();

    test.equal(this.animation.normalizedKeyFrames[0][0].value, 90);
    test.equal(this.animation.normalizedKeyFrames[0][1].value, 90);
    test.equal(this.animation.normalizedKeyFrames[0][2].value, 45);
    test.equal(this.animation.normalizedKeyFrames[0][3].value, 78);
    test.done();
  },

  normalizeServoCollection: function(test) {

    this.animation = new Animation(this.servos);
    test.expect(12);

    var segment = this.segment.multi;

    this.animation.enqueue(segment);

    this.animation.normalizeKeyframes();

    test.equal(this.animation.normalizedKeyFrames[0][0].value, 90);
    test.equal(this.animation.normalizedKeyFrames[0][1].value, 90);
    test.equal(this.animation.normalizedKeyFrames[0][2].value, 45);
    test.equal(this.animation.normalizedKeyFrames[0][3].value, 78);
    test.equal(this.animation.normalizedKeyFrames[1][0].value, 20);
    test.equal(this.animation.normalizedKeyFrames[1][1].value, 66);
    test.equal(this.animation.normalizedKeyFrames[1][2].value, 180);
    test.equal(this.animation.normalizedKeyFrames[1][3].value, 60);
    test.equal(this.animation.normalizedKeyFrames[2][0].value, 90);
    test.equal(this.animation.normalizedKeyFrames[2][1].value, 120);
    test.equal(this.animation.normalizedKeyFrames[2][2].value, 180);
    test.equal(this.animation.normalizedKeyFrames[2][3].value, 180);

    test.done();

  },

  rightPadKeyframes: function(test) {
    this.animation = new Animation(this.servos);
    test.expect(6);

    var segment = this.segment.multi;
    segment.keyFrames = [this.segment.multi.keyFrames[0]];

    this.animation.enqueue(segment);

    this.animation.normalizeKeyframes();

    test.equal(this.animation.normalizedKeyFrames[0][0].value, 90);
    test.equal(this.animation.normalizedKeyFrames[0][1].value, 90);
    test.equal(this.animation.normalizedKeyFrames[0][2].value, 45);
    test.equal(this.animation.normalizedKeyFrames[0][3].value, 78);
    test.equal(this.animation.normalizedKeyFrames[1], null);
    test.equal(this.animation.normalizedKeyFrames[2], null);

    test.done();
  },

  progress: function(test) {
    this.animation = new Animation(this.a);
    test.expect(2);

    var segment = this.segment.single;

    segment.progress = 0.4;

    this.animation.enqueue(segment);

    test.ok(Math.abs(this.animation.playLoop.calledAt - this.animation.startTime - 200) < 5);
    test.ok(Math.abs(this.animation.endTime - this.animation.playLoop.calledAt - 300) < 5);
    test.done();

  },

  reverse: function(test) {

    this.animation = new Animation(this.a);
    test.expect(2);

    var segment = this.segment.single,
      testContext = this;

    segment.reverse = true;
    segment.progress = 0.9;

    this.animation.enqueue(segment);

    var indices = this.animation.findIndices(0.4);
    var val = this.animation.tweenedValue(indices, 0.4);

    this.animation.target["@@render"](val);
    test.equal(testContext.servoWrite.args[1][0], 3);
    test.equal(testContext.servoWrite.args[1][1], 1373);

    test.done();
  },

  timelineEasing: function(test) {

    this.animation = new Animation(this.a);
    test.expect(1);

    var segment = this.segment.single;

    segment.easing = "inOutCirc";
    segment.progress = 0.8;
    this.animation.enqueue(segment);

    var progress = this.animation.calculateProgress(this.animation.playLoop.calledAt);

    test.ok(Math.abs(progress - 0.958 < 0.01));
    test.done();

  },

  keyframeEasing: function(test) {
    // Don't allow time to advance in this test.  Otherwise it's possible for
    // the animation to progress between setup and the assertion, causing flaky
    // failures.
    this.sandbox.useFakeTimers();
    this.animation = new Animation(this.a);
    test.expect(1);

    var segment = this.segment.single;

    segment.keyFrames[3] = {
      step: 33,
      easing: "inOutCirc"
    };
    segment.progress = 0.9;
    this.animation.enqueue(segment);

    var progress = this.animation.calculateProgress(this.animation.playLoop.calledAt);
    var indices = this.animation.findIndices(progress);
    var val = this.animation.tweenedValue(indices, progress);

    test.ok(Math.abs(val - 74.843) < 0.01,
      "Expected " + val + " to be within 0.01 of 74.843");
    test.done();
  },

  additiveEasing: function(test) {

    this.animation = new Animation(this.a);
    test.expect(1);

    var segment = this.segment.single;

    segment.easing = "inOutCirc";
    segment.keyFrames[3] = {
      step: 33,
      easing: "inOutCirc"
    };
    segment.progress = 0.9;
    this.animation.enqueue(segment);

    var progress = this.animation.calculateProgress(this.animation.playLoop.calledAt);
    var indices = this.animation.findIndices(progress);
    var val = this.animation.tweenedValue(indices, progress);

    test.ok(Math.abs(val - 77.970 < 0.01));
    test.done();

  },

  tweenTuple: function(test) {

    this.animation = new Animation(this.chain);

    test.expect(3);

    var segment = this.segment.multi;

    segment.keyFrames = [null, {
      position: [60, 10, 10]
    }, null, {
      position: [10, 40, 20]
    }, {
      position: [10, 80, 20]
    }, {
      position: [50, 60, -20]
    }];
    segment.cuePoints = [0, 0.3, 0.4, 0.5, 0.8, 1.0];

    segment.progress = 0.9;
    this.animation.enqueue(segment);

    var indices = this.animation.findIndices(0.9);
    var tweenedValue = this.animation.tweenedValue(indices, 0.9);

    test.equal(tweenedValue[0][0], 30);
    test.equal(tweenedValue[0][1], 70);
    test.equal(tweenedValue[0][2], 0);

    test.done();
  },

  tweenFromProperties: function(test) {
    test.expect(3);

    this.chain[Animation.keys] = ["a", "b", "c"];
    this.animation = new Animation(this.chain);

    var segment = this.segment.multi;

    segment.keyFrames = [{
      value: {a: 0, b: 3, c: 5}
    }, {
      value: {a: 10, b: 6, c: 10}
    }, {
      value: {a: 20, b: 9, c: 15}
    }];

    segment.cuePoints = [0, 0.5, 1];

    this.animation.enqueue(segment);

    test.deepEqual(
      this.animation.tweenedValue(this.animation.findIndices(0.1), 0.1),
      [{ a: 2, b: 3.6, c: 6 }]
    );

    test.deepEqual(
      this.animation.tweenedValue(this.animation.findIndices(0.5), 0.5),
      [{ a: 10, b: 6, c: 10 }]
    );

    test.deepEqual(
      this.animation.tweenedValue(this.animation.findIndices(1), 1),
      [{ a: 20, b: 9, c: 15 }]
    );

    test.done();
  }

};

exports["Animation"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();

    this.play = this.sandbox.stub(Animation.prototype, "play");

    this.animation = new Animation({});
    this.chain = {
      result: [],
      "@@render": function(args) {
        this.result = this.result.concat(args);
      },
      "@@normalize": function(keyFrames) {
        var last = [50, 0, -20];

        // If user passes null as the first element in keyFrames use current position
        if (keyFrames[0] === null) {
          keyFrames[0] = {
            position: last
          };
        }

        return keyFrames;
      }
    };

    done();
  },

  tearDown: function(done) {
    this.sandbox.restore();
    done();
  },

  instanceof: function(test) {
    test.expect(1);
    test.equal(Animation({}) instanceof Animation, true);
    test.done();
  },

  enqueue: function(test) {
    test.expect(5);

    this.animation = new Animation(this.chain);

    this.next = this.sandbox.stub(this.animation, "next");
    this.animation.paused = true;

    test.equal(this.animation.enqueue({}), this.animation);
    test.equal(this.animation.segments.length, 1);

    this.animation.paused = false;

    test.equal(this.animation.enqueue({}), this.animation);
    test.equal(this.animation.segments.length, 2);
    test.equal(this.next.callCount, 1);

    this.next.restore();
    test.done();
  },

  enqueueNoOptionsArg: function(test) {
    test.expect(2);

    this.animation = new Animation(this.chain);
    this.next = this.sandbox.stub(this.animation, "next");

    this.animation.paused = true;
    test.equal(this.animation.enqueue(), this.animation);
    test.equal(this.animation.segments.length, 1);
    test.done();
  },
  next: function(test) {
    test.expect(12);

    var onstart = this.sandbox.spy();
    var stop = this.sandbox.spy();

    this.animation = new Animation(this.chain);

    this.animation.segments.push(new Animation.Segment());
    this.animation.segments[0].segments.push(new Animation.Segment());
    this.animation.segments[0].segments[0].segments.push(new Animation.Segment());

    this.animation.segments[0].currentSpeed = 0;
    this.animation.segments[0].onstart = onstart;
    this.animation.segments[0].reverse = true;

    this.animation.segments[0].segments[0].currentSpeed = 1;
    this.animation.segments[0].segments[0].onstart = null;

    this.animation.segments[0].segments[0].segments[0].currentSpeed = 1;
    this.animation.segments[0].segments[0].segments[0].onstart = onstart;
    this.animation.segments[0].segments[0].segments[0].playLoop = {
      stop: stop,
    };

    this.normalizeKeyframes = this.sandbox.stub(this.animation, "normalizeKeyframes");

    test.equal(this.animation.segments.length, 1);
    test.equal(this.animation.next(), this.animation);
    test.equal(onstart.callCount, 1);
    test.equal(this.normalizeKeyframes.callCount, 1);
    test.equal(this.animation.paused, true);
    test.equal(this.animation.segments.length, 1);

    this.animation.next();
    test.equal(this.normalizeKeyframes.callCount, 2);
    test.equal(this.animation.paused, false);
    test.equal(this.animation.segments.length, 1);

    this.animation.next();
    test.equal(onstart.callCount, 2);
    test.equal(this.animation.segments.length, 0);

    // No segments left
    this.animation.next();
    test.equal(stop.callCount, 1);

    test.done();
  },

  nextShiftsQueuedSegmentOntoSelf: function(test) {
    test.expect(5);
    var stop = this.sandbox.spy();

    this.animation = new Animation(this.chain);
    this.animation.paused = true;
    this.animation.normalizeKeyframes = this.sandbox.stub(this.animation, "normalizeKeyframes");

    test.equal(this.animation.BRAND, undefined);

    this.animation.enqueue({ BRAND: 1 });

    test.equal(this.animation.segments.length, 1);
    test.equal(this.animation.BRAND, undefined);

    this.animation.next();

    test.equal(this.animation.BRAND, 1);

    this.animation.enqueue({ BRAND: Infinity });

    this.animation.playLoop = {
      stop: stop,
    };


    this.animation.next();

    test.equal(this.animation.BRAND, Infinity);

    test.done();
  },

  pause: function(test) {
    test.expect(6);

    var stop = this.sandbox.spy();
    var onpause = this.sandbox.spy();
    var normalizeKeyframes = this.sandbox.stub();

    this.animation = new Animation(this.chain);
    this.animation.playLoop = {
      stop: stop,
    };
    this.animation.onpause = onpause;
    this.animation.normalizeKeyframes = normalizeKeyframes;


    this.animation.on("animation:pause", function() {
      test.ok(true);
    });

    this.animation.paused = false;
    this.animation.pause();

    test.equal(this.animation.paused, true);
    test.equal(stop.callCount, 1);
    test.equal(onpause.callCount, 1);


    delete this.animation.playLoop;
    delete this.animation.onpause;

    this.animation.paused = false;

    this.animation.pause();

    test.equal(this.animation.paused, true);
    test.done();
  },

  stop: function(test) {
    test.expect(9);

    var stop = this.sandbox.spy();
    var onstop = this.sandbox.spy();
    var normalizeKeyframes = this.sandbox.stub();

    this.animation = new Animation(this.chain);
    this.animation.playLoop = {
      stop: stop,
    };
    this.animation.onstop = onstop;
    this.animation.normalizeKeyframes = normalizeKeyframes;

    this.animation.segments.push(new Animation.Segment());


    this.animation.on("animation:stop", function() {
      test.ok(true);
    });

    test.equal(this.animation.segments.length, 1);

    this.animation.stop();

    test.equal(this.animation.segments.length, 0);
    test.equal(stop.callCount, 1);
    test.equal(onstop.callCount, 1);


    delete this.animation.playLoop;
    delete this.animation.onstop;

    this.animation.stop();

    test.equal(this.animation.segments.length, 0);
    test.equal(stop.callCount, 1);
    test.equal(onstop.callCount, 1);

    test.done();
  },

  speed: function(test) {
    test.expect(17);

    test.equal(this.animation.currentSpeed, 1);
    test.equal(this.animation.scaledDuration, undefined);
    test.equal(this.animation.startTime, undefined);
    test.equal(this.animation.endTime, undefined);

    test.equal(this.animation.speed(2), this.animation);
    test.equal(this.animation.currentSpeed, 2);
    test.equal(this.animation.speed(), 2);

    test.equal(this.animation.scaledDuration, 500);
    test.notEqual(this.animation.startTime, undefined);
    test.notEqual(this.animation.endTime, undefined);
    test.equal(typeof this.animation.startTime, "number");
    test.equal(typeof this.animation.endTime, "number");

    test.equal(this.animation.play.callCount, 1);
    this.animation.paused = false;
    test.equal(this.animation.speed(3), this.animation);
    test.equal(this.animation.play.callCount, 2);

    this.animation.paused = true;
    test.equal(this.animation.speed(3), this.animation);
    test.equal(this.animation.play.callCount, 2);

    test.done();
  },

  loopFunctionWithonLoopFalseMetronomicTrueReverseFalse: function(test) {
    test.expect(1);

    this.clock = this.sandbox.useFakeTimers();
    this.normalizeKeyframes = this.sandbox.stub(Animation.prototype, "normalizeKeyframes", function() {
      this.loopback = 1;
    }.bind(this));

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};
    this.animation.speed(1);

    this.animation.metronomic = true;
    this.animation.reverse = false;
    this.animation.loop = false;
    this.animation.onloop = this.sandbox.spy();
    this.animation.loopFunction(loop);

    test.equal(this.animation.onloop.callCount, 1);
    test.done();
  },

  loopFunctionfallBackTimeNoPlayLoop: function(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.tfb = this.sandbox.stub(Animation, "TemporalFallback", function() {});
    this.stop = this.sandbox.stub(Animation.prototype, "stop");

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.fallBackTime = 500;
    this.animation.speed(1);


    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};

    this.animation.playLoop = null;
    this.animation.loopFunction(loop);

    test.equal(this.tfb.callCount, 1);
    test.equal(this.stop.callCount, 1);
    test.done();
  },

  loopFunctiononcomplete: function(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.tfb = this.sandbox.stub(Animation, "TemporalFallback", function() {});

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.fallBackTime = 500;
    this.animation.speed(1);


    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};
    this.animation.playLoop = null;
    this.animation.onloop = this.sandbox.stub();
    this.animation.next = this.sandbox.stub();

    var animation = this.animation;

    this.sandbox.stub(Animation.prototype, "stop");
    this.animation.oncomplete = function() {
      test.equal(Animation.TemporalFallback.callCount, 1);
      test.equal(this, animation);

      animation.oncomplete = null;
      test.done();
    };

    this.animation.loopFunction(loop);
  },

  loopFunctionNOoncompleteSegmentsRemaining: function(test) {
    test.expect(1);

    this.clock = this.sandbox.useFakeTimers();
    this.tfb = this.sandbox.stub(Animation, "TemporalFallback", function() {});
    this.stop = this.sandbox.stub(Animation.prototype, "stop");

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.fallBackTime = 500;
    this.animation.speed(1);


    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};
    this.animation.playLoop = null;
    this.animation.onloop = this.sandbox.stub();
    this.animation.next = this.sandbox.stub();

    this.nextTick = this.sandbox.stub(process, "nextTick");

    this.animation.next = function() {
      test.equal(this.stop.callCount, 1);
      test.done();
    }.bind(this);

    this.animation.segments = [1, 2, 3, 4];
    this.animation.loopFunction(loop);
  },

  loopFunctionfallBackTimeWithPlayLoop: function(test) {
    test.expect(1);

    this.clock = this.sandbox.useFakeTimers();
    this.tfb = this.sandbox.stub(Animation, "TemporalFallback", function() {});

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.fallBackTime = 500;
    this.animation.speed(1);

    this.animation.playLoop = {
      stop: this.sandbox.spy(),
    };

    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};

    this.sandbox.stub(Animation.prototype, "stop");

    this.animation.loopFunction(loop);

    test.equal(this.tfb.callCount, 1);
    test.done();
  },

  loopFunctionWithonloop: function(test) {
    test.expect(1);

    this.clock = this.sandbox.useFakeTimers();
    this.normalizeKeyframes = this.sandbox.stub(Animation.prototype, "normalizeKeyframes", function() {
      this.loopback = 1;
    }.bind(this));

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};
    this.animation.speed(1);

    this.animation.metronomic = true;
    this.animation.reverse = false;
    this.animation.loop = true;
    this.animation.onloop = this.sandbox.spy();
    this.animation.loopFunction(loop);

    test.equal(this.animation.onloop.callCount, 1);
    test.done();
  },

  loopFunctionWithmetronomicAndReverseTrueInvertsReverse: function(test) {
    test.expect(1);

    this.clock = this.sandbox.useFakeTimers();
    this.normalizeKeyframes = this.sandbox.stub(Animation.prototype, "normalizeKeyframes", function() {
      this.loopback = 1;
    }.bind(this));

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};
    this.animation.speed(1);

    this.animation.metronomic = true;
    this.animation.reverse = true;
    this.animation.loop = true;
    this.animation.onloop = this.sandbox.spy();
    this.animation.loopFunction(loop);

    test.equal(this.animation.reverse, false);
    test.done();
  },

  loopFunctionWithmetronomicAndReverseFalseInvertsReverse: function(test) {
    test.expect(1);

    this.clock = this.sandbox.useFakeTimers();
    this.normalizeKeyframes = this.sandbox.stub(Animation.prototype, "normalizeKeyframes", function() {
      this.loopback = 1;
    }.bind(this));

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};
    this.animation.speed(1);

    this.animation.metronomic = true;
    this.animation.reverse = false;
    this.animation.loop = true;
    this.animation.onloop = this.sandbox.spy();
    this.animation.loopFunction(loop);

    test.equal(this.animation.reverse, true);
    test.done();
  },

  loopFunctionWithoutonloop: function(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.normalizeKeyframes = this.sandbox.stub(Animation.prototype, "normalizeKeyframes", function() {
      this.loopback = 1;
    }.bind(this));

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};
    this.animation.speed(1);

    this.animation.metronomic = false;
    this.animation.loop = true;
    this.animation.onloop = null;

    test.equal(this.endTime, undefined);

    this.animation.loopFunction(loop);
    test.equal(this.endTime, undefined);

    test.done();
  },

  loopFunctionWithmetronomic: function(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.normalizeKeyframes = this.sandbox.stub(Animation.prototype, "normalizeKeyframes", function() {
      this.loopback = 1;
    }.bind(this));

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};
    this.animation.speed(1);

    this.animation.metronomic = true;
    this.animation.onloop = null;

    test.equal(this.endTime, undefined);

    this.animation.loopFunction(loop);
    test.equal(this.endTime, undefined);

    test.done();
  },

  loopFunctionWithmetronomicAndreversetrue: function(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.normalizeKeyframes = this.sandbox.stub(Animation.prototype, "normalizeKeyframes", function() {
      this.loopback = 1;
    }.bind(this));

    var startTime = Date.now();
    var loop = {
      calledAt: startTime + 1000
    };

    this.animation.startTime = startTime;
    this.animation.normalizedKeyFrames = [];
    this.animation.target = {};
    this.animation.target[Animation.render] = function() {};
    this.animation.speed(1);

    this.animation.loop = false;
    this.animation.metronomic = true;
    this.animation.reverse = true;
    this.animation.onloop = null;

    test.equal(this.endTime, undefined);

    this.animation.loopFunction(loop);
    test.equal(this.endTime, undefined);

    test.done();
  },

  playWithPlayLoop: function(test) {
    test.expect(2);

    this.play.restore();
    this.animation = new Animation(this.chain);
    this.animation.playLoop = {
      stop: function() {
        test.ok(true);
      },
    };

    this.animation.loopFunction = this.sandbox.spy(function(task) {
      test.ok(true);
      task.stop();
      test.done();
    });

    this.animation.play();
  },

  playWithoutPlayLoop: function(test) {
    test.expect(1);

    this.play.restore();
    this.animation = new Animation(this.chain);

    this.animation.loopFunction = this.sandbox.spy(function(task) {
      test.ok(true);

      task.stop();
      test.done();
    });

    this.animation.play();
  },

};

exports["Animation.Segment"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.segment = new Animation.Segment({});
    done();
  },

  tearDown: function(done) {
    this.sandbox.restore();
    done();
  },

  instanceof: function(test) {
    test.expect(1);
    test.equal(Animation({}) instanceof Animation, true);
    test.done();
  },

  default: function(test) {
    test.expect(1);

    test.deepEqual(this.segment, new Animation.Segment({}));
    test.done();
  },

  defaultWithSegments: function(test) {
    test.expect(1);

    var subsegments = [];
    var options = {
      segments: subsegments
    };
    var segment = new Animation.Segment(options);


    test.notEqual(segment.segments, options.segments);
    test.done();
  },
};

exports["Animation.TemporalFallback"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.spy = this.sandbox.spy();
    this.animation = {
      rate: 0xbeef,
      loopFunction: this.spy,
    };

    this.setInterval = this.sandbox.stub(global, "setInterval").returns(1);
    this.clearInterval = this.sandbox.stub(global, "clearInterval");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  interval: function(test) {
    test.expect(4);

    var fallback = new Animation.TemporalFallback(this.animation);
    var callback = this.setInterval.firstCall.args[0];

    callback();

    test.equal(fallback.interval, 1);
    test.equal(this.setInterval.callCount, 1);
    test.equal(this.spy.callCount, 1);
    test.equal(this.setInterval.firstCall.args[1], 0xbeef);
    test.done();
  },

  stop: function(test) {
    test.expect(2);
    var fallback = new Animation.TemporalFallback(this.animation);

    fallback.stop();

    test.equal(this.clearInterval.callCount, 1);
    test.equal(this.clearInterval.firstCall.args[0], 1);
    test.done();
  },

  stopMissingInterval: function(test) {
    test.expect(1);
    var fallback = new Animation.TemporalFallback(this.animation);

    fallback.interval = null;

    fallback.stop();

    test.equal(this.clearInterval.callCount, 0);
    test.done();
  },
};
