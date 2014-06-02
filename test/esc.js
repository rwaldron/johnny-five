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
    test.expect(1);

    this.spy = sinon.spy(ESC.prototype, "speed");

    this.esc = new ESC({
      pin: 12,
      board: board,
      startAt: 0
    });

    test.ok(this.spy.called);

    test.done();
  },

  to: function(test) {
    test.expect(3);

    this.esc = new ESC({
      pin: 12,
      board: board,
      startAt: 0
    });

    this.esc.speed(10);
    this.clock.tick(120);
    test.equal(this.servoWrite.callCount, 10);

    this.servoWrite.reset();

    this.esc.speed(9);
    this.clock.tick(50);
    test.equal(this.servoWrite.callCount, 1);

    this.servoWrite.reset();

    this.esc.speed(12);
    this.clock.tick(30);
    test.equal(this.servoWrite.callCount, 3);

    test.done();
  }

};
