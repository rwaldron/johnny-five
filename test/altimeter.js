require("./common/bootstrap");

exports.setUp = function(done) {
  // Base Shape for all Temperature tests
  this.proto = [];
  this.instance = [{
    name: "m"
  }, {
    name: "ft"
  }, {
    name: "meters"
  }, {
    name: "feet"
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
  this.sandbox.restore();
  done();
};

function testShape(test) {
  test.expect(this.proto.length + this.instance.length);

  this.proto.forEach(function testProtoMethods(method) {
    test.equal(typeof this.altimeter[method.name], "function", method.name);
  }, this);

  this.instance.forEach(function testInstanceProperties(property) {
    test.notEqual(typeof this.altimeter[property.name], "undefined", property.name);
  }, this);

  test.done();
}

exports["Altimeter"] = {
  setUp: function(done) {
    done();
  },

  tearDown: function(done) {
    done();
  },

  instanceof: function(test) {
    test.expect(1);
    test.equal(Altimeter({board: this.board, controller: "MPL3115A2"}) instanceof Altimeter, true);
    test.done();
  },

  noController: function(test) {
    test.expect(1);
    test.throws(function() {
      new Altimeter({
        elevation: 10,
        controller: null,
        board: this.board,
        freq: 10
      });
    }.bind(this));
    test.done();
  },

  returnFromNull: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.altimeter = new Altimeter({
      controller: {
        initialize: {
          value: function(opts, dataHandler) {
            setInterval(function() {
              dataHandler(null);
            }, 5);
          }
        }
      },
      board: this.board,
      freq: 10,
    });
    this.altimeter.on("data", spy);
    this.clock.tick(10);

    test.equal(spy.callCount, 0);

    test.done();
  },

};

exports["Altimeter -- User toMeters"] = {

  setUp: function(done) {
    this.altimeter = new Altimeter({
      controller: {
        initialize: {
          value: function(opts, dataHandler) {
            setInterval(function() {
              dataHandler(10);
            }, 5);
          }
        }
      },
      board: this.board,
      freq: 10,
    });

    done();
  },

  tearDown: function(done) {
    Altimeter.purge();
    done();
  },

  data: function(test) {
    test.expect(4);

    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10);
    test.equal(this.altimeter.feet, 32.81);

    test.done();
  },
};


exports["Altimeter -- MPL3115A2"] = {

  setUp: function(done) {
    this.warn = this.sandbox.stub(this.board, "warn");

    this.altimeter = new Altimeter({
      elevation: 10,
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

  testShape: testShape,

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Altimeter({
      elevation: 10,
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

  missingRequirements: function(test) {
    test.expect(3);

    new Altimeter({
      controller: "MPL3115A2",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    test.equal(this.warn.callCount, 1);
    test.equal(this.warn.getCall(0).args[0], "Altimeter");

    test.equal(this.warn.getCall(0).args[1], "Missing `elevation` option. Without a specified base `elevation`, the altitude measurement will be inaccurate. Use the meters value shown on whatismyelevation.com");

    test.done();
  },

  data: function(test) {
    test.expect(8);

    test.equal(this.i2cWrite.callCount, 2);
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
      0x26, // control register
      0x3B, // config value
    ]);

    test.deepEqual(this.i2cWrite.lastCall.args.slice(0, 3), [
      0x60, // address
      0x26, // control register
      0x39, // config value
    ]);

    test.done();
  },

  dataAndChange: function(test) {
    test.expect(4);

    var driver = IMU.Drivers.get(this.board, "MPL3115A2");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    driver.emit("data", {
      altitude: 10
    });
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10);
    test.equal(this.altimeter.feet, 32.81);
    test.done();
  },

  resolution: function(test) {
    test.expect(4);

    var driver = IMU.Drivers.get(this.board, "MPL3115A2");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    driver.emit("data", {
      altitude: 10.123456789
    });
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10.1);
    test.equal(this.altimeter.feet, 33.14);
    test.done();
  },
};


exports["Altimeter -- MS5611"] = {

  setUp: function(done) {
    this.altimeter = new Altimeter({
      controller: "MS5611",
      board: this.board,
      freq: 10
    });

    done();
  },

  tearDown: function(done) {
    Altimeter.purge();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Altimeter({
      controller: "MS5611",
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

  dataAndChange: function(test) {
    test.expect(4);

    var driver = IMU.Drivers.get(this.board, "MS5611");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    driver.emit("data", {
      altitude: 10
    });
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10);
    test.equal(this.altimeter.feet, 32.81);
    test.done();
  },

  resolution: function(test) {
    test.expect(4);

    var driver = IMU.Drivers.get(this.board, "MS5611");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    driver.emit("data", {
      altitude: 10.123456789
    });
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10.12);
    test.equal(this.altimeter.feet, 33.2);
    test.done();
  },
};

exports["Altimeter -- BMP180"] = {

  setUp: function(done) {
    this.altimeter = new Altimeter({
      controller: "BMP180",
      board: this.board,
      freq: 10
    });

    done();
  },

  tearDown: function(done) {
    Altimeter.purge();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Altimeter({
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

  dataAndChange: function(test) {
    test.expect(4);

    var driver = IMU.Drivers.get(this.board, "BMP180");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    driver.emit("data", {
      altitude: 10
    });
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10);
    test.equal(this.altimeter.feet, 32.81);
    test.done();
  },

  resolution: function(test) {
    test.expect(4);

    var driver = IMU.Drivers.get(this.board, "BMP180");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    driver.emit("data", {
      altitude: 10.123456789
    });
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10.12);
    test.equal(this.altimeter.feet, 33.2);
    test.done();
  },
};

exports["Altimeter -- BMP280"] = {

  setUp: function(done) {
    this.altimeter = new Altimeter({
      controller: "BMP280",
      board: this.board,
      freq: 10
    });

    done();
  },

  tearDown: function(done) {
    Altimeter.purge();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Altimeter({
      controller: "BMP280",
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

  dataAndChange: function(test) {
    test.expect(4);

    var driver = IMU.Drivers.get(this.board, "BMP280");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    driver.emit("data", {
      altitude: 10
    });
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10);
    test.equal(this.altimeter.feet, 32.81);
    test.done();
  },

  resolution: function(test) {
    test.expect(4);

    var driver = IMU.Drivers.get(this.board, "BMP280");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    driver.emit("data", {
      altitude: 10.123456789
    });
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10.12);
    test.equal(this.altimeter.feet, 33.2);
    test.done();
  },
};

exports["Altimeter -- BME280"] = {

  setUp: function(done) {
    this.altimeter = new Altimeter({
      controller: "BME280",
      board: this.board,
      freq: 10
    });

    done();
  },

  tearDown: function(done) {
    Altimeter.purge();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Altimeter({
      controller: "BME280",
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

  dataAndChange: function(test) {
    test.expect(4);

    var driver = IMU.Drivers.get(this.board, "BME280");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    driver.emit("data", {
      altitude: 10
    });
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10);
    test.equal(this.altimeter.feet, 32.81);
    test.done();
  },

  resolution: function(test) {
    test.expect(4);

    var driver = IMU.Drivers.get(this.board, "BME280");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();

    this.altimeter.on("data", dataSpy);
    this.altimeter.on("change", changeSpy);

    driver.emit("data", {
      altitude: 10.123456789
    });
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.altimeter.meters, 10.12);
    test.equal(this.altimeter.feet, 33.2);
    test.done();
  },
};
