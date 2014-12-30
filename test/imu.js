var MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  IMU = five.IMU,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["IMU -- MPU6050"] = {

  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(board.io, "i2cConfig");
    this.i2cWrite = sinon.spy(board.io, "i2cWrite");
    this.i2cRead = sinon.spy(board.io, "i2cRead");
    this.imu = new IMU({
      controller: "MPU6050",
      freq: 100,
      board: board
    });

    this.proto = [];

    this.instance = [{
      name: "components"
    }, {
      name: "accelerometer"
    }, {
      name: "temperature"
    }, {
      name: "gyro"
    }];

    done();
  },

  tearDown: function(done) {
    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();
    this.clock.restore();
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

  components: function(test) {
    test.expect(1);

    test.deepEqual(this.imu.components, ["accelerometer", "temperature", "gyro"]);

    test.done();
  },

  data: function(test) {
    var read, spy = sinon.spy();

    test.expect(16);
    this.imu.on("data", spy);

    read = this.i2cRead.args[0][3];
    read([
      0x11, 0x11, 0x22, 0x22, 0x33, 0x33, // accelerometer
      0x11, 0x22,                         // temperature
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
    test.equals(spy.args[0][1].accelerometer.x, 0.27);
    test.equals(spy.args[0][1].accelerometer.y, 0.53);
    test.equals(spy.args[0][1].accelerometer.z, 0.8);
    test.equals(Math.round(spy.args[0][1].temperature.celsius), 49);
    test.equals(spy.args[0][1].gyro.x, 127);
    test.equals(spy.args[0][1].gyro.y, 128);
    test.equals(spy.args[0][1].gyro.z, 129);
    
    test.done();
  },

  change: function(test) {
    var read, changeSpy = sinon.spy();

    test.expect(2);
    this.imu.on("change", changeSpy);
    this.imu.gyro.isCalibrated = true;

    read = this.i2cRead.args[0][3];
    read([
      0x11, 0x11, 0x22, 0x22, 0x33, 0x33, // accelerometer
      0x11, 0x22,                         // temperature
      0x11, 0x11, 0x33, 0x33, 0x55, 0x55, // gyro
    ]);

    this.clock.tick(100);

    test.ok(changeSpy.callCount, 3);

    read([
      0x11, 0x11, 0x22, 0x22, 0x33, 0x33,
      0x22, 0x33,                         // only change temperature
      0x11, 0x11, 0x33, 0x33, 0x55, 0x55,
    ]);

    this.clock.tick(100);

    test.ok(changeSpy.callCount, 4);

    test.done();
  }
};