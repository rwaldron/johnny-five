var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata,
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Hygrometer = five.Hygrometer;

function newBoard() {
  var io = new MockFirmata();
  var board = new Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("connect");
  io.emit("ready");
  return board;
}

// Global suite setUp
exports.setUp = function(done) {
  // Base Shape for all Temperature tests
  this.proto = [];
  this.instance = [{
    name: "relativeHumidity"
  }];

  this.board = newBoard();
  this.sandbox = sinon.sandbox.create();
  this.clock = sinon.useFakeTimers();
  this.freq = 100;

  done();
};

exports.tearDown = function(done) {
  Board.purge();
  this.sandbox.restore();
  this.clock.restore();
  done();
};

function testShape(test) {
  test.expect(this.proto.length + this.instance.length);

  this.proto.forEach(function testProtoMethods(method) {
    test.equal(typeof this.hygrometer[method.name], "function", method.name);
  }, this);

  this.instance.forEach(function testInstanceProperties(property) {
    test.notEqual(typeof this.hygrometer[property.name], "undefined", property.name);
  }, this);

  test.done();
}

exports["Hygrometer -- HTU21D"] = {

  setUp: function(done) {
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");

    this.hygrometer = new Hygrometer({
      controller: "HTU21D",
      board: this.board,
      freq: 10
    });

    this.instance = [{
      name: "relativeHumidity"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.i2cConfig.restore();
    this.i2cRead.restore();
    done();
  },

  testShape: testShape,

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Hygrometer({
      controller: "HTU21D",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  data: function(test) {
    test.expect(4);

    test.equal(this.i2cRead.callCount, 2);
    test.deepEqual(this.i2cRead.lastCall.args.slice(0, 3), [
      0x40, // address
      0xE5, // register
      3,    // data length
    ]);


    var spy = this.sandbox.spy();
    var read = this.i2cRead.lastCall.args[3];

    this.hygrometer.on("data", spy);

    read([0x6F, 0xFF, 0x00]); // humidity

    this.clock.tick(10);

    test.ok(spy.calledOnce);
    test.equal(Math.round(spy.args[0][0].relativeHumidity), 49);

    test.done();
  },

  change: function(test) {
    test.expect(4);

    test.equal(this.i2cRead.callCount, 2);
    test.deepEqual(this.i2cRead.lastCall.args.slice(0, 3), [
      0x40, // address
      0xE5, // register
      3,    // data length
    ]);


    var spy = this.sandbox.spy();
    var read = this.i2cRead.lastCall.args[3];

    this.hygrometer.on("change", spy);

    read([0x6F, 0xFF, 0x6F, 0xFF]); // humidity
    this.clock.tick(10);

    read = this.i2cRead.lastCall.args[3];
    read([0x6F, 0xFF, 0x00]); // temperature
    read = this.i2cRead.lastCall.args[3];
    read([0x6F, 0xFF, 0x00]); // humidity -- same
    this.clock.tick(10);

    read = this.i2cRead.lastCall.args[3];
    read([0x6F, 0xFF, 0x00]); // temperature
    read = this.i2cRead.lastCall.args[3];
    read([0x40, 0x00, 0x00]); // humidity -- different --

    this.clock.tick(10);

    test.equal(spy.callCount, 2);
    test.equal(Math.round(spy.lastCall.args[0].relativeHumidity), 25);

    test.done();
  }

};



exports["Hygrometer -- SI7020"] = {

  setUp: function(done) {
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");

    this.hygrometer = new Hygrometer({
      controller: "SI7020",
      board: this.board,
      freq: 10
    });

    this.instance = [{
      name: "relativeHumidity"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.i2cConfig.restore();
    this.i2cRead.restore();
    done();
  },

  testShape: testShape,

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Hygrometer({
      controller: "SI7020",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  data: function(test) {
    test.expect(4);

    test.equal(this.i2cRead.callCount, 2);
    test.deepEqual(this.i2cRead.lastCall.args.slice(0, 3), [
      0x40, // address
      0xE5, // register
      3,    // data length
    ]);


    var spy = this.sandbox.spy();
    var read = this.i2cRead.lastCall.args[3];

    this.hygrometer.on("data", spy);

    read([0x6F, 0xFF, 0x00]); // humidity

    this.clock.tick(10);

    test.ok(spy.calledOnce);
    test.equal(Math.round(spy.args[0][0].relativeHumidity), 49);

    test.done();
  },

  change: function(test) {
    test.expect(4);

    test.equal(this.i2cRead.callCount, 2);
    test.deepEqual(this.i2cRead.lastCall.args.slice(0, 3), [
      0x40, // address
      0xE5, // register
      3,    // data length
    ]);


    var spy = this.sandbox.spy();
    var read = this.i2cRead.lastCall.args[3];

    this.hygrometer.on("change", spy);

    read([0x6F, 0xFF, 0x6F, 0xFF]); // humidity
    this.clock.tick(10);

    read = this.i2cRead.lastCall.args[3];
    read([0x6F, 0xFF, 0x00]); // temperature
    read = this.i2cRead.lastCall.args[3];
    read([0x6F, 0xFF, 0x00]); // humidity -- same
    this.clock.tick(10);

    read = this.i2cRead.lastCall.args[3];
    read([0x6F, 0xFF, 0x00]); // temperature
    read = this.i2cRead.lastCall.args[3];
    read([0x40, 0x00, 0x00]); // humidity -- different --

    this.clock.tick(10);

    test.equal(spy.callCount, 2);
    test.equal(Math.round(spy.lastCall.args[0].relativeHumidity), 25);

    test.done();
  }
};
