var MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Servo = five.Servo,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Servo"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.servoWrite = sinon.spy(board.io, "servoWrite");
    this.servo = new Servo({
      pin: 11,
      board: board
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
    }, {
      name: "write"
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
      name: "isInverted"
    }, {
      name: "type"
    }, {
      name: "specs"
    }, {
      name: "interval"
    }, {
      name: "value"
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
      test.equal(typeof this.servo[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.servo[property.name], "undefined");
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);

    test.ok(this.servo instanceof events.EventEmitter);

    test.done();
  },

  startAt: function(test) {
    test.expect(1);

    this.spy = sinon.spy(Servo.prototype, "to");

    this.servo = new Servo({
      pin: 11,
      board: board,
      startAt: 90
    });

    test.ok(this.spy.called);

    test.done();
  },

  center: function(test) {
    test.expect(1);

    this.spy = sinon.spy(Servo.prototype, "center");

    this.servo = new Servo({
      pin: 11,
      board: board,
      center: true
    });

    test.ok(this.spy.called);

    test.done();

  },

  isInverted: function(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: board,
      isInverted: true
    });

    this.servo.to(180);

    test.ok(this.servoWrite.calledWith(11, 0));

    this.servo.to(135);

    test.ok(this.servoWrite.calledWith(11, 45));

    this.servo.to(90);

    test.ok(this.servoWrite.calledWith(11, 90));

    test.done();
  },

  rate: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: board
    });

    this.servo.to(0);
    this.servo.to(180, 1000, 100);

    this.clock.tick(1010);

    test.equal(this.servo.position, 180);
    test.ok(this.servoWrite.callCount === 101);

    test.done();
  },

  fps: function(test) {
    test.expect(1);

    this.servo = new Servo({
      pin: 11,
      board: board,
      fps: 50
    });

    this.servo.to(0);
    this.servo.to(180, 1000);

    this.clock.tick(1010);

    test.ok(this.servoWrite.callCount === 51);

    test.done();
  },

  resolutionLimited: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: board
    });

    this.servo.to(0);
    this.servo.to(90, 1000, 255);

    this.clock.tick(1010);

    test.ok(this.servoWrite.callCount === 91);
    test.equal(this.servo.position, 90);

    test.done();
  },

  type: function(test) {
    test.expect(1);

    test.equal(this.servo.type, "standard");

    test.done();
  },

  value: function(test) {
    test.expect(1);

    this.servo.to(100);

    test.equal(this.servo.value, 100);

    test.done();
  },
};

exports["Servo - Continuous"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.servoWrite = sinon.spy(board.io, "servoWrite");

    this.a = new Servo({
      pin: 11,
      type: "continuous",
      board: board
    });

    this.b = new Servo.Continuous({
      pin: 11,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.servoWrite.restore();
    done();
  },

  type: function(test) {
    test.expect(2);

    test.equal(this.a.type, "continuous");
    test.equal(this.b.type, "continuous");


    test.done();
  },

  cw: function(test) {
    test.expect(2);

    this.a.cw();
    test.ok(this.servoWrite.calledWith(11, 180));

    this.servoWrite.restore();

    this.b.cw();
    test.ok(this.servoWrite.calledWith(11, 180));


    test.done();
  },

  ccw: function(test) {
    test.expect(2);

    this.a.ccw();
    test.ok(this.servoWrite.calledWith(11, 0));

    this.servoWrite.restore();

    this.b.ccw();
    test.ok(this.servoWrite.calledWith(11, 0));


    test.done();
  },
};
