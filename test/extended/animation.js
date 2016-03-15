var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata,
  five = require("../../lib/johnny-five.js"),
  sinon = require("sinon"),
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

    this.servoArray = new five.Servo.Array([this.a, this.b, this.c]);

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

  longRunning: function(test) {

    this.animation = new five.Animation(this.servoArray);

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

  }

};
