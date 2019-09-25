require("./common/bootstrap");

exports["Accelerometer"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.sandbox.spy(Board, "Component");
    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    this.sandbox.restore();
    done();
  },

  instanceof(test) {
    test.expect(1);
    test.equal(new Accelerometer({
      board: this.board,
      pins: [2, 3, 4]
    }) instanceof Accelerometer, true);
    test.done();
  },

  component(test) {
    test.expect(1);

    new Accelerometer({
      board: this.board,
      pins: [2, 3, 4]
    });

    test.equal(Board.Component.callCount, 1);
    test.done();
  },

};

exports["Accelerometer -- Analog"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.accel = new Accelerometer({
      pins: ["A0", "A1"],
      freq: 100,
      board: this.board
    });

    this.proto = [{
      name: "enable"
    }, {
      name: "disable"
    }, {
      name: "hasAxis"
    }];

    this.instance = [{
      name: "zeroV"
    }, {
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

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function({name}) {
      test.equal(typeof this.accel[name], "function");
    }, this);

    this.instance.forEach(function({name}) {
      test.notEqual(typeof this.accel[name], "undefined");
    }, this);

    test.done();
  },

  data(test) {
    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];
    const spy = this.sandbox.spy();

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

  change(test) {
    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];
    const spy = this.sandbox.spy();

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
  orientation(test) {

    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];
    const spy = this.sandbox.spy();
    let i;

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
  },

  disableAndEnable(test) {
    const x = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();

    test.expect(3);
    this.accel.on("change", spy);

    x(225);
    test.ok(spy.calledOnce);

    this.accel.disable();

    x(250);
    test.ok(spy.calledOnce);

    this.accel.enable();

    x(270);
    test.ok(spy.calledTwice);

    test.done();
  },

  hasZ(test) {
    test.expect(4);
    test.equal(this.accel.hasAxis("z"), false);
    test.equal(this.accel.z, 0);
    test.equal(this.accel.orientation, 3);
    test.equal(this.accel.roll, -90);
    test.done();
  },
};

exports["Accelerometer -- distinctZeroV"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.accel = new Accelerometer({
      pins: ["A0", "A1", "A2"],
      freq: 100,
      board: this.board,
      zeroV: [300, 400, 500],
      sensitivity: 100
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  change(test) {
    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];
    const z = this.analogRead.args[2][1];

    test.expect(3);

    x(400);
    y(400);
    z(400);

    test.equal(this.accel.x, 1);
    test.equal(this.accel.y, 0);
    test.equal(this.accel.z, -1);

    test.done();
  },

  hasZ(test) {
    test.expect(4);

    this.sandbox.stub(this.accel, "hasAxis").returns(true);

    test.notEqual(this.accel.z, undefined);
    test.notEqual(this.accel.pitch, undefined);
    test.notEqual(this.accel.orientation, undefined);
    test.notEqual(this.accel.roll, undefined);
    test.done();
  },
};

exports["Accelerometer -- autoCalibrate"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.accel = new Accelerometer({
      pins: ["A0", "A1", "A2"],
      board: this.board,
      sensitivity: 100,
      autoCalibrate: true
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  calibrates(test) {
    let i;
    const value = 300;
    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];
    const z = this.analogRead.args[2][1];

    test.expect(1);

    for (i = 0; i < 10; i++) {
      x(value + i);
    }
    for (i = 0; i < 10; i++) {
      y(value + 10 + i);
    }
    for (i = 0; i < 10; i++) {
      z(value + 20 + i);
    }

    test.deepEqual(this.accel.zeroV, [304.5, 314.5, 224.5]);

    test.done();
  }
};

exports["Accelerometer -- ADXL335"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.accel = new Accelerometer({
      controller: "ADXL335",
      pins: ["A0", "A1", "A2"],
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  data(test) {
    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];
    const z = this.analogRead.args[2][1];
    const changeSpy = this.sandbox.spy();

    test.expect(5);
    this.accel.on("change", changeSpy);

    x(330);
    y(360);
    z(300);

    this.clock.tick(100);
    test.ok(changeSpy.calledThrice);
    test.deepEqual(changeSpy.args[2], [{
      x: 0,
      y: 0.451,
      z: -0.451
    }]);

    test.equal(digits.fractional(this.accel.x), 0);
    test.equal(digits.fractional(this.accel.y), 3);
    test.equal(digits.fractional(this.accel.z), 3);
    test.done();
  },

  hasZ(test) {
    test.expect(4);
    test.notEqual(this.accel.z, undefined);
    test.notEqual(this.accel.pitch, undefined);
    test.notEqual(this.accel.orientation, undefined);
    test.notEqual(this.accel.roll, undefined);
    test.done();
  },
};

exports["Accelerometer -- MPU-6050"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.accel = new Accelerometer({
      controller: "MPU6050",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Accelerometer({
      controller: "MPU6050",
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
    let read;
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

    test.expect(15);
    this.accel.on("data", dataSpy);
    this.accel.on("change", changeSpy);

    read = this.i2cRead.args[0][3];
    read([
      0x11, 0x11, 0x22, 0x22, 0x33, 0x33, // accelerometer
      0x00, 0x00, // temperature
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00 // gyro
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
      x: 0.267,
      y: 0.533,
      z: 0.8
    }]);

    test.equal(digits.fractional(this.accel.x), 3);
    test.equal(digits.fractional(this.accel.y), 3);
    test.equal(digits.fractional(this.accel.z), 1);

    test.done();
  },

  hasZ(test) {
    test.expect(4);
    test.notEqual(this.accel.z, undefined);
    test.notEqual(this.accel.pitch, undefined);
    test.notEqual(this.accel.orientation, undefined);
    test.notEqual(this.accel.roll, undefined);
    test.done();
  },
};

exports["Accelerometer -- ADXL345"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.accel = new Accelerometer({
      controller: "ADXL345",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Accelerometer({
      controller: "ADXL345",
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
    let read;
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

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
    test.deepEqual(this.i2cWrite.getCall(0).args, [83, 45, 0]);
    test.deepEqual(this.i2cWrite.getCall(1).args, [83, 45, 8]);
    test.deepEqual(this.i2cWrite.getCall(2).args, [83, 49, 8]);

    test.ok(this.i2cRead.calledOnce);
    test.deepEqual(this.i2cRead.getCall(0).args.slice(0, 3), [83, 50, 6]);

    this.clock.tick(100);

    test.ok(dataSpy.calledOnce);
    test.deepEqual(dataSpy.args[0], [{
      x: 3,
      y: 5,
      z: 254
    }]);

    test.ok(changeSpy.calledOnce);
    test.deepEqual(changeSpy.args[0], [{
      x: 0.01171875,
      y: 0.01953125,
      // When this is converted back into a number,
      // the trailing 0 is discarded.
      z: 0.9921875,
    }]);

    test.equal(digits.fractional(this.accel.x), 8);
    test.equal(digits.fractional(this.accel.y), 8);
    test.equal(digits.fractional(this.accel.z), 7);

    test.done();
  },

  dataRange16(test) {
    this.i2cConfig.reset();
    this.i2cWrite.reset();
    this.i2cRead.reset();

    this.accel = new Accelerometer({
      controller: "ADXL345",
      range: 16,
      board: this.board,
    });


    let read;
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

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
    test.deepEqual(this.i2cWrite.getCall(0).args, [83, 45, 0]);
    test.deepEqual(this.i2cWrite.getCall(1).args, [83, 45, 8]);
    test.deepEqual(this.i2cWrite.getCall(2).args, [83, 49, 11]);

    test.ok(this.i2cRead.calledOnce);
    test.deepEqual(this.i2cRead.getCall(0).args.slice(0, 3), [83, 50, 6]);

    this.clock.tick(100);

    test.ok(dataSpy.calledOnce);
    test.deepEqual(dataSpy.args[0], [{
      x: 3,
      y: 5,
      z: 254
    }]);

    test.ok(changeSpy.calledOnce);
    test.deepEqual(changeSpy.args[0], [{
      x: 0.01171875,
      y: 0.01953125,
      // When this is converted back into a number,
      // the trailing 0 is discarded.
      z: 0.9921875
    }]);

    test.done();
  },

  dataRange8(test) {
    this.i2cConfig.reset();
    this.i2cWrite.reset();
    this.i2cRead.reset();

    this.accel = new Accelerometer({
      controller: "ADXL345",
      range: 8,
      board: this.board,
    });


    let read;
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

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
    test.deepEqual(this.i2cWrite.getCall(0).args, [83, 45, 0]);
    test.deepEqual(this.i2cWrite.getCall(1).args, [83, 45, 8]);
    test.deepEqual(this.i2cWrite.getCall(2).args, [83, 49, 10]);

    test.ok(this.i2cRead.calledOnce);
    test.deepEqual(this.i2cRead.getCall(0).args.slice(0, 3), [83, 50, 6]);

    this.clock.tick(100);

    test.ok(dataSpy.calledOnce);
    test.deepEqual(dataSpy.args[0], [{
      x: 3,
      y: 5,
      z: 254
    }]);

    test.ok(changeSpy.calledOnce);
    test.deepEqual(changeSpy.args[0], [{
      x: 0.01171875,
      y: 0.01953125,
      // When this is converted back into a number,
      // the trailing 0 is discarded.
      z: 0.9921875
    }]);

    test.done();
  },

  hasZ(test) {
    test.expect(4);
    test.notEqual(this.accel.z, undefined);
    test.notEqual(this.accel.pitch, undefined);
    test.notEqual(this.accel.orientation, undefined);
    test.notEqual(this.accel.roll, undefined);
    test.done();
  },
};

exports["Accelerometer -- MMA7361"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.accel = new Accelerometer({
      controller: "MMA7361",
      pins: ["A0", "A1", "A2"],
      freq: 100,
      board: this.board,
      sleepPin: 13
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  sleepPinOn(test) {
    test.expect(4);

    test.equal(this.pinMode.callCount, 4);
    test.equal(this.digitalWrite.callCount, 1);

    test.deepEqual(this.pinMode.args[0], [13, this.board.MODES.OUTPUT]);
    test.deepEqual(this.digitalWrite.args[0], [13, 1]);

    test.done();
  },

  noSleepPin(test) {
    test.expect(5);

    this.pinMode.reset();
    this.digitalWrite.reset();

    this.accel = new Accelerometer({
      controller: "MMA7361",
      pins: ["A0", "A1", "A2"],
      freq: 100,
      board: this.board,
    });


    test.equal(this.pinMode.callCount, 3);
    test.deepEqual(this.pinMode.getCall(0).args, [0, this.board.MODES.ANALOG]);
    test.deepEqual(this.pinMode.getCall(1).args, [1, this.board.MODES.ANALOG]);
    test.deepEqual(this.pinMode.getCall(2).args, [2, this.board.MODES.ANALOG]);
    test.equal(this.digitalWrite.callCount, 0);

    test.done();
  },

  disableEnable(test) {
    test.expect(2);

    this.accel.disable();
    test.deepEqual(this.digitalWrite.args[1], [13, 0]);
    this.digitalWrite.reset();

    this.accel.enable();
    test.deepEqual(this.digitalWrite.args[0], [13, 1]);

    test.done();
  },

  data(test) {
    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];
    const z = this.analogRead.args[2][1];
    const changeSpy = this.sandbox.spy();

    test.expect(5);
    this.accel.on("change", changeSpy);

    x(539);
    y(539);
    z(417);

    this.clock.tick(100);
    test.ok(changeSpy.calledThrice);
    test.deepEqual(changeSpy.args[2], [{
      x: 0.982,
      y: 0.982,
      z: 0.765
    }]);

    test.equal(digits.fractional(this.accel.x), 3);
    test.equal(digits.fractional(this.accel.x), 3);
    test.equal(digits.fractional(this.accel.x), 3);

    test.done();
  },

  hasZ(test) {
    test.expect(1);
    test.notEqual(this.accel.z, undefined);
    test.done();
  }
};

exports["Accelerometer -- MMA7660"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.accel = new Accelerometer({
      controller: "MMA7660",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Accelerometer({
      controller: "MMA7660",
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
    let read;
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

    // test.expect(12);
    this.accel.on("data", dataSpy);
    this.accel.on("change", changeSpy);

    read = this.i2cRead.args[0][3];
    read([
      0x01, 0x01, 0x01
    ]);

    test.ok(this.i2cConfig.calledOnce);

    test.ok(this.i2cWrite.calledThrice);
    test.deepEqual(this.i2cWrite.getCall(0).args, [76, 7, 0]);
    test.deepEqual(this.i2cWrite.getCall(1).args, [76, 8, 7]);
    test.deepEqual(this.i2cWrite.getCall(2).args, [76, 7, 1]);

    test.ok(this.i2cRead.calledOnce);
    test.deepEqual(this.i2cRead.getCall(0).args.slice(0, 3), [76, 0, 3]);

    this.clock.tick(100);

    test.ok(dataSpy.calledOnce);
    test.deepEqual(dataSpy.args[0], [{
      x: 1,
      y: 1,
      z: 1
    }]);

    test.ok(changeSpy.calledOnce);
    test.deepEqual(changeSpy.args[0], [{
      x: 0.047,
      y: 0.047,
      z: 0.047,
    }]);

    test.done();
  },
  hasZ(test) {
    test.expect(4);
    test.notEqual(this.accel.z, undefined);
    test.notEqual(this.accel.pitch, undefined);
    test.notEqual(this.accel.orientation, undefined);
    test.notEqual(this.accel.roll, undefined);
    test.done();
  },
};

exports["Accelerometer -- ESPLORA"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.accel = new Accelerometer({
      controller: "ESPLORA",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  data(test) {
    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];
    const z = this.analogRead.args[2][1];
    const changeSpy = this.sandbox.spy();

    test.expect(2);
    this.accel.on("change", changeSpy);

    x(320);
    y(420);
    z(230);

    this.clock.tick(100);
    test.ok(changeSpy.calledThrice);
    test.deepEqual(changeSpy.args[2], [{
      x: 0,
      y: 0.53,
      z: -0.47
    }]);

    test.done();
  },

  hasZ(test) {
    test.expect(1);
    test.notEqual(this.accel.z, undefined);
    test.done();
  }
};

exports["Accelerometer -- MMA8452"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.accel = new Accelerometer({
      controller: "MMA8452",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Accelerometer({
      controller: "MMA8452",
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

  stopTX(test) {
    test.expect(1);
    const args = this.i2cConfig.lastCall.args[0];

    test.deepEqual(args.settings, {
      stopTX: false
    });
    test.done();
  },

  tapsOptionX(test) {
    test.expect(1);

    this.i2cWriteReg.reset();

    new Accelerometer({
      controller: "MMA8452",
      board: this.board,
      taps: {
        x: true,
      }
    });

    test.deepEqual(this.i2cWriteReg.getCall(2).args, [0x1D, 0x23, 0x08]);
    test.done();
  },

  tapsOptionY(test) {
    test.expect(1);

    this.i2cWriteReg.reset();

    new Accelerometer({
      controller: "MMA8452",
      board: this.board,
      taps: {
        y: true,
      }
    });

    test.deepEqual(this.i2cWriteReg.getCall(2).args, [0x1D, 0x24, 0x08]);
    test.done();
  },

  tapsOptionZ(test) {
    test.expect(1);

    this.i2cWriteReg.reset();

    new Accelerometer({
      controller: "MMA8452",
      board: this.board,
      taps: {
        z: true,
      }
    });

    test.deepEqual(this.i2cWriteReg.getCall(2).args, [0x1D, 0x25, 0x08]);
    test.done();
  },

  invalidOdr(test) {
    test.expect(1);

    this.i2cWriteReg.reset();

    test.throws(() => {
      new Accelerometer({
        controller: "MMA8452",
        board: this.board,
        odr: Infinity
      });
    });
    test.done();
  },

  data(test) {
    let read;
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

    test.expect(17);

    test.ok(this.i2cConfig.calledOnce);

    test.equal(this.i2cWriteReg.callCount, 8);

    test.deepEqual(this.i2cWriteReg.getCall(0).args, [29, 42, 8]);
    test.deepEqual(this.i2cWriteReg.getCall(1).args, [29, 14, 0]);
    test.deepEqual(this.i2cWriteReg.getCall(2).args, [29, 37, 8]);
    test.deepEqual(this.i2cWriteReg.getCall(3).args, [29, 33, 112]);
    test.deepEqual(this.i2cWriteReg.getCall(4).args, [29, 38, 48]);
    test.deepEqual(this.i2cWriteReg.getCall(5).args, [29, 39, 160]);
    test.deepEqual(this.i2cWriteReg.getCall(6).args, [29, 40, 255]);
    test.deepEqual(this.i2cWriteReg.getCall(7).args, [29, 42, 9]);


    test.ok(this.i2cRead.calledTwice);
    test.deepEqual(this.i2cRead.getCall(0).args.slice(0, 3), [29, 0, 7]);

    this.accel.on("data", dataSpy);
    this.accel.on("change", changeSpy);

    read = this.i2cRead.firstCall.args[3];
    read([
      // Derived from actual reading set.
      255, 247, 128, 0, 208, 64, 240
    ]);

    test.ok(dataSpy.calledOnce);
    test.ok(changeSpy.calledOnce);

    test.equal(digits.fractional(this.accel.x), 4);
    test.equal(digits.fractional(this.accel.y), 4);
    test.equal(digits.fractional(this.accel.y), 4);

    test.done();
  },

  tap(test) {
    test.expect(2);
    let read;
    const tap = this.sandbox.spy();

    this.accel.on("tap", tap);
    this.accel.on("tap:single", tap);
    this.accel.on("tap:double", tap);

    read = this.i2cRead.lastCall.args[3];
    read([196]);

    // 1 for tap
    // 1 for tap:single
    test.equal(tap.callCount, 2);

    tap.reset();

    read([204]);

    // 1 for tap
    // 1 for tap:single
    // 1 for tap:double
    test.equal(tap.callCount, 3);

    test.done();
  },

  hasZ(test) {
    test.expect(1);
    test.notEqual(this.accel.z, undefined);
    test.done();
  }
};

exports["Accelerometer -- LIS3DH"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.sandbox.spy(Expander, "get");


    this.accel = new Accelerometer({
      controller: "LIS3DH",
      board: this.board,
      freq: 10,
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Accelerometer({
      controller: "LIS3DH",
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

  itGetsAnExpander(test) {
    test.expect(2);
    test.equal(Expander.get.callCount, 1);
    test.deepEqual(Expander.get.lastCall.args[0], {
      address: 24,
      controller: "LIS3DH",
      bus: undefined
    });
    test.done();
  },

  data(test) {
    test.expect(12);


    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

    this.accel.on("data", dataSpy);
    this.accel.on("change", changeSpy);


    test.equal(this.i2cWrite.callCount, 4);
    test.deepEqual(this.i2cWrite.getCall(0).args, [24, 32, 119]);
    test.deepEqual(this.i2cWrite.getCall(1).args, [24, 35, 136]);
    test.deepEqual(this.i2cWrite.getCall(2).args, [24, 34, 16]);
    test.deepEqual(this.i2cWrite.getCall(3).args, [24, 35, 152]);


    const ctrl4ReadOnce = this.i2cReadOnce.lastCall.args[3];

    ctrl4ReadOnce([0x00]);

    test.deepEqual(this.i2cWrite.getCall(4).args, [24, 32, 96]);

    const outXLRead = this.i2cRead.firstCall.args[3];

    outXLRead([64, 1, 112, 0, 176, 30]);
    outXLRead([32, 1, 112, 0, 224, 30]);

    this.clock.tick(10);

    test.equal(dataSpy.callCount, 2);
    test.equal(changeSpy.callCount, 2);

    test.deepEqual(changeSpy.args[1], [{
      x: 0.038,
      y: 0.014,
      z: 0.96
    }]);

    test.equal(digits.fractional(this.accel.x), 3);
    test.equal(digits.fractional(this.accel.y), 3);
    test.equal(digits.fractional(this.accel.z), 2);

    test.done();
  },

  tap(test) {
    test.expect(2);

    const tap = this.sandbox.spy();

    this.accel.on("tap", tap);
    this.accel.on("tap:single", tap);
    this.accel.on("tap:double", tap);

    const ctrl4ReadOnce = this.i2cReadOnce.lastCall.args[3];
    ctrl4ReadOnce([0x00]);

    const clickSrcRead = this.i2cRead.lastCall.args[3];

    this.clock.tick(100);
    clickSrcRead([0]);

    this.clock.tick(100);
    clickSrcRead([20]);


    // 1 for tap
    // 1 for tap:single
    test.equal(tap.callCount, 2);

    tap.reset();

    this.clock.tick(100);
    clickSrcRead([100]);

    // 1 for tap
    // 1 for tap:single
    // 1 for tap:double
    test.equal(tap.callCount, 3);

    test.done();
  },

  hasZ(test) {
    test.expect(4);
    test.notEqual(this.accel.z, undefined);
    test.notEqual(this.accel.pitch, undefined);
    test.notEqual(this.accel.orientation, undefined);
    test.notEqual(this.accel.roll, undefined);
    test.done();
  },
};

exports["Accelerometer -- BNO055"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.accel = new Accelerometer({
      controller: "BNO055",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Accelerometer({
      controller: "BNO055",
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
    test.expect(5);

    const driver = IMU.Drivers.get(this.board, "BNO055");
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

    this.accel.on("data", dataSpy);
    this.accel.on("change", changeSpy);

    driver.emit("data", {
      accelerometer: {
        x: 1,
        y: 2,
        z: 3
      }
    });

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);
    test.equal(digits.fractional(this.accel.x), 2);
    test.equal(digits.fractional(this.accel.y), 2);
    test.equal(digits.fractional(this.accel.z), 2);
    test.done();
  },
  hasZ(test) {
    test.expect(4);
    test.notEqual(this.accel.z, undefined);
    test.notEqual(this.accel.pitch, undefined);
    test.notEqual(this.accel.orientation, undefined);
    test.notEqual(this.accel.roll, undefined);
    test.done();
  },
};


exports["Accelerometer -- User toGravity"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.toGravity = this.sandbox.spy(value => value);

    this.accel = new Accelerometer({
      controller: {
        initialize: {
          value(opts, dataHandler) {
            setInterval(() => {
              dataHandler({
                x: 1,
                y: 2,
                z: 3
              });
            }, 5);
          },
        },
        toGravity: {
          value: this.toGravity,
        },
      },
      board: this.board,
      freq: 10,
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    this.sandbox.restore();
    done();
  },

  data(test) {
    test.expect(5);
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

    this.accel.on("data", dataSpy);
    this.accel.on("change", changeSpy);

    this.clock.tick(5);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.accel.x, 1);
    test.equal(this.accel.y, 2);
    test.equal(this.accel.z, 3);

    test.equal(this.toGravity.callCount, 3);
    test.equal(this.toGravity.getCall(0).args[0], 1);
    test.equal(this.toGravity.getCall(1).args[0], 2);
    test.equal(this.toGravity.getCall(2).args[0], 3);
    test.equal(this.toGravity.getCall(0).returnValue, 1);
    test.equal(this.toGravity.getCall(1).returnValue, 2);
    test.equal(this.toGravity.getCall(2).returnValue, 3);
    test.done();
  },
};

exports["Accelerometer -- User toGravity"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.accel = new Accelerometer({
      controller: {
        initialize: {
          value(opts, dataHandler) {
            setInterval(() => {
              dataHandler({
                x: 1,
                y: 2,
                z: 3
              });
            }, 5);
          }
        }
      },
      board: this.board,
      freq: 10,
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Accelerometer.purge();
    this.sandbox.restore();
    done();
  },

  data(test) {
    test.expect(5);
    const dataSpy = this.sandbox.spy();
    const changeSpy = this.sandbox.spy();

    this.accel.on("data", dataSpy);
    this.accel.on("change", changeSpy);

    this.clock.tick(5);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.accel.x, 1);
    test.equal(this.accel.y, 2);
    test.equal(this.accel.z, 3);

    test.done();
  },
};

Object.keys(Accelerometer.Controllers).forEach(name => {
  exports[`Accelerometer - Controller, ${name}`] = addControllerTest(
    Accelerometer, Accelerometer.Controllers[name], {
      controller: name,
      pins: []
    }
  );
});
