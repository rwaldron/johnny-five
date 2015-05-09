var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Motion = five.Motion,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Motion"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.digitalRead = sinon.spy(board.io, "digitalRead");
    this.motion = new Motion({
      pin: 7,
      calibrationDelay: 10,
      board: board
    });

    this.instance = [{
      name: "detectedMotion"
    }, {
      name: "isCalibrated"
    }];

    done();
  },

  tearDown: function(done) {
    this.motion.removeAllListeners();
    this.clock.restore();
    this.digitalRead.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.instance.length);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motion[property.name], "undefined");
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);

    test.ok(this.motion instanceof events.EventEmitter);

    test.done();
  },

  calibrated: function(test) {
    var spy = sinon.spy();
    test.expect(1);
    this.motion.on("calibrated", spy);
    this.clock.tick(10);
    test.ok(spy.calledOnce);
    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);
    this.motion.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  motionstart: function(test) {
    var callback = this.digitalRead.args[0][1],
      spy = sinon.spy();

    test.expect(1);
    this.motion.on("motionstart", spy);

    // 0 then changes to 1
    callback(0);
    callback(1);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  },

  motionend: function(test) {
    var callback = this.digitalRead.args[0][1],
      spy = sinon.spy();

    test.expect(1);
    this.motion.on("motionend", spy);

    // 1 then changes to 0
    callback(1);
    this.clock.tick(25);
    callback(0);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  }
};
