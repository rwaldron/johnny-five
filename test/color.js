require("./common/bootstrap");

const EVS = require("../lib/evshield");
const proto = [];

const instance = [{
  name: "value"
}, {
  name: "rgb"
}];


exports["Color - EVS_EV3"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", (address, register, numBytes, callback) => {
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

  tearDown(done) {
    Board.purge();
    Color.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function({name}) {
      test.equal(typeof this.color[name], "function");
    }, this);

    instance.forEach(function({name}) {
      test.notEqual(typeof this.color[name], "undefined");
    }, this);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.color.on("data", spy);
    this.clock.tick(10);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.color.on("change", spy);

    this.clock.tick(10);

    test.ok(spy.called);
    test.done();
  },

};

exports["Color - EVS_NXT"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", (address, register, numBytes, callback) => {
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

  tearDown(done) {
    Board.purge();
    Color.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function({name}) {
      test.equal(typeof this.color[name], "function");
    }, this);

    instance.forEach(function({name}) {
      test.notEqual(typeof this.color[name], "undefined");
    }, this);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.color.on("data", spy);
    this.clock.tick(10);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.color.on("change", spy);

    this.clock.tick(10);

    test.ok(spy.called);
    test.done();
  },

};

exports["Color - ISL29125"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", (address, register, numBytes, callback) => {
      callback([0]);
    });

    this.color = new Color({
      controller: "ISL29125",
      freq: 10,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Color.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function({name}) {
      test.equal(typeof this.color[name], "function");
    }, this);

    instance.forEach(function({name}) {
      test.notEqual(typeof this.color[name], "undefined");
    }, this);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.color.on("data", spy);
    this.clock.tick(10);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.color.on("change", spy);

    this.clock.tick(10);

    test.ok(spy.called);
    test.done();
  },

};

Object.keys(Color.Controllers).forEach(name => {
  exports[`Color - Controller, ${name}`] = addControllerTest(Color, Color.Controllers[name], {
    controller: name,
    pin: "BAS1"
  });
});
