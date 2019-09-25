require("./common/bootstrap");

exports.setUp = function(done) {
  // Base Shape for all Barometer tests
  this.proto = [];
  this.instance = [{
    name: "pressure"
  }];

  this.board = newBoard();
  this.sandbox = sinon.sandbox.create();
  this.clock = this.sandbox.useFakeTimers();
  this.freq = 100;
  this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
  this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
  this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
  this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
  this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

  done();
};

exports.tearDown = function(done) {
  Board.purge();
  Barometer.purge();
  IMU.Drivers.clear();
  this.sandbox.restore();
  done();
};

exports["Barometer -- MPL115A2"] = {

  setUp(done) {
    this.barometer = new Barometer({
      controller: "MPL115A2",
      board: this.board,
      freq: 10
    });
    done();
  },

  tearDown(done) {
    done();
  },

  data(test) {
    test.expect(8);

    const spies = {
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
    const pCoefficients = this.i2cReadOnce.firstCall.args[3];

    pCoefficients([
      67, 111,  // A0
      176, 56,  // B1
      179, 101, // B2
      56, 116   // C12
    ]);

    this.i2cWriteReg.reset();
    this.i2cReadOnce.reset();

    const interval = setInterval(() => {

      if (this.i2cWriteReg.callCount === 1) {

        test.equal(this.i2cWriteReg.firstCall.args[0], 0x60);
        test.equal(this.i2cWriteReg.firstCall.args[1], 0x12);
        test.equal(this.i2cWriteReg.firstCall.args[2], 0x00);

        test.equal(this.i2cReadOnce.callCount, 1);
        test.equal(this.i2cReadOnce.lastCall.args[0], 0x60);
        test.equal(this.i2cReadOnce.lastCall.args[1], 0x00);
        test.equal(this.i2cReadOnce.lastCall.args[2], 4);

        const handler = this.i2cReadOnce.lastCall.args[3];

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
        test.equal(digits.fractional(this.barometer.pressure), 2);
        test.done();
      }

    }, 5);
  }
};


exports["Barometer -- BMP180"] = {

  setUp(done) {
    this.barometer = new Barometer({
      controller: "BMP180",
      board: this.board,
      freq: 10
    });
    done();
  },

  tearDown(done) {
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Barometer({
      controller: "BMP180",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  dataAndChange(test) {
    // test.expect(11);

    const driver = IMU.Drivers.get(this.board, "BMP180");
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();


    // test.equal(this.barometer.isCalibrated, false);
    this.clock.tick(10);


    this.barometer.on("data", dataSpy);
    this.barometer.on("change", changeSpy);

    const computed = {
      altitude: 1,
      pressure: 2,
      temperature: 3,
    };

    driver.emit("data", computed);
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.barometer.pressure, 0.002);

    driver.emit("data", computed);
    this.clock.tick(10);


    test.done();
  },
};

exports["Barometer -- BMP280"] = {

  setUp(done) {
    this.barometer = new Barometer({
      controller: "BMP280",
      board: this.board,
      freq: 10
    });
    done();
  },

  tearDown(done) {
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Barometer({
      controller: "BMP280",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  noController(test) {
    test.expect(1);
    test.throws(() => {
      new Barometer({
        controller: null,
        board: this.board,
        freq: 10
      });
    });
    test.done();
  },

  sharedtoPressure(test) {
    test.expect(2);
    const toPressure = x => x;
    const barometer = new Barometer({
      controller: {},
      toPressure,
      board: this.board,
      freq: 10
    });

    test.equal(barometer.toPressure, toPressure);
    test.equal(barometer.toPressure(1), 1);
    test.done();
  },

  defaulttoPressure(test) {
    test.expect(2);
    let toPressure;
    const barometer = new Barometer({
      controller: {},
      toPressure,
      board: this.board,
      freq: 10
    });

    test.notEqual(barometer.toPressure, toPressure);
    test.equal(barometer.toPressure(1), 1);
    test.done();
  },

  dataAndChange(test) {
    test.expect(3);

    const driver = IMU.Drivers.get(this.board, "BMP280");
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

    this.clock.tick(10);

    this.barometer.on("data", dataSpy);
    this.barometer.on("change", changeSpy);

    const computed = {
      altitude: 1,
      pressure: 2,
      temperature: 3,
    };

    driver.emit("data", computed);
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);
    test.equal(this.barometer.pressure, 0.002);

    driver.emit("data", computed);
    this.clock.tick(10);

    test.done();
  },
};

exports["Barometer -- BME280"] = {

  setUp(done) {
    this.barometer = new Barometer({
      controller: "BME280",
      board: this.board,
      freq: 10
    });
    done();
  },

  tearDown(done) {
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Barometer({
      controller: "BME280",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  noController(test) {
    test.expect(1);
    test.throws(() => {
      new Barometer({
        controller: null,
        board: this.board,
        freq: 10
      });
    });
    test.done();
  },

  sharedtoPressure(test) {
    test.expect(2);
    const toPressure = x => x;
    const barometer = new Barometer({
      controller: {},
      toPressure,
      board: this.board,
      freq: 10
    });

    test.equal(barometer.toPressure, toPressure);
    test.equal(barometer.toPressure(1), 1);
    test.done();
  },

  defaulttoPressure(test) {
    test.expect(2);
    let toPressure;
    const barometer = new Barometer({
      controller: {},
      toPressure,
      board: this.board,
      freq: 10
    });

    test.notEqual(barometer.toPressure, toPressure);
    test.equal(barometer.toPressure(1), 1);
    test.done();
  },

  dataAndChange(test) {
    test.expect(3);

    const driver = IMU.Drivers.get(this.board, "BME280");
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

    this.clock.tick(10);

    this.barometer.on("data", dataSpy);
    this.barometer.on("change", changeSpy);

    const computed = {
      altitude: 1,
      pressure: 2,
      humidity: 3,
      temperature: 4,
    };

    driver.emit("data", computed);
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);
    test.equal(this.barometer.pressure, 0.002);

    driver.emit("data", computed);
    this.clock.tick(10);

    test.done();
  },
};

exports["Barometer -- MS5611"] = {

  setUp(done) {
    this.barometer = new Barometer({
      controller: "MS5611",
      board: this.board,
      freq: 10
    });
    done();
  },

  tearDown(done) {
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Barometer({
      controller: "MS5611",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  noController(test) {
    test.expect(1);
    test.throws(() => {
      new Barometer({
        controller: null,
        board: this.board,
        freq: 10
      });
    });
    test.done();
  },

  sharedtoPressure(test) {
    test.expect(2);
    const toPressure = x => x;
    const barometer = new Barometer({
      controller: {},
      toPressure,
      board: this.board,
      freq: 10
    });

    test.equal(barometer.toPressure, toPressure);
    test.equal(barometer.toPressure(1), 1);
    test.done();
  },

  defaulttoPressure(test) {
    test.expect(2);
    let toPressure;
    const barometer = new Barometer({
      controller: {},
      toPressure,
      board: this.board,
      freq: 10
    });

    test.notEqual(barometer.toPressure, toPressure);
    test.equal(barometer.toPressure(1), 1);
    test.done();
  },

  dataAndChange(test) {
    test.expect(3);

    const driver = IMU.Drivers.get(this.board, "MS5611");
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

    this.clock.tick(10);

    this.barometer.on("data", dataSpy);
    this.barometer.on("change", changeSpy);

    const computed = {
      altitude: 1,
      pressure: 2,
      temperature: 3,
    };

    driver.emit("data", computed);
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);
    test.equal(this.barometer.pressure, 0.002);

    driver.emit("data", computed);
    this.clock.tick(10);

    test.done();
  },
};

function mpl3115aDataLoop(test, initialCount, data) {
  test.equal(this.i2cReadOnce.callCount, initialCount + 1);
  test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, 3), [
    0x60, // address
    0x00, // status register
    1, // data length
  ]);

  let read = this.i2cReadOnce.lastCall.args[3];
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

  setUp(done) {
    this.barometer = new Barometer({
      controller: "MPL3115A2",
      board: this.board,
      freq: 10
    });

    done();
  },

  tearDown(done) {
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Barometer({
      controller: "MPL3115A2",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  data(test) {
    test.expect(18);

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

    const spy = this.sandbox.spy();
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
    test.equals(175.5040, spy.args[0][0].pressure);
    test.equals(3, digits.fractional(this.barometer.pressure));

    test.done();
  },

  change(test) {
    test.expect(35);

    const spy = this.sandbox.spy();
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

// Object.keys(Barometer.Controllers).forEach(function(name) {
//   exports["Barometer - Controller, " + name] = addControllerTest(Barometer, Barometer.Controllers[name], {
//     controller: name,
//   });
// });
