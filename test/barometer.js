var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata,
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Barometer = five.Barometer;

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

exports["Barometer -- MPL115A2"] = {

  setUp: function(done) {
    this.board = newBoard();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");
    this.i2cReadOnce = sinon.spy(MockFirmata.prototype, "i2cReadOnce");

    this.barometer = new Barometer({
      controller: "MPL115A2",
      board: this.board,
      freq: 10
    });

    this.instance = [{
      name: "pressure"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();
    this.i2cReadOnce.restore();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Barometer({
      controller: "MPL115A2",
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
    test.expect(8);

    // var spy = sinon.spy();
    // this.barometer.on("data", spy);

    var readOnce = this.i2cReadOnce.args[0][3];
    readOnce([
      67, 111,  // A0
      176, 56,  // B1
      179, 101, // B2
      56, 116   // C12
    ]);

    setImmediate(function() {
      test.ok(this.i2cConfig.calledOnce);
      test.ok(this.i2cWrite.calledOnce);

      test.equals(this.i2cWrite.args[0][0], 0x60);
      test.deepEqual(this.i2cWrite.args[0][1], [0x12, 0x00]);

      test.ok(this.i2cRead.calledOnce);
      test.equals(this.i2cRead.args[0][0], 0x60);
      test.deepEqual(this.i2cRead.args[0][1], 0x00);
      test.equals(this.i2cRead.args[0][2], 4);

      // In order to handle the Promise used for initialization,
      // there can be no fake timers in this test, which means we
      // can't use the clock.tick to move the interval forward
      // in time.
      //
      //
      // read = this.i2cRead.args[0][3];

      // read([
      //   0, 0, // barometer
      //   129, 64, // temperature
      // ]);

      // this.clock.tick(100);
      // test.ok(spy.called);
      // test.equals(Math.round(spy.args[0][0].barometer), 70);

      test.done();
    }.bind(this));
  }
};

exports["Barometer -- BMP180"] = {

  setUp: function(done) {
    this.board = newBoard();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWriteReg = sinon.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cReadOnce = sinon.spy(MockFirmata.prototype, "i2cReadOnce");

    this.barometer = new Barometer({
      controller: "BMP180",
      board: this.board,
      freq: 10
    });

    this.instance = [{
      name: "pressure"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.i2cConfig.restore();
    this.i2cWriteReg.restore();
    this.i2cReadOnce.restore();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Barometer({
      controller: "BMP180",
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
    test.expect(5);

    var spy = sinon.spy();
    this.barometer.on("data", spy);


    test.ok(this.i2cReadOnce.calledOnce);

    var i2cReadOnce = this.i2cReadOnce.lastCall.args[3];

    i2cReadOnce([
      32,
      153,
      251,
      197,
      199,
      83,
      131,
      0,
      99,
      140,
      70,
      120,
      25,
      115,
      0,
      39,
      128,
      0,
      209,
      246,
      9,
      221
    ]);


    setImmediate(function() {

      test.ok(this.i2cConfig.calledOnce);
      test.ok(this.i2cWriteReg.calledOnce);
      test.ok(this.i2cReadOnce.called);

      test.deepEqual(this.i2cWriteReg.lastCall.args, [ 119, 244, 46 ]);

      // In order to handle the Promise used for initialization,
      // there can be no fake timers in this test, which means we
      // can't use the clock.tick to move the interval forward
      // in time.
      //
      // This completely restricts the ability to stub and spy.
      //
      // TODO: expose readCycle w/ IS_TEST_MODE flag and call directly.

      test.done();
    }.bind(this));
  }
};

function mpl3115aDataLoop(test, initialCount, data) {
  test.equal(this.i2cReadOnce.callCount, initialCount + 1);
  test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, 3), [
    0x60, // address
    0x00, // status register
    1,    // data length
  ]);

  var read = this.i2cReadOnce.lastCall.args[3];
  read([0x04]); // write status bit

  test.equal(this.i2cReadOnce.callCount, initialCount + 2);
  test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, 3), [
    0x60, // address
    0x01, // altitude register
    6,    // data length (pressure + temp)
  ]);

  read = this.i2cReadOnce.lastCall.args[3];
  read(data);
}

exports["Barometer -- MPL3115A2"] = {

  setUp: function(done) {
    this.board = newBoard();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cWriteReg = sinon.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cReadOnce = sinon.spy(MockFirmata.prototype, "i2cReadOnce");
    this.clock = sinon.useFakeTimers();

    this.barometer = new Barometer({
      controller: "MPL3115A2",
      board: this.board,
      freq: 10
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.clock.restore();
    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cWriteReg.restore();
    this.i2cReadOnce.restore();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Barometer({
      controller: "MPL3115A2",
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
    test.expect(17);

    test.equal(this.i2cWrite.callCount, 1);
    test.equal(this.i2cWriteReg.callCount, 4);

    test.deepEqual(this.i2cWriteReg.getCall(0).args.slice(0, 3), [
      0x60, // address
      0x2D, // config register
      0x00, // config value
    ]);

    test.deepEqual(this.i2cWriteReg.getCall(1).args.slice(0, 3), [
      0x60, // address
      0x14, // config register
      0x00, // config value
    ]);

    test.deepEqual(this.i2cWriteReg.getCall(2).args.slice(0, 3), [
      0x60, // address
      0x15, // config register
      0x00, // config value
    ]);

    test.deepEqual(this.i2cWriteReg.getCall(3).args.slice(0, 3), [
      0x60, // address
      0x13, // config register
      0x07, // config value
    ]);


    test.deepEqual(this.i2cWrite.firstCall.args.slice(0, 3), [
      0x60, // address
      0x26, // config register
      0xB9, // config value
    ]);

    // test.deepEqual(this.i2cWrite.lastCall.args.slice(0, 3), [
    //   0x60, // address
    //   0x26, // control register
    //   0xB9, // config value
    // ]);

    var spy = sinon.spy();
    this.barometer.on("data", spy);

    // Altitude Loop
    mpl3115aDataLoop.call(this, test, 0, [
      0x00,             // status
      0x00, 0x00, 0x00, // altitude
      0x00, 0x00        // temperature
    ]);


    // Pressure Loop
    mpl3115aDataLoop.call(this, test, 2, [
      0x00,             // status
      0xAA, 0xBB, 0xCC, // pressure
      0x00, 0x00        // temperature
    ]);

    this.clock.tick(10);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.args[0][0].pressure), 176);

    test.done();
  },

  change: function(test) {
    test.expect(35);

    var spy = sinon.spy();
    this.barometer.on("change", spy);

    // First Pass -- initial
    mpl3115aDataLoop.call(this, test, 0, [
      0x00,             // status
      0x00, 0x00, 0x00, // altitude
      0x00, 0x00        // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 2, [
      0x00,             // status
      0xAA, 0xBB, 0xCC, // pressure
      0x00, 0x00        // temperature
    ]);
    this.clock.tick(10);

    // Second Pass -- same
    mpl3115aDataLoop.call(this, test, 4, [
      0x00,             // status
      0x00, 0x00, 0x00, // altitude
      0x00, 0x00        // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 6, [
      0x00,             // status
      0xAA, 0xBB, 0xCC, // pressure
      0x00, 0x00        // temperature
    ]);
    this.clock.tick(10);

    // Third Pass -- change
    mpl3115aDataLoop.call(this, test, 8, [
      0x00,             // status
      0x00, 0x00, 0x00, // altitude
      0x00, 0x00        // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 10, [
      0x00,             // status
      0x55, 0x66, 0x77, // pressure
      0x00, 0x00        // temperature
    ]);
    this.clock.tick(10);

    // Fourth Pass -- same
    mpl3115aDataLoop.call(this, test, 12, [
      0x00,             // status
      0x00, 0x00, 0x00, // altitude
      0x00, 0x00        // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 14, [
      0x00,             // status
      0x55, 0x66, 0x77, // pressure
      0x00, 0x00        // temperature
    ]);
    this.clock.tick(10);

    test.ok(spy.calledTwice);
    test.equals(Math.round(spy.args[0][0].pressure), 176);
    test.equals(Math.round(spy.args[1][0].pressure), 88);

    test.done();
  }
};
