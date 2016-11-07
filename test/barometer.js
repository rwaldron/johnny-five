require("./common/bootstrap");

exports["Barometer -- MPL115A2"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = sinon.useFakeTimers();
    this.board = newBoard();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    IMU.Drivers.clear();
    this.sandbox.restore();
    done();
  },

  data: function(test) {
    test.expect(8);

    var spies = {
      data: sinon.spy(),
      change: sinon.spy(),
    };

    // In order to handle the Promise used for initialization,
    // there can be no fake timers in this test, which means we
    // can't use the clock.tick to move the interval forward
    // in time.
    this.clock.restore();

    this.barometer = new Barometer({
      controller: "MPL115A2",
      board: this.board,
      freq: 10
    });

    this.barometer.on("data", spies.data);
    this.barometer.on("change", spies.change);

    // Simulate receipt of coefficients
    var pCoefficients = this.i2cReadOnce.firstCall.args[3];

    pCoefficients([
      67, 111,  // A0
      176, 56,  // B1
      179, 101, // B2
      56, 116   // C12
    ]);

    this.i2cWriteReg.reset();
    this.i2cReadOnce.reset();

    var interval = setInterval(function() {

      if (this.i2cWriteReg.callCount === 1) {

        test.equal(this.i2cWriteReg.firstCall.args[0], 0x60);
        test.equal(this.i2cWriteReg.firstCall.args[1], 0x12);
        test.equal(this.i2cWriteReg.firstCall.args[2], 0x00);

        test.equal(this.i2cReadOnce.callCount, 1);
        test.equal(this.i2cReadOnce.lastCall.args[0], 0x60);
        test.equal(this.i2cReadOnce.lastCall.args[1], 0x00);
        test.equal(this.i2cReadOnce.lastCall.args[2], 4);

        var handler = this.i2cReadOnce.lastCall.args[3];

        handler([ 0, 0, 0, 0 ]);
        handler([ 90, 64, 129, 64 ]);
        handler([ 90, 64, 129, 0 ]);
        handler([ 89, 192, 129, 0 ]);
        handler([ 90, 64, 128, 192 ]);
        handler([ 89, 192, 129, 0 ]);
        handler([ 90, 64, 129, 0 ]);
      }

      if (spies.data.called && spies.change.called) {
        clearInterval(interval);
        test.equal(digits.fractional(this.barometer.pressure), 4);
        test.done();
      }

    }.bind(this), 5);
  }
};


exports["Barometer -- BMP180"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

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
    this.sandbox.restore();
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

    var spy = this.sandbox.spy();
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

      test.deepEqual(this.i2cWriteReg.lastCall.args, [119, 244, 46]);

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
    1, // data length
  ]);

  var read = this.i2cReadOnce.lastCall.args[3];
  read([0x04]); // write status bit

  test.equal(this.i2cReadOnce.callCount, initialCount + 2);
  test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, 3), [
    0x60, // address
    0x01, // altitude register
    6, // data length (pressure + temp)
  ]);

  read = this.i2cReadOnce.lastCall.args[3];
  read(data);
}

exports["Barometer -- MPL3115A2"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");
    this.clock = this.sandbox.useFakeTimers();

    this.barometer = new Barometer({
      controller: "MPL3115A2",
      board: this.board,
      freq: 10
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
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

    var spy = this.sandbox.spy();
    this.barometer.on("data", spy);

    // Altitude Loop
    mpl3115aDataLoop.call(this, test, 0, [
      0x00, // status
      0x00, 0x00, 0x00, // altitude
      0x00, 0x00 // temperature
    ]);


    // Pressure Loop
    mpl3115aDataLoop.call(this, test, 2, [
      0x00, // status
      0xAA, 0xBB, 0xCC, // pressure
      0x00, 0x00 // temperature
    ]);

    this.clock.tick(10);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.args[0][0].pressure), 176);

    test.done();
  },

  change: function(test) {
    test.expect(35);

    var spy = this.sandbox.spy();
    this.barometer.on("change", spy);

    // First Pass -- initial
    mpl3115aDataLoop.call(this, test, 0, [
      0x00, // status
      0x00, 0x00, 0x00, // altitude
      0x00, 0x00 // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 2, [
      0x00, // status
      0xAA, 0xBB, 0xCC, // pressure
      0x00, 0x00 // temperature
    ]);
    this.clock.tick(10);

    // Second Pass -- same
    mpl3115aDataLoop.call(this, test, 4, [
      0x00, // status
      0x00, 0x00, 0x00, // altitude
      0x00, 0x00 // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 6, [
      0x00, // status
      0xAA, 0xBB, 0xCC, // pressure
      0x00, 0x00 // temperature
    ]);
    this.clock.tick(10);

    // Third Pass -- change
    mpl3115aDataLoop.call(this, test, 8, [
      0x00, // status
      0x00, 0x00, 0x00, // altitude
      0x00, 0x00 // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 10, [
      0x00, // status
      0x55, 0x66, 0x77, // pressure
      0x00, 0x00 // temperature
    ]);
    this.clock.tick(10);

    // Fourth Pass -- same
    mpl3115aDataLoop.call(this, test, 12, [
      0x00, // status
      0x00, 0x00, 0x00, // altitude
      0x00, 0x00 // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 14, [
      0x00, // status
      0x55, 0x66, 0x77, // pressure
      0x00, 0x00 // temperature
    ]);
    this.clock.tick(10);

    test.ok(spy.calledTwice);
    test.equals(Math.round(spy.args[0][0].pressure), 176);
    test.equals(Math.round(spy.args[1][0].pressure), 88);

    test.done();
  }
};

Object.keys(Barometer.Controllers).forEach(function(name) {
  exports["Barometer - Controller, " + name] = addControllerTest(Barometer, Barometer.Controllers[name], {
    controller: name,
  });
});
