require("./common/bootstrap");

exports["Servo"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.servoWrite = this.sandbox.spy(MockFirmata.prototype, "servoWrite");
    this.servoConfig = this.sandbox.spy(MockFirmata.prototype, "servoConfig");
    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");
    this.enqueue = this.sandbox.spy(Animation.prototype, "enqueue");
    this.next = this.sandbox.spy(Animation.prototype, "next");
    this.loop = this.sandbox.stub(temporal, "loop");



    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.proto = [{
      name: "to"
    }, {
      name: "step"
    }, {
      name: "move"
    }, {
      name: "min"
    }, {
      name: "max"
    }, {
      name: "center"
    }, {
      name: "sweep"
    }, {
      name: "stop"
    }, {
      name: "clockWise"
    }, {
      name: "cw"
    }, {
      name: "counterClockwise"
    }, {
      name: "ccw"
    }];

    this.instance = [{
      name: "id"
    }, {
      name: "pin"
    }, {
      name: "mode"
    }, {
      name: "range"
    }, {
      name: "invert"
    }, {
      name: "type"
    }, {
      name: "interval"
    }, {
      name: "value"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    Servo.purge();
    this.sandbox.restore();
    done();
  },

  instanceof(test) {
    test.expect(1);
    test.equal(new Servo({}) instanceof Servo, true);
    test.done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.servo[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.servo[name], "undefined"));

    test.done();
  },

  emitter(test) {
    test.expect(1);
    test.ok(this.servo instanceof Emitter);
    test.done();
  },

  debug(test) {
    test.expect(1);

    this.sandbox.stub(this.board.pins, "isServo").returns(false);

    test.throws(() => {
      this.servo = new Servo({
        board: this.board,
        debug: true,
        pin: 11,
      });
    });

    test.done();
  },

  doesNotWriteSameLastDegrees(test) {
    test.expect(2);

    this.servoWrite.reset();

    this.servo.to(100);
    test.equal(this.servoWrite.callCount, 1);

    this.servo.to(100);
    test.equal(this.servoWrite.callCount, 1);
    test.done();
  },

  startAt(test) {
    test.expect(4);

    this.to = this.sandbox.spy(Servo.prototype, "to");
    this.center = this.sandbox.spy(Servo.prototype, "center");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
      startAt: 138,
    });
    test.equal(this.to.callCount, 1);
    test.equal(this.to.lastCall.args[0], 138);
    test.equal(this.center.callCount, 0);
    test.equal(this.servo.startAt, 138);
    test.done();
  },

  startAtOverriddenByCenter(test) {
    test.expect(5);

    this.to = this.sandbox.spy(Servo.prototype, "to");
    this.center = this.sandbox.spy(Servo.prototype, "center");

    this.servo = new Servo({
      board: this.board,
      center: true,
      pin: 11,
      startAt: 138,
    });

    test.equal(this.center.callCount, 1);
    // The startAt position will be overridden
    // by the `center: true` option.
    test.equal(this.to.callCount, 2);
    test.equal(this.to.firstCall.args[0], 138);
    test.equal(this.to.lastCall.args[0], 90);
    test.equal(this.servo.startAt, 138);
    test.done();
  },

  inverted(test) {
    test.expect(3);

    this.servo = new Servo({
      board: this.board,
      invert: true,
      pin: 11,
    });

    this.servo.to(180);
    test.ok(this.servoWrite.calledWith(11, 600));

    this.servo.to(135);
    test.ok(this.servoWrite.calledWith(11, 1050));

    this.servo.to(90);
    test.ok(this.servoWrite.calledWith(11, 1500));

    test.done();
  },

  isInvertedWarning(test) {
    test.expect(2);

    this.consoleWarn = this.sandbox.stub(console, "warn");

    this.servo = new Servo({
      board: this.board,
      isInverted: true,
      pin: 11,
    });

    test.equal(this.consoleWarn.callCount, 1);
    test.equal(this.consoleWarn.firstCall.args[0], "The 'isInverted' property has been renamed 'invert'");

    test.done();
  },

  range(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      range: [20, 160],
    });

    this.servo.to(180);
    test.ok(this.servoWrite.calledWith(11, 2200));

    this.servo.to(135);
    test.ok(this.servoWrite.calledWith(11, 1950));

    this.servo.to(10);
    test.ok(this.servoWrite.calledWith(11, 800));

    test.done();
  },

  rangeWithInvert(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      invert: true,
      range: [30, 160]
    });

    this.servo.to(180);
    test.ok(this.servoWrite.calledWith(11, 800));

    this.servo.to(135);
    test.ok(this.servoWrite.calledWith(11, 1050));

    this.servo.to(10);
    test.ok(this.servoWrite.calledWith(11, 2100));

    test.done();
  },

  home(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      startAt: 20
    });

    this.servo.to(180);
    test.ok(this.servoWrite.calledWith(11, 2400));

    this.servo.home();
    test.ok(this.servoWrite.calledWith(11, 800));

    test.done();
  },

  homeNoStartAtPassed(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(180);
    test.ok(this.servoWrite.calledWith(11, 2400));

    this.servo.home();
    test.ok(this.servoWrite.calledWith(11, 1500));

    test.done();
  },

  offset(test) {
    test.expect(5);

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      offset: -10
    });

    this.servo.to(180);
    test.ok(this.servoWrite.calledWith(11, 2300));

    this.servo.to(135);
    test.ok(this.servoWrite.calledWith(11, 1850));

    this.servo.to(10);
    test.ok(this.servoWrite.calledWith(11, 600));

    this.servo.to(185);
    test.ok(this.servoWrite.calledWith(11, 2350));

    test.equal(this.servo.value, 185);

    test.done();
  },

  offsetWithInvert(test) {
    test.expect(4);

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      offset: -10,
      invert: true
    });

    this.servo.to(180);
    test.ok(this.servoWrite.calledWith(11, 700));

    this.servo.to(135);
    test.ok(this.servoWrite.calledWith(11, 1150));

    this.servo.to(10);
    test.ok(this.servoWrite.calledWith(11, 2400));

    test.equal(this.servo.value, 10);

    test.done();
  },

  offsetWithRange(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      offset: -10,
      range: [20, 150]
    });

    this.servo.to(180);
    test.ok(this.servoWrite.calledWith(11, 2000));

    this.servo.to(135);
    test.ok(this.servoWrite.calledWith(11, 1850));

    this.servo.to(10);
    test.ok(this.servoWrite.calledWith(11, 700));

    test.done();
  },

  offsetWithRangeAndInvert(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      offset: -10,
      range: [20, 150],
      invert: true
    });

    this.servo.to(180);
    test.ok(this.servoWrite.calledWith(11, 1000));

    this.servo.to(135);
    test.ok(this.servoWrite.calledWith(11, 1150));

    this.servo.to(10);
    test.ok(this.servoWrite.calledWith(11, 2300));

    test.done();
  },

  /*
  offset - range - invert
  1 - 1 - 1
  */

  type(test) {
    test.expect(1);
    test.equal(this.servo.type, "standard");

    test.done();
  },

  positionNoValue(test) {
    test.expect(1);

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });
    test.equal(this.servo.position, -1);
    test.done();
  },

  positionHasValue(test) {
    test.expect(1);
    this.servo.to(180);
    test.equal(this.servo.position, 180);

    test.done();
  },

  value(test) {
    test.expect(1);

    this.servo.to(100);
    test.equal(this.servo.value, 100);

    test.done();
  },

  sweep(test) {
    test.expect(19);

    let args;

    this.to = this.sandbox.stub(Servo.prototype, "to");

    // Default behaviour
    this.servo.sweep();
    test.equal(this.to.callCount, 1);

    args = this.to.lastCall.args[0];

    test.deepEqual(args.keyFrames, [ { value: 0 }, { value: 180 } ]);
    test.equal(args.metronomic, true);
    test.equal(args.loop, true);
    test.equal(args.easing, "inOutSine");

    // Range behaviour
    this.servo.sweep([ 35, 145 ]);

    args = this.to.lastCall.args[0];

    test.deepEqual(args.keyFrames, [ { value: 35 }, { value: 145 } ]);
    test.equal(args.metronomic, true);
    test.equal(args.loop, true);
    test.equal(args.easing, "inOutSine");

    // Options behaviour
    this.servo.sweep({
      range: [ 10, 170 ],
      interval: 5000,
      step: 10,
    });

    args = this.to.lastCall.args[0];

    test.deepEqual(args.keyFrames, [ { value: 10 }, { value: 170 } ]);
    test.equal(args.interval, 5000);
    test.equal(args.metronomic, true);
    test.equal(args.loop, true);
    test.equal(args.easing, "inOutSine");

    // Options w/ inOutQuad
    this.servo.sweep({
      range: [ 10, 170 ],
      easing: "inOutQuad",
      interval: 5000,
      step: 10,
    });

    args = this.to.lastCall.args[0];

    test.deepEqual(args.keyFrames, [ { value: 10 }, { value: 170 } ]);
    test.equal(args.interval, 5000);
    test.equal(args.metronomic, true);
    test.equal(args.loop, true);
    test.equal(args.easing, "inOutQuad");

    // @dtex
    // Turns out `step` is broken and I"m not
    // sure how to fix it with Animation.
    test.done();
  },

  history(test) {
    test.expect(1);

    this.servo.to(0);
    this.servo.to(1);
    this.servo.to(2);
    this.servo.to(3);
    this.servo.to(4);
    this.servo.to(5);
    this.servo.to(6);
    this.servo.to(7);
    this.servo.to(8);
    this.servo.to(9);
    test.equal(this.servo.history.length, 5);
    test.done();
  },

  move(test) {
    test.expect(2);
    this.consoleWarn = this.sandbox.stub(console, "warn");
    this.to = this.sandbox.spy(this.servo, "to");

    this.servo.move(138);

    test.equal(this.to.callCount, 1);
    test.equal(this.consoleWarn.callCount, 1);
    test.done();
  },

  to(test) {
    test.expect(4);
    this.servoWrite.reset();
    this.update = this.sandbox.spy(this.servo, "update");

    this.servo.to(138);
    test.equal(this.servoWrite.lastCall.args[0], 11);
    test.equal(this.servoWrite.lastCall.args[1], 1980);
    test.equal(this.update.callCount, 1);
    test.equal(this.update.lastCall.args[0], 138);
    test.done();
  },

  toOptionsAnimation(test) {
    test.expect(2);

    this.servoWrite.reset();
    this.update = this.sandbox.spy(this.servo, "update");
    this.mapSet = this.sandbox.spy(Map.prototype, "set");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const state = this.mapSet.lastCall.args[1];

    test.equal(typeof state.animation, "undefined");
    this.servo.to({});
    test.equal(state.animation instanceof Animation, true);
    test.done();
  },

  toOptionsDefaults(test) {
    test.expect(26);

    this.servoWrite.reset();
    this.update = this.sandbox.spy(this.servo, "update");
    this.mapSet = this.sandbox.spy(Map.prototype, "set");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const state = this.mapSet.lastCall.args[1];

    test.equal(Object.keys(state).length, 1);
    test.equal(typeof state.isRunning, "undefined");

    this.servo.to({});

    test.notEqual(typeof state.isRunning, "undefined");

    test.deepEqual(state.animation.cuePoints, [ 0, 1 ]);

    test.equal(state.animation.duration, 1000);
    test.equal(state.animation.easing, "linear");
    test.equal(state.animation.loop, false);
    test.equal(state.animation.loopback, 0);
    test.equal(state.animation.metronomic, false);
    test.equal(state.animation.currentSpeed, 1);
    test.equal(state.animation.progress, 0);
    test.equal(state.animation.fps, 60);
    test.equal(Math.floor(state.animation.rate), 16);
    test.equal(state.animation.paused, false);
    test.equal(state.animation.onstart, null);
    test.equal(state.animation.onpause, null);
    test.equal(state.animation.onstop, null);
    test.equal(state.animation.onloop, null);

    test.equal(typeof state.animation.oncomplete, "function");
    test.equal(state.animation.defaultTarget, this.servo);
    test.equal(state.animation.target, this.servo);

    // test.deepEqual(
    //   state.animation.normalizedKeyFrames, [
    //     [{
    //       value: 90,
    //       easing: "linear"
    //     }, {
    //       value: 90,
    //       easing: "linear"
    //     }]
    //   ]
    // );

    test.equal(state.animation.scaledDuration, 1000);
    test.equal(state.animation.startTime, 0);
    test.equal(state.animation.endTime, 1000);
    test.equal(state.animation.fallBackTime, 5000);
    test.equal(state.animation.frameCount, 0);

    this.servo.on("move:complete", () => {
      test.done();
    });

    state.animation.oncomplete();
  },

  toOptionsDuration(test) {
    test.expect(28);

    this.servoWrite.reset();
    this.update = this.sandbox.spy(this.servo, "update");
    this.mapSet = this.sandbox.spy(Map.prototype, "set");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const state = this.mapSet.lastCall.args[1];

    test.equal(Object.keys(state).length, 1);
    test.equal(typeof state.isRunning, "undefined");

    this.servo.to({
      duration: 1500,
    });

    test.notEqual(typeof state.isRunning, "undefined");

    test.deepEqual(state.animation.cuePoints, [ 0, 1 ]);
    test.deepEqual(state.animation.segments, []);

    test.equal(state.animation.duration, 1500);
    test.equal(state.animation.easing, "linear");
    test.equal(state.animation.loop, false);
    test.equal(state.animation.loopback, 0);
    test.equal(state.animation.metronomic, false);
    test.equal(state.animation.currentSpeed, 1);
    test.equal(state.animation.progress, 0);
    test.equal(state.animation.fps, 60);
    test.equal(state.animation.rate, 16);
    test.equal(state.animation.paused, false);
    test.equal(state.animation.onstart, null);
    test.equal(state.animation.onpause, null);
    test.equal(state.animation.onstop, null);
    test.equal(state.animation.onloop, null);

    test.equal(typeof state.animation.oncomplete, "function");
    test.equal(state.animation.defaultTarget, this.servo);
    test.equal(state.animation.target, this.servo);

    test.deepEqual(
      state.animation.normalizedKeyFrames, [
        [{
          value: 90,
          easing: "linear"
        }, {
          value: 90,
          easing: "linear"
        }]
      ]
    );

    test.equal(state.animation.scaledDuration, 1500);
    test.equal(state.animation.startTime, 0);
    test.equal(state.animation.endTime, 1500);
    test.equal(state.animation.fallBackTime, 5000);
    test.equal(state.animation.frameCount, 0);

    this.servo.on("move:complete", () => {
      test.done();
    });

    state.animation.oncomplete();
  },

  toOptionsInterval(test) {
    test.expect(28);

    this.servoWrite.reset();
    this.update = this.sandbox.spy(this.servo, "update");
    this.mapSet = this.sandbox.spy(Map.prototype, "set");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const state = this.mapSet.lastCall.args[1];

    test.equal(Object.keys(state).length, 1);
    test.equal(typeof state.isRunning, "undefined");

    this.servo.to({
      interval: 1500,
    });

    test.notEqual(typeof state.isRunning, "undefined");

    test.deepEqual(state.animation.cuePoints, [ 0, 1 ]);
    test.deepEqual(state.animation.segments, []);

    test.equal(state.animation.duration, 1500);
    test.equal(state.animation.easing, "linear");
    test.equal(state.animation.loop, false);
    test.equal(state.animation.loopback, 0);
    test.equal(state.animation.metronomic, false);
    test.equal(state.animation.currentSpeed, 1);
    test.equal(state.animation.progress, 0);
    test.equal(state.animation.fps, 60);
    test.equal(state.animation.rate, 16);
    test.equal(state.animation.paused, false);
    test.equal(state.animation.onstart, null);
    test.equal(state.animation.onpause, null);
    test.equal(state.animation.onstop, null);
    test.equal(state.animation.onloop, null);

    test.equal(typeof state.animation.oncomplete, "function");
    test.equal(state.animation.defaultTarget, this.servo);
    test.equal(state.animation.target, this.servo);

    test.deepEqual(
      state.animation.normalizedKeyFrames, [
        [{
          value: 90,
          easing: "linear"
        }, {
          value: 90,
          easing: "linear"
        }]
      ]
    );

    test.equal(state.animation.scaledDuration, 1500);
    test.equal(state.animation.startTime, 0);
    test.equal(state.animation.endTime, 1500);
    test.equal(state.animation.fallBackTime, 5000);
    test.equal(state.animation.frameCount, 0);

    this.servo.on("move:complete", () => {
      test.done();
    });

    state.animation.oncomplete();
  },

  toOptionsDegrees(test) {
    test.expect(28);

    this.servoWrite.reset();
    this.update = this.sandbox.spy(this.servo, "update");
    this.mapSet = this.sandbox.spy(Map.prototype, "set");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const state = this.mapSet.lastCall.args[1];

    test.equal(Object.keys(state).length, 1);
    test.equal(typeof state.isRunning, "undefined");

    this.servo.to({
      degrees: 180,
    });

    test.notEqual(typeof state.isRunning, "undefined");

    test.deepEqual(state.animation.cuePoints, [ 0, 1 ]);
    test.deepEqual(state.animation.segments, []);

    test.equal(state.animation.duration, 1000);
    test.equal(state.animation.easing, "linear");
    test.equal(state.animation.loop, false);
    test.equal(state.animation.loopback, 0);
    test.equal(state.animation.metronomic, false);
    test.equal(state.animation.currentSpeed, 1);
    test.equal(state.animation.progress, 0);
    test.equal(state.animation.fps, 60);
    test.equal(state.animation.rate, 16);
    test.equal(state.animation.paused, false);
    test.equal(state.animation.onstart, null);
    test.equal(state.animation.onpause, null);
    test.equal(state.animation.onstop, null);
    test.equal(state.animation.onloop, null);

    test.equal(typeof state.animation.oncomplete, "function");
    test.equal(state.animation.defaultTarget, this.servo);
    test.equal(state.animation.target, this.servo);

    test.deepEqual(
      state.animation.normalizedKeyFrames, [
        [{
          value: 90,
          easing: "linear",
        }, {
          value: 180,
          easing: "linear",
        }]
      ]
    );

    test.equal(state.animation.scaledDuration, 1000);
    test.equal(state.animation.startTime, 0);
    test.equal(state.animation.endTime, 1000);
    test.equal(state.animation.fallBackTime, 5000);
    test.equal(state.animation.frameCount, 0);

    this.servo.on("move:complete", () => {
      test.done();
    });

    state.animation.oncomplete();
  },

  toOptionsOncomplete(test) {
    test.expect(29);

    this.servoWrite.reset();
    this.update = this.sandbox.spy(this.servo, "update");
    this.mapSet = this.sandbox.spy(Map.prototype, "set");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const state = this.mapSet.lastCall.args[1];

    test.equal(Object.keys(state).length, 1);
    test.equal(typeof state.isRunning, "undefined");

    this.servo.to({
      oncomplete() {
        test.ok(true);
      },
    });

    test.notEqual(typeof state.isRunning, "undefined");

    test.deepEqual(state.animation.cuePoints, [ 0, 1 ]);
    test.deepEqual(state.animation.segments, []);

    test.equal(state.animation.duration, 1000);
    test.equal(state.animation.easing, "linear");
    test.equal(state.animation.loop, false);
    test.equal(state.animation.loopback, 0);
    test.equal(state.animation.metronomic, false);
    test.equal(state.animation.currentSpeed, 1);
    test.equal(state.animation.progress, 0);
    test.equal(state.animation.fps, 60);
    test.equal(state.animation.rate, 16);
    test.equal(state.animation.paused, false);
    test.equal(state.animation.onstart, null);
    test.equal(state.animation.onpause, null);
    test.equal(state.animation.onstop, null);
    test.equal(state.animation.onloop, null);

    test.equal(typeof state.animation.oncomplete, "function");
    test.equal(state.animation.defaultTarget, this.servo);
    test.equal(state.animation.target, this.servo);

    test.deepEqual(
      state.animation.normalizedKeyFrames, [
        [{
          value: 90,
          easing: "linear",
        }, {
          value: 90,
          easing: "linear",
        }]
      ]
    );

    test.equal(state.animation.scaledDuration, 1000);
    test.equal(state.animation.startTime, 0);
    test.equal(state.animation.endTime, 1000);
    test.equal(state.animation.fallBackTime, 5000);
    test.equal(state.animation.frameCount, 0);

    this.servo.on("move:complete", () => {
      test.done();
    });

    state.animation.oncomplete();
  },

  toDegreesAndTime(test) {
    test.expect(6);
    this.servoWrite.reset();
    this.update = this.sandbox.spy(this.servo, "update");
    this.mapSet = this.sandbox.spy(Map.prototype, "set");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const state = this.mapSet.lastCall.args[1];

    this.servo.to(180, 1500);

    test.equal(state.animation.duration, 1500);
    test.equal(state.animation.scaledDuration, 1500);
    test.equal(state.animation.startTime, 0);
    test.equal(state.animation.endTime, 1500);
    test.equal(state.animation.fallBackTime, 5000);
    test.equal(state.animation.frameCount, 0);

    test.done();
  },

  toDegreesAndTimeWithInvert(test) {
    test.expect(7);
    this.servoWrite.reset();
    this.update = this.sandbox.spy(this.servo, "update");
    this.mapSet = this.sandbox.spy(Map.prototype, "set");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
      invert: true
    });

    const state = this.mapSet.lastCall.args[1];

    this.servo.to(30, 1500);

    test.equal(state.animation.duration, 1500);
    test.equal(state.animation.scaledDuration, 1500);
    test.equal(state.animation.startTime, 0);
    test.equal(state.animation.endTime, 1500);
    test.equal(state.animation.fallBackTime, 5000);
    test.equal(state.animation.frameCount, 0);
    test.equal(state.animation.normalizedKeyFrames[0][1].value, 30);

    test.done();
  },

  step(test) {
    test.expect(3);

    this.mapSet = this.sandbox.spy(Map.prototype, "set");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const state = this.mapSet.lastCall.args[1];

    state.history.push({
      timestamp: Date.now(),
      degrees: 0,
      target: 0,
    });

    this.to = this.sandbox.stub(this.servo, "to");
    this.servo.step(45, 0);

    test.equal(this.to.callCount, 1);
    test.equal(this.to.lastCall.args[0], 45);
    test.equal(this.to.lastCall.args[1], 0);
    test.done();
  },

  stop(test) {
    test.expect(1);

    this.clearInterval = this.sandbox.stub(global, "clearInterval");
    this.mapSet = this.sandbox.spy(Map.prototype, "set");

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const state = this.mapSet.lastCall.args[1];

    this.servo.to({});

    const stop = this.sandbox.stub(state.animation, "stop");

    this.servo.stop();

    test.equal(stop.callCount, 1);
    test.done();
  },

  min(test) {
    test.expect(4);

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    this.to = this.sandbox.stub(this.servo, "to");
    this.servo.min(1000, 100);

    test.equal(this.to.callCount, 1);
    test.equal(this.to.lastCall.args[0], 0);
    test.equal(this.to.lastCall.args[1], 1000);
    test.equal(this.to.lastCall.args[2], 100);
    test.done();
  },

  max(test) {
    test.expect(4);

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    this.to = this.sandbox.stub(this.servo, "to");
    this.servo.max(1000, 100);

    test.equal(this.to.callCount, 1);
    test.equal(this.to.lastCall.args[0], 180);
    test.equal(this.to.lastCall.args[1], 1000);
    test.equal(this.to.lastCall.args[2], 100);
    test.done();
  },


  "Animation.normalize (without last, uses startAt)": function(test) {
    test.expect(1);

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const normalized = this.servo[Animation.normalize]([
      null,
      {value: 0, copyDegrees: 0},
    ]);

    test.equal(normalized[0].value, 90);

    test.done();
  },

  "Animation.normalize (with last)": function(test) {
    test.expect(1);
    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    this.servo.to(180);
    const normalized = this.servo[Animation.normalize]([
      null,
      {value: 0, copyDegrees: 0},
    ]);

    test.equal(normalized[0].value, 180);
    test.done();
  },

  "Animation.normalize (first keyframe not null)": function(test) {
    test.expect(1);
    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    this.servo.to(180);
    const normalized = this.servo[Animation.normalize]([
      {value: 0, copyDegrees: 0},
    ]);

    test.notEqual(normalized[0].value, 180);
    test.done();
  },

  "Animation.normalize (first keyframe is step)": function(test) {
    test.expect(1);
    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    this.servo.to(45);
    const normalized = this.servo[Animation.normalize]([45, 45, -90, 11]);

    test.equal(normalized[0].value, 90);
    test.done();
  },

  "Animation.normalize (degrees instead of value)": function(test) {
    test.expect(1);

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    const normalized = this.servo[Animation.normalize]([
      null,
      {degrees: 0},
    ]);

    test.equal(normalized[1].value, 0);

    test.done();
  },

  "Animation.normalize (nested degrees instead of value)": function(test) {
    test.expect(2);

    this.servos = new Servos([
      {
        board: this.board,
        pin: 11,
      }, {
        board: this.board,
        pin: 12,
      }
    ]);

    const normalized = this.servos[Animation.normalize]([
      [
        null,
        {degrees: 0}
      ],
      [
        null,
        {degrees: 180}
      ],
    ]);

    test.equal(normalized[0][1].value, 0);
    test.equal(normalized[1][1].value, 180);

    test.done();
  },

  "Animation.render": function(test) {
    test.expect(2);

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    this.to = this.sandbox.stub(this.servo, "to");
    this.servo[Animation.render]([180]);

    test.equal(this.to.callCount, 1);
    test.equal(this.to.lastCall.args[0], 180);
    test.done();
  },
};


exports["Servo - mode & config"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.servoConfig = this.sandbox.spy(MockFirmata.prototype, "servoConfig");
    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");
    done();
  },

  tearDown(done) {
    Board.purge();
    Servo.purge();
    this.sandbox.restore();
    done();
  },

  noRange(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });
    test.equal(this.servoConfig.callCount, 0);
    test.equal(this.pinMode.callCount, 1);
    test.done();
  },

  pwmRange(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      pwmRange: [1000, 2000]
    });
    test.equal(this.servoConfig.callCount, 1);
    test.equal(this.pinMode.callCount, 0);
    test.done();
  }
};

exports["Servo - Continuous"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.servoWrite = this.sandbox.spy(MockFirmata.prototype, "servoWrite");

    this.a = new Servo({
      pin: 11,
      type: "continuous",
      board: this.board
    });

    this.b = new Servo.Continuous({
      pin: 11,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Servo.purge();
    this.sandbox.restore();
    done();
  },

  type(test) {
    test.expect(2);
    test.equal(this.a.type, "continuous");
    test.equal(this.b.type, "continuous");
    test.done();
  },

  pinAssignment(test) {
    this.servo = new Servo.Continuous(9);
    test.equal(this.servo.pin, 9);

    this.servo = new Servo.Continuous({
      pin: 11,
    });

    test.equal(this.servo.pin, 11);
    test.done();
  },

  stopped(test) {
    test.expect(1);
    test.ok(this.servoWrite.calledWith(11, 1500));
    test.done();
  },

  nonContinuousErrors(test) {
    test.expect(4);

    this.servo = new Servo({
      board: this.board,
      pin: 11,
    });

    ["clockWise", "cw", "counterClockwise", "ccw"].forEach(function(api) {
      test.throws(() => {
        this.servo[api]();
      });
    }, this);

    test.done();
  },

  cw(test) {
    test.expect(2);

    this.a.cw();
    test.ok(this.servoWrite.calledWith(11, 2400));

    this.servoWrite.restore();

    this.b.cw();
    test.ok(this.servoWrite.calledWith(11, 2400));


    test.done();
  },

  ccw(test) {
    test.expect(2);

    this.a.ccw();
    test.ok(this.servoWrite.calledWith(11, 600));

    this.servoWrite.restore();

    this.b.ccw();
    test.ok(this.servoWrite.calledWith(11, 600));


    test.done();
  },

  deadband(test) {
    test.expect(6);

    test.deepEqual(this.a.deadband, [90, 90]);
    test.deepEqual(this.b.deadband, [90, 90]);

    this.continuousServo = new Servo.Continuous({
      pin: 5,
      board: this.board,
      deadband: [85, 95]
    });

    this.continuousServo.cw(0.5);
    test.equal(this.continuousServo.value, 138);

    this.continuousServo.ccw(0.5);
    test.equal(this.continuousServo.value, 42);


    this.to = this.sandbox.stub(this.continuousServo, "to");

    this.continuousServo.stop();
    test.equal(this.to.lastCall.args[0], 90);


    this.continuousServo.deadband = [100, 105];
    this.continuousServo.stop();
    test.equal(this.to.lastCall.args[0], 103);

    test.done();
  },

  rangePlusDeadband(test) {
    test.expect(2);

    this.continuousServo = new Servo.Continuous({
      pin: 5,
      board: this.board,
      deadband: [85, 95],
      range: [20, 160]
    });

    this.continuousServo.cw();
    test.ok(this.servoWrite.calledWith(5, 2200));

    this.servoWrite.reset();

    this.continuousServo.cw(0.5);
    test.ok(this.servoWrite.calledWith(5, 1880));

    test.done();
  }
};

exports["Servo - Allowed Pin Names"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    done();
  },
  tearDown(done) {
    Board.purge();
    Servo.purge();
    this.sandbox.restore();
    done();
  },
  firmata(test) {
    test.expect(10);

    this.board.analogPins = [14, 15, 16, 17, 18, 19];

    test.equal(new Servo(2).pin, 2);
    test.equal(new Servo(12).pin, 12);
    test.equal(new Servo({
      pin: 2
    }).pin, 2);
    test.equal(new Servo({
      pin: 12
    }).pin, 12);
    test.equal(new Servo("A0").pin, 14);
    test.equal(new Servo(14).pin, 14);
    test.equal(new Servo({
      pin: "A0"
    }).pin, 14);
    test.equal(new Servo({
      pin: 14
    }).pin, 14);

    // Modes is SERVO
    test.equal(new Servo(12).mode, 4);
    test.equal(new Servo(14).mode, 4);

    test.done();
  },

  nonFirmataNonNormalized(test) {
    test.expect(5);

    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false,
      repl: false
    });

    io.name = "FooBoard";

    board.on("ready", () => {
      test.equal(new Servo({
        pin: 2,
        board
      }).pin, 2);
      test.equal(new Servo({
        pin: 12,
        board
      }).pin, 12);
      test.equal(new Servo({
        pin: "A0",
        board
      }).pin, "A0");

      // Modes is SERVO
      test.equal(new Servo({
        pin: 12,
        board
      }).mode, 4);
      test.equal(new Servo({
        pin: "A0",
        board
      }).mode, 4);

      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  }
};

exports["Servo - PCA9685"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.normalize = this.sandbox.spy(Board.Pins, "normalize");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.servo = new Servo({
      pin: 0,
      board: this.board,
      controller: "PCA9685",
      address: 0x40
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Servo.purge();
    this.sandbox.restore();
    Expander.purge();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Servo({
      controller: "PCA9685",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  withAddress(test) {
    test.expect(1);

    new Servo({
      pin: 1,
      board: this.board,
      controller: "PCA9685",
      address: 0x41
    });
    test.equal(Expander.byAddress(0x41).name, "PCA9685");
    test.done();
  },

  withoutAddress(test) {
    test.expect(2);

    Expander.purge();

    // Assert there is not another by the default address
    test.equal(Expander.byAddress(0x40), undefined);

    this.servo = new Servo({
      pin: 1,
      board: this.board,
      controller: "PCA9685"
    });
    test.equal(Expander.byAddress(0x40).name, "PCA9685");

    test.done();
  },

  defaultFrequency(test) {
    test.expect(1);
    test.equal(this.servo.frequency, 50);
    test.done();
  },

  customFrequency(test) {
    test.expect(1);

    this.servo = new Servo({
      frequency: 60,
      pin: 0,
      controller: "PCA9685",
      board: this.board
    });
    test.equal(this.servo.frequency, 60);
    test.done();
  },

  noNormalization(test) {
    test.expect(1);
    test.equal(this.normalize.callCount, 0);
    test.done();
  },

  to(test) {
    test.expect(6);
    this.i2cWrite.reset();

    this.servo.to(20);
    test.equal(this.i2cWrite.args[0][0], 0x40);
    test.equal(this.i2cWrite.args[0][1][0], 6);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 151);
    test.equal(this.i2cWrite.args[0][1][4], 0);

    test.done();

  },

};

Object.keys(Servo.Controllers).forEach(name => {
  exports[`Servo - Controller, ${name}`] = addControllerTest(Servo, Servo.Controllers[name], {
    controller: name
  });
});
