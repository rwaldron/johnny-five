var MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  temporal = require("temporal"),
  board = new five.Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Animation"] = {
  setUp: function(done) {
    this.servoWrite = sinon.spy(board.io, "servoWrite");

    this.a = new five.Servo({
      pin: 3,
      board: board
    });

    this.b = new five.Servo({
      pin: 5,
      board: board,
      startAt: 20
    });

    this.c = new five.Servo({
      pin: 6,
      board: board
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

    this.servoArray = new five.Servo.Array([this.a, this.b, this.c]);

    this.segment = {
      single: {
        duration: 500,
        fps: 10,
        cuePoints: [0, 0.33, 0.66, 1.0],
        keyFrames: [null, false, { degrees: 45 }, 33]
      },
      multi: {
        duration: 500,
        fps: 10,
        cuePoints: [0, 0.33, 0.66, 1.0],
        keyFrames: [
          [null, false, { degrees: 45 }, 33],
          [null, 46, { degrees: 180 }, -120],
          [null, { degrees: 120 }, { step: 60 }]
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
    this.servoWrite.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.animation = new five.Animation(this.a);

    this.proto.forEach(function(method) {
      test.equal(typeof this.animation[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.animation[property.name], "undefined");
    }, this);

    test.done();
  },

  normalizeServo: function(test) {

    this.animation = new five.Animation(this.a);
    test.expect(4);

    var tempSegment = this.segment.single;

    tempSegment.oncomplete = function() {
      test.done();
    };

    this.animation.enqueue(tempSegment);
    test.equal(this.animation.normalizedKeyFrames[0][0].degrees, 90);
    test.equal(this.animation.normalizedKeyFrames[0][1].degrees, 90);
    test.equal(this.animation.normalizedKeyFrames[0][2].degrees, 45);
    test.equal(this.animation.normalizedKeyFrames[0][3].degrees, 78);
  },

  normalizeServoArray: function(test) {
    this.animation = new five.Animation(this.servoArray);
    test.expect(12);

    var tempSegment = this.segment.multi;

    tempSegment.oncomplete = function() {
      test.done();
    };

    this.animation.enqueue(tempSegment);

    test.equal(this.animation.normalizedKeyFrames[0][0].degrees, 90);
    test.equal(this.animation.normalizedKeyFrames[0][1].degrees, 90);
    test.equal(this.animation.normalizedKeyFrames[0][2].degrees, 45);
    test.equal(this.animation.normalizedKeyFrames[0][3].degrees, 78);
    test.equal(this.animation.normalizedKeyFrames[1][0].degrees, 20);
    test.equal(this.animation.normalizedKeyFrames[1][1].degrees, 66);
    test.equal(this.animation.normalizedKeyFrames[1][2].degrees, 180);
    test.equal(this.animation.normalizedKeyFrames[1][3].degrees, 60);
    test.equal(this.animation.normalizedKeyFrames[2][0].degrees, 90);
    test.equal(this.animation.normalizedKeyFrames[2][1].degrees, 120);
    test.equal(this.animation.normalizedKeyFrames[2][2].degrees, 180);
    test.equal(this.animation.normalizedKeyFrames[2][3].degrees, 180);

  },

  rightPadKeyframes: function(test) {
    this.animation = new five.Animation(this.servoArray);
    test.expect(6);

    var tempSegment = this.segment.multi;
    var tempKeyFrames = tempSegment.keyFrames;
    tempSegment.keyFrames = [this.segment.multi.keyFrames[0]];

    tempSegment.oncomplete = function() {
      test.done();
    };

    this.animation.enqueue(tempSegment);

    test.equal(this.animation.normalizedKeyFrames[0][0].degrees, 90);
    test.equal(this.animation.normalizedKeyFrames[0][1].degrees, 90);
    test.equal(this.animation.normalizedKeyFrames[0][2].degrees, 45);
    test.equal(this.animation.normalizedKeyFrames[0][3].degrees, 78);
    test.equal(this.animation.normalizedKeyFrames[1], null);
    test.equal(this.animation.normalizedKeyFrames[2], null);
  },

  callCountServo: function(test) {

    this.animation = new five.Animation(this.a);
    test.expect(6);

    var tempSegment = this.segment.single,
      testContext = this,
      startTime = Date.now();

    tempSegment.oncomplete = function() {
      test.ok(testContext.servoWrite.callCount === 6);
      test.ok(Math.abs(testContext.servoWrite.args[1][1] - 90) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[2][1] - 80) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[3][1] - 53) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[4][1] - 58) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[5][1] - 78) < 1);
      test.done();
    };

    this.animation.enqueue(tempSegment);

  },

  callCountServoArray: function(test) {

    this.animation = new five.Animation(this.servoArray);
    test.expect(1);

    var tempSegment = this.segment.multi,
      testContext = this;

    tempSegment.oncomplete = function() {
      test.ok(testContext.servoWrite.callCount === 15);
      test.done();
    };

    this.animation.enqueue(tempSegment);

  },

  duration: function(test) {

    this.animation = new five.Animation(this.a);
    test.expect(1);

    var tempSegment = this.segment.single,
      testContext = this,
      startTime = Date.now();

    tempSegment.duration = 200;
    tempSegment.oncomplete = function() {
      // We are within 5ms of expected time
      test.ok(Math.abs(Date.now() - startTime - 200) < 5);
      test.done();
    };

    this.animation.enqueue(tempSegment);

  },

  progress: function(test) {
    this.animation = new five.Animation(this.a);
    test.expect(1);

    var tempSegment = this.segment.single,
      testContext = this,
      startTime = Date.now();

    tempSegment.progress = 0.4;
    tempSegment.oncomplete = function() {
      // We are within 5ms of expected time
      test.ok(Math.abs(Date.now() - startTime - 300) < 5);
      test.done();
    };

    this.animation.enqueue(tempSegment);
  },

  reverse: function(test) {
    this.animation = new five.Animation(this.a);
    test.expect(4);

    var tempSegment = this.segment.single,
      testContext = this,
      startTime = Date.now();

    tempSegment.reverse = true;
    tempSegment.oncomplete = function() {
      test.ok(Math.abs(testContext.servoWrite.args[1][1] - 58) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[2][1] - 53) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[3][1] - 80) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[4][1] - 90) < 1);
      test.done();
    };

    this.animation.enqueue(tempSegment);
  },

  loop: function(test) {

    this.animation = new five.Animation(this.a);
    this.count = 0;

    test.expect(1);

    var tempSegment = this.segment.single,
      startTime = Date.now(),
      testContext = this;

    tempSegment.loop = true;

    tempSegment.onloop = function() {
      testContext.count++;
      if (testContext.count > 2) {
        testContext.animation.playLoop.stop();
        test.ok(Math.abs(testContext.servoWrite.callCount - 13) <= 1);
        test.done();
      }
    };

    testContext.servoWrite.reset();
    this.animation.enqueue(tempSegment);

  },

  loopback: function(test) {

    this.animation = new five.Animation(this.a);
    this.count = 0;

    test.expect(2);

    var tempSegment = this.segment.single,
      startTime = Date.now(),
      testContext = this;

    tempSegment.loop = true;
    tempSegment.loopback = 0.4;

    tempSegment.onloop = function() {
      testContext.count++;
      if (testContext.count > 2) {
        testContext.animation.playLoop.stop();
        test.ok(Math.abs(Date.now() - startTime - 1100) < 5);
        test.ok(testContext.servoWrite.callCount === 12);
        test.done();
      }
    };

    this.animation.enqueue(tempSegment);

  },

  onstop: function(test) {

    this.animation = new five.Animation(this.a);
    test.expect(1);

    var tempSegment = this.segment.single,
      testContext = this;

    tempSegment.onstop = function() {
      if (testContext.servoWrite.callCount !== 4) {
        console.log("Expected servoWrite to be call 4 times.", "Duration:" + String(Date.now() - testContext.startTime), testContext.servoWrite.args);
      }

      test.ok(testContext.servoWrite.callCount === 4);
      test.done();
    };

    testContext.startTime = Date.now();
    this.animation.enqueue(tempSegment);
    temporal.queue([{
      delay: 350,
      task: function() {
        testContext.animation.stop();
        testContext.animation.playLoop.stop();
      }
    }]);

  },

  onstart: function(test) {

    this.animation = new five.Animation(this.a);
    test.expect(1);

    var tempSegment = this.segment.single,
      testContext = this;

    tempSegment.onstart = function() {

      temporal.queue([{
        delay: 300,
        task: function() {
          testContext.animation.stop();
          testContext.animation.playLoop.stop();
          test.ok(testContext.servoWrite.callCount === 3);
          test.done();
        }
      }]);
    };

    this.animation.enqueue(tempSegment);

  },

  timelineEasing: function(test) {

    this.animation = new five.Animation(this.a);
    test.expect(5);

    var tempSegment = this.segment.single,
      testContext = this;

    tempSegment.easing = "inOutCirc";
    tempSegment.oncomplete = function() {
      test.ok(testContext.servoWrite.callCount === 5);
      test.ok(Math.abs(testContext.servoWrite.args[1][1] - 90) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[2][1] - 58) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[3][1] - 73) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[4][1] - 78) < 1);
      test.done();
    };

    this.animation.enqueue(tempSegment);

  },

  keyframeEasing: function(test) {

    this.animation = new five.Animation(this.a);
    test.expect(6);

    var tempSegment = this.segment.single,
      testContext = this;

    tempSegment.keyFrames[3].easing = "inOutCirc";
    tempSegment.oncomplete = function() {
      test.ok(testContext.servoWrite.callCount === 6);
      test.ok(Math.abs(testContext.servoWrite.args[1][1] - 90) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[2][1] - 80) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[3][1] - 53) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[4][1] - 58) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[5][1] - 78) < 1);
      test.done();
    };

    this.animation.enqueue(tempSegment);

  },

  additiveEasing: function(test) {

    this.animation = new five.Animation(this.a);
    test.expect(5);

    var tempSegment = this.segment.single,
      testContext = this;

    tempSegment.easing = "inOutCirc";
    tempSegment.keyFrames[2].easing = "inOutCirc";

    tempSegment.oncomplete = function() {
      test.ok(testContext.servoWrite.callCount === 5);
      test.ok(Math.abs(testContext.servoWrite.args[1][1] - 90) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[2][1] - 58) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[3][1] - 73) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[4][1] - 78) < 1);
      test.done();
    };

    this.animation.enqueue(tempSegment);

  },

  // cuePoints: [0, 0.33, 0.66, 1.0],
  // keyFrames: [null, false, { degrees: 45 }, 33]
  metronomic: function(test) {
    this.animation = new five.Animation(this.a);

    test.expect(10);

    var tempSegment = this.segment.single,
      startTime = Date.now(),
      testContext = this;

    tempSegment.metronomic = true;
    tempSegment.oncomplete = function() {
      testContext.animation.stop();
      test.ok(Math.abs(testContext.servoWrite.args[1][1] - 90) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[2][1] - 80) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[3][1] - 53) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[4][1] - 58) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[5][1] - 78) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[6][1] - 58) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[7][1] - 51) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[8][1] - 71) <= 1);
      test.ok(Math.abs(testContext.servoWrite.args[9][1] - 78) < 1);
      test.ok(testContext.servoWrite.callCount === 10);
      test.done();
    };

    this.animation.enqueue(tempSegment);

  },

  speedChange: function(test) {

    this.animation = new five.Animation(this.a);

    test.expect(2);

    var tempSegment = this.segment.single,
      testContext = this;

    tempSegment.currentSpeed = 0.5;

    temporal.queue([{
      delay: 525,
      task: function() {
        test.ok(testContext.servoWrite.callCount === 4);
        testContext.animation.speed(1);
      }
    }, {
      delay: 325,
      task: function() {
        test.ok(testContext.servoWrite.callCount === 7);
        test.done();
      }
    }]);

    this.animation.enqueue(tempSegment);

  },

  enqueueWhilePaused: function(test) {

    this.animation = new five.Animation(this.a);

    test.expect(4);

    var tempSegment = this.segment.single,
      testContext = this;

    temporal.queue([{
      delay: 250,
      task: function() {
        test.ok(testContext.servoWrite.callCount === 3);
        testContext.animation.pause();
      }
    }, {
      delay: 250,
      task: function() {
        test.ok(testContext.servoWrite.callCount === 3);
        testContext.animation.enqueue(tempSegment);
      }
    }, {
      delay: 250,
      task: function() {
        test.ok(testContext.servoWrite.callCount === 3);
        testContext.animation.play();
      }
    }, {
      delay: 850,
      task: function() {
        test.ok(testContext.servoWrite.callCount === 10);
        test.done();
      }
    }]);

    this.animation.enqueue(tempSegment);

  },

  synchronousAnimations: function(test) {

    this.animation = new five.Animation(this.a);
    this.animationTwo = new five.Animation(this.b);

    test.expect(3);

    var tempSegment = this.segment.single,
      testContext = this;

    temporal.queue([{
      delay: 250,
      task: function() {
        test.ok(testContext.servoWrite.callCount === 3);
        testContext.animationTwo.enqueue(tempSegment);
      }
    }, {
      delay: 300,
      task: function() {
        test.ok(testContext.servoWrite.callCount === 8);
      }
    }, {
      delay: 250,
      task: function() {
        test.ok(testContext.servoWrite.callCount === 11);
        test.done();
      }
    }]);

    this.animation.enqueue(tempSegment);

  },

  tweenTuple: function(test) {

    this.animation = new five.Animation(this.mockChain);

    test.expect(15);

    var tempSegment = this.segment.multi,
      testContext = this;

    tempSegment.keyFrames = [null, { position: [60, 10, 10] }, null, { position: [10, 40, 20] }, { position: [10, 80, 20] }, { position: [50, 60, -20] } ];
    tempSegment.cuePoints = [0, 0.3, 0.4, 0.5, 0.8, 1.0];

    tempSegment.oncomplete = function() {
        test.ok(Math.abs(testContext.mockChain.result[0][0] - 56.66) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[0][1] - 6.66) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[0][2]) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[1][0] - 35) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[1][1] - 25) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[1][2] - 15) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[2][0] - 10) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[2][1] - 53.33) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[2][2] - 20) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[3][0] - 10) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[3][1] - 80) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[3][2] - 20) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[4][0] - 50) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[4][1] - 60) <= 1);
        test.ok(Math.abs(testContext.mockChain.result[4][2] + 20) <= 1);
        tempSegment.result = [];
        test.done();
    };

    this.animation.enqueue(tempSegment);

  }

};
