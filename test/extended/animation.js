exports["Animation"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
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
        var last = [{
          degrees: 50
        }, {
          degrees: 70
        }, -20];

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
      long: {
        duration: 7000,
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
        ]
      },
      short: {
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
        ]
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
    Servo.purge();
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

  longRunning: function(test) {

    this.animation = new Animation(this.servos);

    test.expect(2);

    this.animation.enqueue(this.segment.long);

    setTimeout(function() {
      test.ok(this.animation.playLoop.calledAt);
    }.bind(this), 3000);

    setTimeout(function() {
      test.ok(this.animation.playLoop.interval);
      this.animation.stop();
      test.done();
    }.bind(this), 6000);

  },

  /*
   * IEEE 754-2008 spec limits the accuracy of pi (well I suppose all Number
   * formats limit pi) but when using easing functions that have Math.Pi as a
   * factor we may never reach 1 on the eased value. We need to make sure we
   * are using the pre-eased linear value when testing for the endpoints of
   * the animation.
   */
  roundedPi: function(test) {
    this.animation = new Animation(this.servos);
    test.expect(2);

    var complete = false;
    var tempSegment = this.segment.short;

    tempSegment.easing = "inSine";
    tempSegment.progress = 0.5;

    tempSegment.oncomplete = function() {
      complete = true;
    };

    this.animation.enqueue(tempSegment);

    setTimeout(function() {
      test.ok(this.animation.progress === 1);
      test.ok(complete === true);
      test.done();
    }.bind(this), 300);

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

  loopFunction: function(test) {
    test.expect(34);

    this.animation = new Animation(this.chain);
    this.animation.playLoop = {
      stop: this.sandbox.spy(),
    };
    this.progress = 1;
    this.clock = this.sandbox.useFakeTimers();
    this.stop = this.sandbox.stub(this.animation, "stop");
    this.next = this.sandbox.stub(this.animation, "next");
    this.normalizeKeyframes = this.sandbox.stub(this.animation, "normalizeKeyframes");
    this.calculateProgress = this.sandbox.stub(this.animation, "calculateProgress", function() {
      this.animation.progress = this.progress;
      this.animation.loopback = this.progress;
      return this.progress;
    }.bind(this));
    this.findIndices = this.sandbox.stub(this.animation, "findIndices").returns({ left: 2, right: 3});
    this.tweenedValue = this.sandbox.stub(this.animation, "tweenedValue").returns([145]);

    this.animation.onloop = this.sandbox.spy();
    this.animation.target = {};
    this.animation.target["@@render"] = this.sandbox.spy();

    this.animation.fallBackTime = 0;
    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.calculateProgress.callCount, 1);
    test.equal(this.findIndices.callCount, 1);
    test.equal(this.tweenedValue.callCount, 1);

    this.animation.playLoop = null;
    this.animation.fallBackTime = 0;
    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.calculateProgress.callCount, 2);
    test.equal(this.findIndices.callCount, 2);
    test.equal(this.tweenedValue.callCount, 2);

    this.animation.playLoop = null;
    this.animation.fallBackTime = 2;
    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.calculateProgress.callCount, 3);
    test.equal(this.findIndices.callCount, 3);
    test.equal(this.tweenedValue.callCount, 3);

    this.animation.progress = 0.5;
    this.animation.reverse = false;
    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.calculateProgress.callCount, 4);
    test.equal(this.findIndices.callCount, 4);
    test.equal(this.tweenedValue.callCount, 4);

    this.animation.progress = 1;
    this.animation.loopback = 1;
    this.animation.reverse = true;
    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.calculateProgress.callCount, 5);
    test.equal(this.findIndices.callCount, 5);
    test.equal(this.tweenedValue.callCount, 5);


    this.animation.loop = true;
    this.animation.progress = 1;
    this.animation.loopback = 1;
    this.animation.metronomic = false;
    this.animation.reverse = false;
    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.calculateProgress.callCount, 6);
    test.equal(this.findIndices.callCount, 6);
    test.equal(this.tweenedValue.callCount, 6);

    this.animation.loop = true;
    this.animation.progress = 1;
    this.animation.loopback = 1;
    this.animation.metronomic = true;
    this.animation.reverse = false;
    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.calculateProgress.callCount, 7);
    test.equal(this.findIndices.callCount, 7);
    test.equal(this.tweenedValue.callCount, 7);

    this.animation.onloop = null;
    this.animation.loop = true;
    this.animation.progress = 1;
    this.animation.loopback = 1;
    this.animation.metronomic = false;
    this.animation.reverse = false;
    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.calculateProgress.callCount, 8);
    test.equal(this.findIndices.callCount, 8);
    test.equal(this.tweenedValue.callCount, 8);

    this.stop.reset();
    this.animation.loop = false;
    this.animation.progress = 1;
    this.animation.loopback = 1;
    this.animation.metronomic = false;
    this.animation.reverse = false;
    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.stop.callCount, 1);
    test.equal(this.calculateProgress.callCount, 9);
    test.equal(this.findIndices.callCount, 9);
    test.equal(this.tweenedValue.callCount, 9);

    this.stop.reset();
    this.animation.loop = false;
    this.animation.progress = 1;
    this.animation.loopback = 1;
    this.animation.metronomic = false;
    this.animation.reverse = false;
    this.animation.segments.push(1, 2, 3);
    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.stop.callCount, 1);
    test.equal(this.next.callCount, 1);
    test.equal(this.calculateProgress.callCount, 10);
    test.equal(this.findIndices.callCount, 10);
    test.equal(this.tweenedValue.callCount, 10);

    this.animation.oncomplete = function() {
      test.done();
    };

    this.animation.loopFunction({ calledAt: 1 });

    test.equal(this.animation.target["@@render"].callCount, 11);
  },

};
