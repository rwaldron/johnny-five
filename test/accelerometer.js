var MockFirmata = require("./mock-firmata"),
  pins = require("./mock-pins"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Accelerometer = five.Accelerometer,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Accelerometer -- Analog"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.accel = new Accelerometer({
      pins: ["A0", "A1"],
      freq: 100,
      board: board
    });

    this.proto = [];

    this.instance = [{
      name: "pitch"
    }, {
      name: "roll"
    }, {
      name: "x"
    }, {
      name: "y"
    }, {
      name: "z"
    }, {
      name: "orientation"
    }, {
      name: "inclination"
    }];

    done();
  },

  tearDown: function(done) {
    this.analogRead.restore();
    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.accel[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.accel[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {

    var x = this.analogRead.args[0][1],
      y = this.analogRead.args[1][1],
      spy = sinon.spy();

    test.expect(2);
    this.accel.on("data", spy);

    x(512);
    y(560);


    this.clock.tick(100);

    test.ok(spy.calledTwice);
    test.deepEqual(spy.args[1], [{
      x: 512,
      y: 560,
      z: 0
    }]);

    test.done();
  },

  change: function(test) {

    var x = this.analogRead.args[0][1],
      y = this.analogRead.args[1][1],
      spy = sinon.spy();

    test.expect(1);
    this.accel.on("change", spy);

    x(225);

    this.clock.tick(100);

    x(270);

    this.clock.tick(100);

    y(225);

    this.clock.tick(100);

    y(270);

    this.clock.tick(100);

    test.equal(spy.callCount, 4);
    test.done();
  },
  orientation: function(test) {

    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];
    var spy = sinon.spy();
    var i;

    test.expect(6);

    this.accel.on("orientation", spy);

    for (i = 0; i < 5; i++) {
      x(559);
      y(571);
    }
    test.equal(this.accel.orientation, 1);

    for (i = 0; i < 5; i++) {
      x(577);
      y(568);
    }
    test.equal(this.accel.orientation, 2);

    for (i = 0; i < 5; i++) {
      x(476);
      y(571);
    }
    test.equal(this.accel.orientation, -1);

    for (i = 0; i < 5; i++) {
      x(571);
      y(476);
    }
    test.equal(this.accel.orientation, -2);

    for (i = 0; i < 5; i++) {
      x(580);
      y(650);
    }
    test.equal(this.accel.orientation, 3);

    test.ok(spy.called);

    test.done();
  }
};

exports["Accelerometer -- ADXL335"] = {

  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.accel = new Accelerometer({
      controller: "ADXL335",
      pins: ["A0", "A1", "A2"],
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.analogRead.restore();
    this.clock.restore();
    done();
  },

  data: function(test) {
    var x = this.analogRead.args[0][1];
    var y = this.analogRead.args[1][1];
    var z = this.analogRead.args[2][1];
    var changeSpy = sinon.spy();

    test.expect(2);
    this.accel.on("change", changeSpy);

    x(330);
    y(360);
    z(300);

    this.clock.tick(100);
    test.ok(changeSpy.calledThrice);
    test.deepEqual(changeSpy.args[2], [{
      x: 0,
      y: 0.45,
      z: -0.45
    }]);

    test.done();
  }
};

exports["Accelerometer -- MPU-6050"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(board.io, "i2cConfig");
    this.i2cWrite = sinon.spy(board.io, "i2cWrite");
    this.i2cRead = sinon.spy(board.io, "i2cRead");
    this.accel = new Accelerometer({
      controller: "MPU6050",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();
    this.clock.restore();
    done();
  },

  data: function(test) {
    var read, dataSpy = sinon.spy(), changeSpy = sinon.spy();

    test.expect(12);
    this.accel.on("data", dataSpy);
    this.accel.on("change", changeSpy);

    read = this.i2cRead.args[0][3];
    read([
      0x11, 0x11, 0x22, 0x22, 0x33, 0x33, // accelerometer
      0x00, 0x00,                         // temperature
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00  // gyro
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

    test.ok(dataSpy.calledOnce);
    test.deepEqual(dataSpy.args[0], [{
      x: 4369,
      y: 8738,
      z: 13107
    }]);

    test.ok(changeSpy.calledOnce);
    test.deepEqual(changeSpy.args[0], [{
      x: 0.27,
      y: 0.53,
      z: 0.8
    }]);

    test.done();
  }
};

exports["Accelerometer -- ADXL345"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(board.io, "i2cConfig");
    this.i2cWrite = sinon.spy(board.io, "i2cWrite");
    this.i2cRead = sinon.spy(board.io, "i2cRead");
    this.accel = new Accelerometer({
      controller: "ADXL345",
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();
    this.clock.restore();
    done();
  },

  data: function(test) {
    var read, dataSpy = sinon.spy(), changeSpy = sinon.spy();

    // test.expect(12);
    this.accel.on("data", dataSpy);
    this.accel.on("change", changeSpy);

    read = this.i2cRead.args[0][3];
    read([
      // Derived from actual reading set.
      0x03, 0x00, 0x05, 0x00, 0xFE, 0x00
    ]);

    test.ok(this.i2cConfig.calledOnce);

    test.ok(this.i2cWrite.calledThrice);
    test.deepEqual(this.i2cWrite.getCall(0).args, [ 83, 45, 0 ]);
    test.deepEqual(this.i2cWrite.getCall(1).args, [ 83, 45, 8 ]);
    test.deepEqual(this.i2cWrite.getCall(2).args, [ 83, 49, 8 ]);

    test.ok(this.i2cRead.calledOnce);
    test.deepEqual(this.i2cRead.getCall(0).args.slice(0, 3), [ 83, 50, 6 ]);

    this.clock.tick(100);

    test.ok(dataSpy.calledOnce);
    test.deepEqual(dataSpy.args[0], [{
      x: 3,
      y: 5,
      z: 254
    }]);

    test.ok(changeSpy.calledOnce);
    test.deepEqual(changeSpy.args[0], [{
      x: 0.012,
      y: 0.02,
      z: 1
    }]);

    test.done();
  }
};
