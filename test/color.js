var sinon = require("sinon");
var MockFirmata = require("./util/mock-firmata");
var EVS = require("../lib/evshield");
var five = require("../lib/johnny-five");
var Board = five.Board;
var Color = five.Color;

var io = new MockFirmata();
var board = new Board({
  debug: false,
  repl: false,
  io: io,
});

var proto = [];

var instance = [{
  name: "value"
}, {
  name: "rgb"
}];


exports["Color: EVS_EV3"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    this.evssetup = sinon.spy(EVS.prototype, "setup");
    this.evsread = sinon.spy(EVS.prototype, "read");

    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
      callback([0, 0]);
    });

    this.color = new Color({
      controller: "EVS_EV3",
      pin: "BAS1",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.evssetup.restore();
    this.evsread.restore();

    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();

    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.color[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.color[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.color.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.color.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

};

exports["Color: EVS_NXT"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    this.evssetup = sinon.spy(EVS.prototype, "setup");
    this.evsread = sinon.spy(EVS.prototype, "read");

    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
      callback([0]);
    });

    this.color = new Color({
      controller: "EVS_NXT",
      pin: "BAS1",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.evssetup.restore();
    this.evsread.restore();

    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();

    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.color[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.color[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.color.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.color.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

};

exports["Color: ISL29125"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    this.evssetup = sinon.spy(EVS.prototype, "setup");
    this.evsread = sinon.spy(EVS.prototype, "read");

    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
      callback([0]);
    });

    this.color = new Color({
      controller: "ISL29125",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.evssetup.restore();
    this.evsread.restore();

    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();

    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.color[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.color[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.color.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.color.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

};
