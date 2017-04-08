require("./common/bootstrap");

exports["IMU -- MPU6050"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.imu = new IMU({
      controller: "MPU6050",
      freq: 100,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "accelerometer"
    }, {
      name: "thermometer"
    }, {
      name: "gyro"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    IMU.Drivers.clear();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.imu[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imu[property.name], "undefined");
    }, this);

    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new IMU({
      controller: "MPU6050",
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

  components: function(test) {
    test.expect(1);

    test.deepEqual(this.imu.components, ["accelerometer", "gyro", "thermometer"]);

    test.done();
  },

  data: function(test) {
    var read, spy = this.sandbox.spy();

    test.expect(16);

    this.imu.components.forEach(function(component) {
      this[component].emit("change");
    }, this.imu);

    this.imu.on("data", spy);

    read = this.i2cRead.args[0][3];
    read([
      0x11, 0x11, 0x22, 0x22, 0x33, 0x33, // accelerometer
      0x11, 0x22, // temperature
      0x11, 0x11, 0x33, 0x33, 0x55, 0x55, // gyro
    ]);


    test.ok(this.i2cConfig.calledOnce);

    test.ok(this.i2cWrite.calledOnce);
    test.equals(this.i2cWrite.args[0][0], 0x68);
    test.deepEqual(this.i2cWrite.args[0][1], [0x6B, 0x00]);

    test.ok(this.i2cRead.calledOnce);
    test.equals(this.i2cRead.args[0][0], 0x68);
    test.deepEqual(this.i2cRead.args[0][1], 0x3B);
    test.equals(this.i2cRead.args[0][2], 14);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.equals(spy.args[0][0].accelerometer.x, 0.27);
    test.equals(spy.args[0][0].accelerometer.y, 0.53);
    test.equals(spy.args[0][0].accelerometer.z, 0.8);
    test.equals(Math.round(spy.args[0][0].thermometer.celsius), 49);
    test.equals(spy.args[0][0].gyro.x, 127);
    test.equals(spy.args[0][0].gyro.y, 128);
    test.equals(spy.args[0][0].gyro.z, 129);

    test.done();
  },

  change: function(test) {
    var read, changeSpy = this.sandbox.spy();

    test.expect(2);
    this.imu.on("change", changeSpy);
    this.imu.gyro.isCalibrated = true;

    read = this.i2cRead.args[0][3];
    read([
      0x11, 0x11, 0x22, 0x22, 0x33, 0x33, // accelerometer
      0x11, 0x22, // temperature
      0x11, 0x11, 0x33, 0x33, 0x55, 0x55, // gyro
    ]);

    this.clock.tick(100);

    test.ok(changeSpy.callCount, 3);

    read([
      0x11, 0x11, 0x22, 0x22, 0x33, 0x33,
      0x22, 0x33, // only change temperature
      0x11, 0x11, 0x33, 0x33, 0x55, 0x55,
    ]);

    this.clock.tick(100);

    test.ok(changeSpy.callCount, 4);

    test.done();
  }
};

exports["Multi -- MPL115A2"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");
    this.imu = new IMU({
      controller: "MPL115A2",
      freq: 100,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "barometer"
    }, {
      name: "thermometer"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    IMU.Drivers.clear();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.imu[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imu[property.name], "undefined");
    }, this);

    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new IMU({
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

  components: function(test) {
    test.expect(1);

    test.deepEqual(this.imu.components, ["barometer", "thermometer"]);

    test.done();
  },
};

exports["Multi -- SHT31D"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");
    this.imu = new IMU({
      controller: "SHT31D",
      freq: 100,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "hygrometer"
    }, {
      name: "thermometer"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    IMU.Drivers.clear();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.imu[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imu[property.name], "undefined");
    }, this);

    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new IMU({
      controller: "SHT31D",
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

  components: function(test) {
    test.expect(1);

    test.deepEqual(this.imu.components, ["hygrometer", "thermometer"]);

    test.done();
  },

  data: function(test) {
    test.expect(6);

    var spy = this.sandbox.spy();

    this.imu.on("data", spy);

    test.ok(this.i2cConfig.calledOnce);
    test.ok(this.i2cWrite.calledTwice);
    test.deepEqual(this.i2cWrite.firstCall.args, [ 68, [ 48, 162 ] ]);
    test.deepEqual(this.i2cWrite.lastCall.args, [ 68, [ 36, 0 ] ]);

    this.clock.tick(100);

    test.equal(this.i2cReadOnce.callCount, 1);

    var i2cReadOnce = this.i2cReadOnce.lastCall.args[2];

    i2cReadOnce([ 100, 200, 169, 93, 90, 131 ]);

    this.clock.tick(100);

    i2cReadOnce([ 100, 200, 169, 93, 90, 131 ]);

    this.clock.tick(100);

    i2cReadOnce([ 100, 200, 169, 93, 90, 131 ]);

    this.clock.tick(100);

    test.equal(spy.callCount, 3);
    test.done();
  },

};

exports["Multi -- HTU21D"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.imu = new IMU({
      controller: "HTU21D",
      freq: 100,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "hygrometer"
    }, {
      name: "thermometer"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    IMU.Drivers.clear();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.imu[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imu[property.name], "undefined");
    }, this);

    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new IMU({
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

  components: function(test) {
    test.expect(1);

    test.deepEqual(this.imu.components, ["hygrometer", "thermometer"]);

    test.done();
  },
};

exports["Multi -- MPL3115A2"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.imu = new IMU({
      controller: "MPL3115A2",
      freq: 100,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "barometer"
    }, {
      name: "altimeter"
    }, {
      name: "thermometer"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    IMU.Drivers.clear();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.imu[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imu[property.name], "undefined");
    }, this);

    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(4);

    this.i2cConfig.reset();

    new IMU({
      controller: "MPL3115A2",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");
    test.deepEqual(forwarded.settings, {stopTX: true});

    test.done();
  },

  components: function(test) {
    test.expect(1);

    test.deepEqual(this.imu.components, ["altimeter", "barometer", "thermometer"]);

    test.done();
  },
};

exports["IMU -- BNO055"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead");
    this.i2cReadOnce = this.sandbox.stub(MockFirmata.prototype, "i2cReadOnce", function(address, register, bytes, callback) {

      // CALIBRATION
      if (register === 0x35) {
        callback([255]);
      }
    });
    this.imu = new IMU({
      controller: "BNO055",
      freq: 500,
      board: this.board
    });

    this.driver = IMU.Drivers.get(this.board, "BNO055", {});

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "accelerometer"
    }, {
      name: "thermometer"
    }, {
      name: "gyro"
    }, {
      name: "magnetometer"
    }, {
      name: "orientation"
    }, {
      name: "calibration"
    }, {
      name: "isCalibrated"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    IMU.Drivers.clear();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.imu[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imu[property.name], "undefined");
    }, this);

    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new IMU({
      controller: "BNO055",
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

  components: function(test) {
    test.expect(1);

    test.deepEqual(this.imu.components, ["accelerometer", "gyro", "magnetometer", "orientation", "thermometer"]);

    test.done();
  },

  data: function(test) {
    test.expect(38);

    var dspy = this.sandbox.spy();
    var ispy = this.sandbox.spy();

    //add this for catching calibration events
    var cspy = this.sandbox.spy();

    this.imu.components.forEach(function(component) {
      this[component].emit("change");
    }, this.imu);

    this.driver.on("data", dspy);
    this.imu.on("data", ispy);

    //catch the calibration events coming out of the driver the imu class
    this.driver.on("calibration", cspy);
    this.imu.on("calibration", cspy);
    this.imu.on("calibrated", cspy);
    this.driver.on("calibrated", cspy);

    test.equal(this.i2cWriteReg.callCount, 3);
    test.deepEqual(this.i2cWriteReg.getCall(0).args, [0x28, 0X3D, 0x00]);
    test.deepEqual(this.i2cWriteReg.getCall(1).args, [0x28, 0x07, 0x00]);
    test.deepEqual(this.i2cWriteReg.getCall(2).args, [0x28, 0x3F, 0x20]);

    this.clock.tick(650);

    test.equal(this.i2cWriteReg.callCount, 7);
    test.deepEqual(this.i2cWriteReg.getCall(3).args, [0x28, 0x3E, 0x00]);
    test.deepEqual(this.i2cWriteReg.getCall(4).args, [0x28, 0x3F, 0x00]);
    test.deepEqual(this.i2cWriteReg.getCall(5).args, [0x28, 0x41, 0x24]);
    test.deepEqual(this.i2cWriteReg.getCall(6).args, [0x28, 0x42, 0x00]);

    this.clock.tick(10);

    test.equal(this.i2cWriteReg.callCount, 8);
    test.deepEqual(this.i2cWriteReg.getCall(7).args, [0x28, 0x3D, 0x0C]);

    this.clock.restore();

    var interval = setInterval(function() {
      if (this.i2cReadOnce.callCount === 1) {
        clearInterval(interval);

        this.clock = this.sandbox.useFakeTimers();


        test.equal(this.i2cReadOnce.callCount, 1);
        test.equal(this.i2cRead.callCount, 3);

        //we should get a calibration event, and a calibrated event on
        //both the driver and the imu
        test.equal(cspy.callCount, 4);


        // TEMP
        test.deepEqual(this.i2cRead.getCall(0).args.slice(0, -1), [0x28, 0x34, 2]);
        // ACCEL
        test.deepEqual(this.i2cRead.getCall(1).args.slice(0, -1), [0x28, 0x08, 18]);
        // EULER
        test.deepEqual(this.i2cRead.getCall(2).args.slice(0, -1), [0x28, 0x1A, 14]);


        var readTemp = this.i2cRead.getCall(0).args[3];
        var readAccel = this.i2cRead.getCall(1).args[3];
        var readEuler = this.i2cRead.getCall(2).args[3];

        // Taken from an actual reading
        readTemp([28, 51]);
        readAccel([255, 255, 242, 255, 221, 3, 204, 255, 95, 254, 56, 255, 1, 0, 1, 0, 2, 0]);
        readEuler([42, 8, 253, 255, 10, 0, 180, 26, 244, 255, 94, 0, 215, 197]);

        // Once for each of the calls to readTemp, readAccel, readEuler
        // a data event is now emitted from the calibration
        // so we will have a call count of 4, not 3.
        test.equal(dspy.callCount, 3);

        // Once for the alloted "freq"
        test.equal(ispy.callCount, 1);

        var darg = dspy.lastCall.args[0];

        test.deepEqual(darg, {
          accelerometer: {
            x: -1,
            y: -14,
            z: 989
          },
          gyro: {
            x: 1,
            y: 1,
            z: 2
          },
          magnetometer: {
            x: -52,
            y: -417,
            z: -200
          },
          orientation: {
            euler: {
              heading: 2090,
              roll: -3,
              pitch: 10
            },
            quarternion: {
              w: 6836,
              x: -12,
              y: 94,
              z: -14889
            }
          },
          temperature: 28,
          calibration: 51
        });


        var iarg = ispy.lastCall.args[0];

        test.equal(this.imu.accelerometer.x, iarg.accelerometer.x);
        test.equal(this.imu.accelerometer.y, iarg.accelerometer.y);
        test.equal(this.imu.accelerometer.z, iarg.accelerometer.z);
        test.equal(this.imu.gyro.x, iarg.gyro.x);
        test.equal(this.imu.gyro.y, iarg.gyro.y);
        test.equal(this.imu.gyro.z, iarg.gyro.z);
        test.equal(this.imu.magnetometer.x, iarg.magnetometer.x);
        test.equal(this.imu.magnetometer.y, iarg.magnetometer.y);
        test.equal(this.imu.magnetometer.z, iarg.magnetometer.z);
        test.equal(this.imu.orientation.euler.heading, iarg.orientation.euler.heading);
        test.equal(this.imu.orientation.euler.pitch, iarg.orientation.euler.pitch);
        test.equal(this.imu.orientation.euler.roll, iarg.orientation.euler.roll);
        test.equal(this.imu.orientation.quarternion.w, iarg.orientation.quarternion.w);
        test.equal(this.imu.orientation.quarternion.x, iarg.orientation.quarternion.x);
        test.equal(this.imu.orientation.quarternion.y, iarg.orientation.quarternion.y);
        test.equal(this.imu.orientation.quarternion.z, iarg.orientation.quarternion.z);
        test.equal(this.imu.thermometer, iarg.thermometer);
        test.equal(this.imu.calibration, iarg.calibration);

        test.done();
      }
    }.bind(this), 10);
  },
};



exports["Multi -- TH02"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.status = this.sandbox.spy();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cReadOnce = this.sandbox.stub(MockFirmata.prototype, "i2cReadOnce", function(address, register, length, handler) {
      process.nextTick(function() {
        if (register === 0x00) {
          this.status();
          handler([0x00]);
        } else {
          if (this.i2cWrite.lastCall.args[2] === 0x01) {
            // MEASURE_HUMIDITY
            handler([ 0, 71, 192 ]);
          } else {
            // MEASURE_TEMPERATURE
            handler([ 0, 36, 84 ]);
          }
        }
      }.bind(this));
    }.bind(this));

    this.imu = new IMU({
      controller: "TH02",
      freq: 35,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "hygrometer"
    }, {
      name: "thermometer"
    }, {
      name: "thermometer"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    IMU.Drivers.clear();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.imu[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imu[property.name], "undefined");
    }, this);

    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new IMU({
      controller: "TH02",
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

  components: function(test) {
    test.expect(1);

    test.deepEqual(this.imu.components, ["hygrometer", "thermometer"]);

    test.done();
  },

  data: function(test) {
    test.expect(6);

    this.imu.components.forEach(function(component) {
      this[component].emit("change");
    }, this.imu);

    test.ok(this.i2cConfig.calledOnce);
    test.ok(this.i2cWrite.calledOnce);
    test.ok(this.i2cReadOnce.calledOnce);

    // First command will be the MEASURE_TEMPERATURE command
    test.deepEqual(this.i2cWrite.lastCall.args, [ 0x40, 0x03, 0x11 ]);
    test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, -1), [0x40, 0x00, 1]);

    IMU.Drivers.get(this.board, "TH02").on("data", function() {
      test.equal(this.status.callCount >= 2, true);
      test.done();
    }.bind(this));
  },

  // change: function(test) {
  //   // test.expect(10);

  //   var i2cReadOnceTemp, i2cReadOnceHumidity;
  //   var spy = this.sandbox.spy();

  //   this.imu.on("change", spy);

  //   // This is the tCONV time
  //   this.clock.tick(35);

  //   i2cReadOnceTemp = this.i2cReadOnce.lastCall.args[3];
  //   i2cReadOnceTemp([ 0, 36, 44 ]);

  //   // This is the tCONV time
  //   this.clock.tick(35);

  //   i2cReadOnceHumidity = this.i2cReadOnce.lastCall.args[3];
  //   i2cReadOnceHumidity([ 0, 57, 208 ]);

  //   // This is the tCONV time
  //   this.clock.tick(35);

  //   i2cReadOnceTemp = this.i2cReadOnce.lastCall.args[3];
  //   i2cReadOnceTemp([ 0, 26, 45 ]);

  //   // This is the tCONV time
  //   this.clock.tick(35);

  //   i2cReadOnceHumidity = this.i2cReadOnce.lastCall.args[3];
  //   i2cReadOnceHumidity([ 0, 47, 208 ]);

  //   test.equal(spy.lastCall.args[0].hygrometer.relativeHumidity, 23.8125);
  //   test.equal(spy.lastCall.args[0].thermometer.celsius, 2.34375);

  //   test.equal(spy.callCount, 3);
  //   test.done();
  // },
};

exports["Multi -- DHT11_I2C_NANO_BACKPACK"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.imu = new IMU({
      controller: "DHT11_I2C_NANO_BACKPACK",
      freq: 100,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "hygrometer"
    }, {
      name: "thermometer"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    IMU.Drivers.clear();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.imu[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imu[property.name], "undefined");
    }, this);

    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new IMU({
      controller: "DHT11_I2C_NANO_BACKPACK",
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

  components: function(test) {
    test.expect(1);

    test.deepEqual(this.imu.components, ["hygrometer", "thermometer"]);

    test.done();
  },

  data: function(test) {
    var read, spy = this.sandbox.spy();

    test.expect(7);
    this.imu.on("data", spy);

    read = this.i2cRead.args[0][2];

    // Taken from actual readings
    read([ 13, 72, 9, 196 ]);


    test.ok(this.i2cConfig.calledOnce);
    test.ok(this.i2cRead.calledOnce);

    test.equals(this.i2cRead.lastCall.args[0], 0x0A);
    test.equals(this.i2cRead.lastCall.args[1], 4);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.equals(spy.lastCall.args[0].hygrometer.relativeHumidity, 34);
    test.equals(spy.lastCall.args[0].thermometer.celsius, 25);

    test.done();
  },

  change: function(test) {
    var read, spy = this.sandbox.spy();

    test.expect(8);
    this.imu.on("data", spy);

    read = this.i2cRead.args[0][2];

    // Taken from actual readings
    read([ 13, 72, 9, 196 ]);


    test.ok(this.i2cConfig.calledOnce);
    test.ok(this.i2cRead.calledOnce);

    test.equals(this.i2cRead.lastCall.args[0], 0x0A);
    test.equals(this.i2cRead.lastCall.args[1], 4);

    this.clock.tick(100);

    test.equal(spy.callCount, 1);

    test.equals(spy.lastCall.args[0].hygrometer.relativeHumidity, 34);
    test.equals(spy.lastCall.args[0].thermometer.celsius, 25);


    // Taken from actual readings
    read([ 12, 70, 20, 196 ]);
    this.clock.tick(100);


    test.equal(spy.callCount, 2);

    test.done();
  }

};


exports["Multi -- BME280"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.status = this.sandbox.spy();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cReadOnce = this.sandbox.stub(MockFirmata.prototype, "i2cReadOnce", function(address, register, length, handler) {
      process.nextTick(function() {
        if (register === 0x88) {
          handler([ 206, 110, 111, 103, 50, 0, 95, 144, 73, 214, 208, 11, 42, 25, 105, 0, 249, 255, 172, 38, 10, 216, 189, 16 ]);
        }

        if (register === 0xA1) {
          handler([ 75 ]);
        }

        if (register === 0xE1) {
          handler([ 91, 1, 0, 22, 2, 0, 30, 227 ]);
        }

      });
    }.bind(this));

    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", function(address, register, length, handler) {
      process.nextTick(function() {
        handler([ 85, 43, 224, 129, 192, 48, 117, 114 ]);
      });
    }.bind(this));

    this.imu = new IMU({
      controller: "BME280",
      freq: 35,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "altimeter"
    }, {
      name: "barometer"
    }, {
      name: "hygrometer"
    }, {
      name: "thermometer"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    IMU.Drivers.clear();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.imu[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imu[property.name], "undefined");
    }, this);

    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new IMU({
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

  components: function(test) {
    test.expect(1);
    test.deepEqual(this.imu.components, ["altimeter", "barometer", "hygrometer", "thermometer"]);
    test.done();
  },

  data: function(test) {
    test.expect(6);

    this.imu.components.forEach(function(component) {
      this[component].emit("change");
    }, this.imu);

    test.ok(this.i2cConfig.calledOnce);
    test.ok(this.i2cWrite.calledOnce);
    test.equal(this.i2cReadOnce.callCount, 3);

    test.deepEqual(this.i2cWrite.lastCall.args, [ 119, 224, 182 ]);
    test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, -1), [119, 225, 8]);

    IMU.Drivers.get(this.board, "BME280").on("data", function() {
      test.ok(true);
      test.done();
    }.bind(this));
  },
};

exports["Multi -- BMP280"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.status = this.sandbox.spy();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cReadOnce = this.sandbox.stub(MockFirmata.prototype, "i2cReadOnce", function(address, register, length, handler) {
      process.nextTick(function() {
        if (register === 0x88) {
          handler([ 206, 110, 111, 103, 50, 0, 95, 144, 73, 214, 208, 11, 42, 25, 105, 0, 249, 255, 172, 38, 10, 216, 189, 16 ]);
        }
      });
    }.bind(this));

    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", function(address, register, length, handler) {
      process.nextTick(function() {
        handler([ 85, 43, 224, 129, 192, 48 ]);
      });
    }.bind(this));

    this.imu = new IMU({
      controller: "BMP280",
      freq: 35,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "altimeter"
    }, {
      name: "barometer"
    }, {
      name: "thermometer"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    IMU.Drivers.clear();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.imu[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.imu[property.name], "undefined");
    }, this);

    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new IMU({
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

  components: function(test) {
    test.expect(1);
    test.deepEqual(this.imu.components, ["altimeter", "barometer", "thermometer"]);
    test.done();
  },

  data: function(test) {
    test.expect(6);

    this.imu.components.forEach(function(component) {
      this[component].emit("change");
    }, this.imu);

    test.ok(this.i2cConfig.calledOnce);
    test.ok(this.i2cWrite.calledOnce);
    test.equal(this.i2cReadOnce.callCount, 1);

    test.deepEqual(this.i2cWrite.lastCall.args, [ 119, 224, 182 ]);
    test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, -1), [119, 136, 24]);

    IMU.Drivers.get(this.board, "BMP280").on("data", function() {
      test.ok(true);
      test.done();
    }.bind(this));
  },
};
