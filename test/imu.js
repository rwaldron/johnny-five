var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  IMU = five.IMU;

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

function restore(target) {
  for (var prop in target) {

    if (Array.isArray(target[prop])) {
      continue;
    }

    if (target[prop] != null && typeof target[prop].restore === "function") {
      target[prop].restore();
    }

    if (typeof target[prop] === "object") {
      restore(target[prop]);
    }
  }
}

exports["IMU -- MPU6050"] = {

  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");
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
      name: "temperature"
    }, {
      name: "gyro"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
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
    test.equals(spy.args[0][0].accelerometer.x, 0.27);
    test.equals(spy.args[0][0].accelerometer.y, 0.53);
    test.equals(spy.args[0][0].accelerometer.z, 0.8);
    test.equals(Math.round(spy.args[0][0].temperature.celsius), 49);
    test.equals(spy.args[0][0].gyro.x, 127);
    test.equals(spy.args[0][0].gyro.y, 128);
    test.equals(spy.args[0][0].gyro.z, 129);

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

exports["Multi -- MPL115A2"] = {

  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");
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
      name: "temperature"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
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

    test.deepEqual(this.imu.components, ["barometer", "temperature"]);

    test.done();
  },
};
