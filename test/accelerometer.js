var MockFirmata = require("./mock-firmata"),
  pins = require("./mock-pins"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Accelerometer = five.Accelerometer,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Accelerometer"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.accel = new Accelerometer({
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
      name: "z"
    }, {
      name: "orientation"
    }, {
      name: "inclination"
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
      test.equal(typeof this.accel[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.accel[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {

    var x = this.analogRead.args[0][1],
      y = this.analogRead.args[1][1],
      spy = sinon.spy();

    test.expect(2);
    this.accel.on("data", spy);

    x(512);
    y(560);


    this.clock.tick(100);

    test.ok(spy.calledTwice);
    test.deepEqual(spy.args[1], [{
      x: 512,
      y: 560,
      z: 0
    }]);

    test.done();
  },

  change: function(test) {

    var x = this.analogRead.args[0][1],
      y = this.analogRead.args[1][1],
      spy = sinon.spy();

    test.expect(1);
    this.accel.on("change", spy);


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
  },
  orientation: function(test) {

    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];
    var spy = sinon.spy();
    var i;

    test.expect(6);

    this.accel.on("orientation", spy);

    for (i = 0; i < 5; i++) {
      x(559);
      y(571);
    }
    test.equal(this.accel.orientation, 1);

    for (i = 0; i < 5; i++) {
      x(577);
      y(568);
    }
    test.equal(this.accel.orientation, 2);

    for (i = 0; i < 5; i++) {
      x(476);
      y(571);
    }
    test.equal(this.accel.orientation, -1);

    for (i = 0; i < 5; i++) {
      x(571);
      y(476);
    }
    test.equal(this.accel.orientation, -2);

    for (i = 0; i < 5; i++) {
      x(580);
      y(650);
    }
    test.equal(this.accel.orientation, 3);

    test.ok(spy.called);

    test.done();
  }
};
