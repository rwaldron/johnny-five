require("./common/bootstrap");

exports["Gyro -- ANALOG"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.gyro = new Gyro({
      pins: ["A0", "A1"],
      sensitivity: 0.167,
      freq: 100,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "isCalibrated"
    }, {
      name: "pitch"
    }, {
      name: "roll"
    }, {
      name: "x"
    }, {
      name: "y"
    }, {
      name: "rate"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.gyro[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.gyro[property.name], "undefined");
    }, this);

    test.done();
  },

  isCalibrated: function(test) {
    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];

    test.expect(2);
    test.ok(!this.gyro.isCalibrated);

    for (var i = 0; i < 101; i++) {
      x(225);
      y(255);
    }

    test.ok(this.gyro.isCalibrated);
    test.done();
  },

  recalibrate: function(test) {
    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];

    test.expect(4);
    test.ok(!this.gyro.isCalibrated);

    for (var i = 0; i < 101; i++) {
      x(225);
      y(255);
    }

    test.ok(this.gyro.isCalibrated);

    this.gyro.recalibrate();

    test.ok(!this.gyro.isCalibrated);

    for (i = 0; i < 101; i++) {
      x(225);
      y(255);
    }

    test.ok(this.gyro.isCalibrated);

    test.done();
  },

  data: function(test) {
    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];
    var spy = this.sandbox.spy();

    test.expect(1);

    this.gyro.isCalibrated = true;
    this.gyro.on("data", spy);

    x(225);
    y(255);

    this.clock.tick(100);

    test.ok(spy.calledTwice);
    test.done();
  },

  change: function(test) {
    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];
    var spy = this.sandbox.spy();

    test.expect(1);

    this.gyro.isCalibrated = true;
    this.gyro.on("change", spy);

    x(225);

    this.clock.tick(100);

    x(255);

    this.clock.tick(100);

    y(225);

    this.clock.tick(100);

    y(255);

    this.clock.tick(100);

    test.equal(spy.callCount, 4);
    test.done();
  }

  // TODO: tests for pitch, roll, x, y, and rate
};

exports["Gyro -- MPU6050"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.gyro = new Gyro({
      controller: "MPU6050",
      freq: 100,
      board: this.board
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

    new Gyro({
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

  data: function(test) {
    var read, spy = this.sandbox.spy();

    test.expect(10);
    this.gyro.isCalibrated = true;
    this.gyro.on("data", spy);

    read = this.i2cRead.args[0][3];
    read([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // accelerometer
      0x00, 0x00, // temperature
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
    test.deepEqual(spy.args[0], [{
      x: 127,
      y: 128,
      z: 129
    }]);

    test.done();
  }
};

Object.keys(Gyro.Controllers).forEach(function(name) {
  exports["Gyro - Controller, " + name] = addControllerTest(Gyro, Gyro.Controllers[name], {
    controller: name,
    sensitivity: 1
  });
});
