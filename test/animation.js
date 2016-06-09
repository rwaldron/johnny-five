exports["Animation"] = {
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

    this.mockChain = {
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

    this.animation = new Animation(this.a);
    test.expect(4);

    var tempSegment = this.segment.single;
    this.animation.enqueue(tempSegment);

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

    var tempSegment = this.segment.multi;

    this.animation.enqueue(tempSegment);

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

    var tempSegment = this.segment.multi;
    tempSegment.keyFrames = [this.segment.multi.keyFrames[0]];

    this.animation.enqueue(tempSegment);

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

    var tempSegment = this.segment.single;

    tempSegment.progress = 0.4;

    this.animation.enqueue(tempSegment);

    test.ok(Math.abs(this.animation.playLoop.calledAt - this.animation.startTime - 200) < 5);
    test.ok(Math.abs(this.animation.endTime - this.animation.playLoop.calledAt - 300) < 5);
    test.done();

  },

  reverse: function(test) {
    this.animation = new Animation(this.a);
    test.expect(2);

    var tempSegment = this.segment.single,
      testContext = this;

    tempSegment.reverse = true;

    this.animation.enqueue(tempSegment);

    var indices = this.animation.findIndices(0.4);
    var val = this.animation.tweenedValue(indices, 0.4);

    this.animation.target["@@render"](val);
    test.equal(testContext.servoWrite.args[1][0], 3);
    test.equal(testContext.servoWrite.args[1][1], 80);

    test.done();
  },

  timelineEasing: function(test) {

    this.animation = new Animation(this.a);
    test.expect(1);

    var tempSegment = this.segment.single;

    tempSegment.easing = "inOutCirc";
    tempSegment.progress = 0.8;
    this.animation.enqueue(tempSegment);

    var progress = this.animation.calculateProgress(this.animation.playLoop.calledAt);

    test.ok(Math.abs(progress - 0.958 < 0.01));
    test.done();

  },

  keyframeEasing: function(test) {

    this.animation = new Animation(this.a);
    test.expect(1);

    var tempSegment = this.segment.single;

    tempSegment.keyFrames[3] = {
      step: 33,
      easing: "inOutCirc"
    };
    tempSegment.progress = 0.9;
    this.animation.enqueue(tempSegment);

    var progress = this.animation.calculateProgress(this.animation.playLoop.calledAt);
    var indices = this.animation.findIndices(progress);
    var val = this.animation.tweenedValue(indices, progress);

    test.ok(Math.abs(val - 74.843 < 0.01));
    test.done();
  },

  additiveEasing: function(test) {

    this.animation = new Animation(this.a);
    test.expect(1);

    var tempSegment = this.segment.single;

    tempSegment.easing = "inOutCirc";
    tempSegment.keyFrames[3] = {
      step: 33,
      easing: "inOutCirc"
    };
    tempSegment.progress = 0.9;
    this.animation.enqueue(tempSegment);

    var progress = this.animation.calculateProgress(this.animation.playLoop.calledAt);
    var indices = this.animation.findIndices(progress);
    var val = this.animation.tweenedValue(indices, progress);

    test.ok(Math.abs(val - 77.970 < 0.01));
    test.done();

  },

  tweenTuple: function(test) {

    this.animation = new Animation(this.mockChain);

    test.expect(3);

    var tempSegment = this.segment.multi;

    tempSegment.keyFrames = [null, {
      position: [60, 10, 10]
    }, null, {
      position: [10, 40, 20]
    }, {
      position: [10, 80, 20]
    }, {
      position: [50, 60, -20]
    }];
    tempSegment.cuePoints = [0, 0.3, 0.4, 0.5, 0.8, 1.0];

    tempSegment.progress = 0.9;
    this.animation.enqueue(tempSegment);

    var indices = this.animation.findIndices(0.9);
    var tweenedValue = this.animation.tweenedValue(indices, 0.9);

    test.equal(tweenedValue[0][0], 30);
    test.equal(tweenedValue[0][1], 70);
    test.equal(tweenedValue[0][2], 0);

    test.done();
  },

  tweenFromProperties: function(test) {
    test.expect(3);

    this.mockChain[Animation.keys] = ["a", "b", "c"];
    this.animation = new Animation(this.mockChain);

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
