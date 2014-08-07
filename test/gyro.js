var MockFirmata = require("./mock-firmata"),
  pins = require("./mock-pins"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Gyro = five.Gyro,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Gyro"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.gyro = new Gyro({
      pins: ["A0", "A1"],
      freq: 100,
      board: board
    });

    this.proto = [];

    this.instance = [{
      name: "isCalibrated"
    }, {
      name: "pitch"
    }, {
      name: "roll"
    }, {
      name: "x"
    }, {
      name: "y"
    }, {
      name: "rate"
    }];

    done();
  },

  tearDown: function(done) {
    this.analogRead.restore();
    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.gyro[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.gyro[property.name], "undefined");
    }, this);

    test.done();
  },

  isCalibrated: function(test) {
    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];
    var spy = sinon.spy();

    test.expect(2);
    test.ok(!this.gyro.isCalibrated);

    for (var i = 0; i < 101; i++) {
      x(225);
      y(255);
    }

    test.ok(this.gyro.isCalibrated);
    test.done();
  },

  recalibrate: function(test) {
    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];
    var spy = sinon.spy();

    test.expect(4);
    test.ok(!this.gyro.isCalibrated);

    for (var i = 0; i < 101; i++) {
      x(225);
      y(255);
    }

    test.ok(this.gyro.isCalibrated);

    this.gyro.recalibrate();

    test.ok(!this.gyro.isCalibrated);

    for (i = 0; i < 101; i++) {
      x(225);
      y(255);
    }

    test.ok(this.gyro.isCalibrated);

    test.done();
  },

  data: function(test) {
    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];
    var spy = sinon.spy();

    test.expect(1);

    this.gyro.isCalibrated = true;
    this.gyro.on("data", spy);

    x(225);
    y(255);

    this.clock.tick(100);

    test.ok(spy.calledTwice);
    test.done();
  },

  change: function(test) {
    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];
    var spy = sinon.spy();

    test.expect(1);

    this.gyro.isCalibrated = true;
    this.gyro.on("change", spy);

    x(225);

    this.clock.tick(100);

    x(255);

    this.clock.tick(100);

    y(225);

    this.clock.tick(100);

    y(255);

    this.clock.tick(100);

    test.equal(spy.callCount, 4);
    test.done();
  }

  // TODO: tests for pitch, roll, x, y, and rate
};
