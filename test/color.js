require("./common/bootstrap");

var EVS = require("../lib/evshield");
var proto = [];

var instance = [{
  name: "value"
}, {
  name: "rgb"
}];


exports["Color - EVS_EV3"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
      callback([0, 0]);
    });

    this.color = new Color({
      controller: "EVS_EV3",
      pin: "BAS1",
      freq: 10,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    Color.purge();
    this.sandbox.restore();
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
    var spy = this.sandbox.spy();
    test.expect(1);

    this.color.on("data", spy);
    this.clock.tick(10);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.color.on("change", spy);

    this.clock.tick(10);

    test.ok(spy.called);
    test.done();
  },

};

exports["Color - EVS_NXT"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
      callback([0]);
    });

    this.color = new Color({
      controller: "EVS_NXT",
      pin: "BAS1",
      freq: 10,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    Color.purge();
    this.sandbox.restore();
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
    var spy = this.sandbox.spy();
    test.expect(1);

    this.color.on("data", spy);
    this.clock.tick(10);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.color.on("change", spy);

    this.clock.tick(10);

    test.ok(spy.called);
    test.done();
  },

};

exports["Color - ISL29125"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
      callback([0]);
    });

    this.color = new Color({
      controller: "ISL29125",
      freq: 10,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    Color.purge();
    this.sandbox.restore();
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
    var spy = this.sandbox.spy();
    test.expect(1);

    this.color.on("data", spy);
    this.clock.tick(10);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.color.on("change", spy);

    this.clock.tick(10);

    test.ok(spy.called);
    test.done();
  },

};

Object.keys(Color.Controllers).forEach(function(name) {
  exports["Color - Controller, " + name] = addControllerTest(Color, Color.Controllers[name], {
    controller: name,
    pin: "BAS1"
  });
});
