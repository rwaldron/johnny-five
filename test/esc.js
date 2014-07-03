var MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  ESC = five.ESC,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["ESC"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.servoWrite = sinon.spy(board.io, "servoWrite");
    this.esc = new ESC({
      pin: 12,
      board: board
    });

    this.proto = [{
      name: "speed"
    }, {
      name: "min"
    }, {
      name: "max"
    }, {
      name: "stop"
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
      name: "interval"
    }, {
      name: "startAt"
    }];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.servoWrite.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.esc[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.esc[property.name], "undefined");
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);

    test.ok(this.esc instanceof events.EventEmitter);

    test.done();
  },

  startAt: function(test) {
    test.expect(2);

    this.spy = sinon.spy(ESC.prototype, "speed");

    this.esc = new ESC({
      pin: 12,
      board: board,
      startAt: 1
    });

    test.ok(this.spy.called);
    this.clock.tick(10);

    test.equal(this.servoWrite.callCount, 1);
    test.done();
  },

  speed: function(test) {
    test.expect(6);

    this.esc.speed(10);
    this.clock.tick(120);
    test.equal(this.servoWrite.callCount, 10);
    // (10 * 180 / 100) | 0 = 18
    test.equal(this.servoWrite.lastCall.args[1], 18);

    this.servoWrite.reset();

    this.esc.speed(9);
    this.clock.tick(10);
    test.equal(this.servoWrite.callCount, 1);
    // (9 * 180 / 100) | 0 = 16
    test.equal(this.servoWrite.lastCall.args[1], 16);

    this.servoWrite.reset();

    this.esc.speed(12);
    this.clock.tick(30);
    test.equal(this.servoWrite.callCount, 3);
    // (12 * 180 / 100) | 0 = 16
    test.equal(this.servoWrite.lastCall.args[1], 21);

    test.done();
  },
  constrainSpeed: function(test) {
    test.expect(2);

    this.esc.speed(1000);
    this.clock.tick(1000);

    // 100 steps, not 1000
    test.equal(this.servoWrite.callCount, 100);
    test.equal(this.esc.value, 100);

    test.done();
  },

  speedIgnoresDupCommand: function(test) {
    test.expect(1);

    var intervalId;

    this.esc.speed(1);
    this.esc.speed(50);
    this.clock.tick(10);
    intervalId = this.esc.interval;

    this.esc.speed(50);
    this.clock.tick(10);

    // When receiving a duplicate, the in-progress
    // interval will not be interrupted.
    test.equal(intervalId, this.esc.interval);

    test.done();
  },

  speedInterruptsInterval: function(test) {
    test.expect(1);

    var intervalId;

    this.esc.speed(1);
    this.esc.speed(50);
    this.clock.tick(10);
    intervalId = this.esc.interval;

    this.esc.speed(60);
    this.clock.tick(10);

    // When receiving a unique speed, the in-progress
    // interval will be interrupted.
    test.notEqual(intervalId, this.esc.interval);

    test.done();
  },

  range: function(test) {
    test.expect(2);

    this.esc.range[0] = 50;
    this.esc.range[1] = 60;

    this.esc.speed(40);
    // constrained to the lower range boundary
    test.equal(this.esc.value, 50);

    this.esc.speed(70);
    // constrained to the upper range boundary
    test.equal(this.esc.value, 60);

    test.done();
  },

  pwmRange: function(test) {
    // test.expect(2);

    this.esc = new ESC({
      pin: 12,
      board: board,
      startAt: 0, // This will be constrained to the range!
      pwmRange: [1000, 1100]
    });

    // PWM Range is processed into 0-100 range
    test.equal(this.esc.range[0], 22);
    test.equal(this.esc.range[1], 27);

    this.esc.speed(25);
    this.clock.tick(250);

    var length = this.servoWrite.args.length;

    // (25 * 180 / 100) | 0 = 45
    test.equal(this.servoWrite.lastCall.args[1], 45);

    test.done();
  },

  bailout: function(test) {
    test.expect(4);

    this.esc.speed(10);
    this.clock.tick(10);
    test.equal(this.esc.last.speed, 10);
    test.equal(this.servoWrite.args.length, 10);

    this.esc.speed(0);
    this.clock.tick(10);
    test.equal(this.esc.last.speed, 0);
    test.equal(this.servoWrite.args.length, 20);

    test.done();
  },

  accelerateDecelerate: function(test) {
    test.expect(4);

    this.esc.speed(10);
    this.clock.tick(100);
    test.equal(this.esc.last.speed, 10);
    test.equal(this.servoWrite.args.length, 10);

    this.esc.speed(0);
    this.clock.tick(100);
    test.equal(this.esc.last.speed, 0);
    test.equal(this.servoWrite.args.length, 20);

    test.done();
  },
};
