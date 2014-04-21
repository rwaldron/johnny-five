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

  data: function(test) {

    var x = this.analogRead.args[0][1],
      y = this.analogRead.args[1][1],
      spy = sinon.spy();

    test.expect(1);
    this.gyro.on("data", spy);

    x(225);
    y(255);

    this.clock.tick(100);

    test.ok(spy.calledTwice);
    test.done();
  },

  change: function(test) {

    var x = this.analogRead.args[0][1],
      y = this.analogRead.args[1][1],
      spy = sinon.spy();

    test.expect(1);
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
