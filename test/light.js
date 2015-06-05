var sinon = require("sinon");
var Emitter = require("events").EventEmitter;
var MockFirmata = require("./util/mock-firmata");
var EVS = require("../lib/evshield");
var five = require("../lib/johnny-five");
var Board = five.Board;
var Light = five.Light;

var io = new MockFirmata();
var board = new Board({
  debug: false,
  repl: false,
  io: io,
});

var proto = [{
  name: "within"
}];

var instance = [{
  name: "value"
}, {
  name: "intensity"
}];

exports["Light"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.light = new Light({
      pin: "A1",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.light[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.light[property.name], 0);
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);
    test.ok(this.light instanceof Emitter);
    test.done();
  }
};

exports["Light: EVS_EV3"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    this.ev3setup = sinon.spy(EVS.prototype, "setup");
    this.ev3read = sinon.spy(EVS.prototype, "read");

    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
      callback([15, 0]);
    });

    this.light = new Light({
      controller: "EVS_EV3",
      pin: "BAS1",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.ev3setup.restore();
    this.ev3read.restore();

    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();

    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.light[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.light[property.name], 0);
    }, this);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = sinon.spy();
    test.expect(2);

    this.clock.tick(250);

    this.light.within([10, 20], "intensity", function() {
      test.equal(this.intensity, 15);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Light: EVS_NXT"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    this.ev3setup = sinon.spy(EVS.prototype, "setup");
    this.ev3read = sinon.spy(EVS.prototype, "read");

    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
      callback([100, 3]);
    });

    this.light = new Light({
      controller: "EVS_NXT",
      pin: "BAS1",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.ev3setup.restore();
    this.ev3read.restore();

    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();

    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.light[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.light[property.name], 0);
    }, this);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = sinon.spy();
    test.expect(2);

    this.clock.tick(250);

    this.light.within([10, 20], "intensity", function() {
      test.equal(this.intensity, 15);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};
