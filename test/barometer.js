var MockFirmata = require("./util/mock-firmata"),
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
