require("./common/bootstrap");

exports["Motion"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.digitalRead = this.sandbox.spy(MockFirmata.prototype, "digitalRead");
    this.motion = new Motion({
      pin: 7,
      calibrationDelay: 10,
      board: this.board
    });

    this.instance = [{
      name: "detectedMotion"
    }, {
      name: "isCalibrated"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.instance.length);

    this.instance.forEach(({name}) => test.notEqual(typeof this.motion[name], 0));
    test.done();
  },

  emitter(test) {
    test.expect(1);

    test.ok(this.motion instanceof Emitter);

    test.done();
  }
};

exports["Motion - PIR"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.digitalRead = this.sandbox.spy(MockFirmata.prototype, "digitalRead");
    this.motion = new Motion({
      pin: 7,
      calibrationDelay: 10,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  calibrated(test) {
    test.expect(1);
    const spy = this.sandbox.spy();

    this.motion.on("calibrated", spy);
    this.clock.tick(10);
    test.ok(spy.calledOnce);
    test.done();
  },

  data(test) {
    test.expect(1);
    const spy = this.sandbox.spy();

    this.motion.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  change(test) {
    test.expect(1);
    const spy = this.sandbox.spy();
    const callback = this.digitalRead.firstCall.args[1];

    this.motion.on("change", spy);
    this.clock.tick(25);
    callback(0);
    this.clock.tick(25);
    callback(1);
    this.clock.tick(25);
    callback(0);
    this.clock.tick(25);
    test.ok(spy.calledTwice);
    test.done();
  },

  noChange(test) {
    test.expect(1);
    const spy = this.sandbox.spy();
    const callback = this.digitalRead.firstCall.args[1];

    this.motion.on("change", spy);

    this.clock.tick(25);
    callback(0);
    this.clock.tick(25);
    callback(0);
    this.clock.tick(25);
    callback(0);
    this.clock.tick(25);

    test.ok(spy.notCalled);
    test.done();
  },

  motionstart(test) {
    const spy = this.sandbox.spy();
    const callback = this.digitalRead.firstCall.args[1];


    test.expect(1);
    this.motion.on("motionstart", spy);

    // 0 then changes to 1
    callback(0);
    callback(1);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  },

  motionend(test) {
    const spy = this.sandbox.spy();
    const callback = this.digitalRead.firstCall.args[1];

    test.expect(1);
    this.motion.on("motionend", spy);

    // 1 then changes to 0
    callback(1);
    this.clock.tick(25);
    callback(0);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Motion - GP2Y0D805Z0F"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.motion = new Motion({
      controller: "GP2Y0D805Z0F",
      calibrationDelay: 10,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Motion({
      controller: "GP2Y0D805Z0F",
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

  initialize(test) {
    test.expect(8);

    test.ok(this.i2cConfig.called);
    test.ok(this.i2cWriteReg.calledOnce);
    test.ok(this.i2cWrite.calledOnce);
    test.ok(this.i2cRead.calledOnce);

    test.deepEqual(this.i2cWriteReg.firstCall.args, [0x26, 0x03, 0xFE]);
    test.deepEqual(this.i2cWrite.firstCall.args, [0x26, [0x00]]);

    test.equal(this.i2cRead.firstCall.args[0], 0x26);
    test.equal(this.i2cRead.firstCall.args[1], 1);
    test.done();
  },

  calibrated(test) {
    const spy = this.sandbox.spy();
    test.expect(1);
    this.motion.on("calibrated", spy);
    this.clock.tick(10);
    test.ok(spy.calledOnce);
    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);
    this.motion.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  change(test) {
    const spy = this.sandbox.spy();
    const callback = this.i2cRead.firstCall.args[2];
    test.expect(1);
    this.motion.on("change", spy);
    callback([0x00]);
    this.clock.tick(25);
    callback([0x03]);
    this.clock.tick(25);

    test.ok(spy.calledTwice);
    test.done();
  },

  noChange(test) {
    test.expect(1);
    const spy = this.sandbox.spy();
    const callback = this.i2cRead.firstCall.args[2];
    this.motion.on("change", spy);

    this.clock.tick(25);
    callback([0x03]);
    this.clock.tick(25);
    callback([0x03]);
    this.clock.tick(25);
    callback([0x03]);
    this.clock.tick(25);

    test.ok(spy.notCalled);
    test.done();
  },

  motionstart(test) {

    // this.clock.tick(250);
    const spy = this.sandbox.spy();
    const callback = this.i2cRead.firstCall.args[2];

    test.expect(1);
    this.motion.on("motionstart", spy);

    callback([3]);
    callback([1]);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  },

  motionend(test) {

    // this.clock.tick(250);
    const spy = this.sandbox.spy();
    const callback = this.i2cRead.firstCall.args[2];

    test.expect(1);
    this.motion.on("motionend", spy);

    callback([1]);
    this.clock.tick(25);
    callback([3]);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Motion - GP2Y0D810Z0F"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.motion = new Motion({
      controller: "GP2Y0D810Z0F",
      pin: "A0",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  initialize(test) {
    test.expect(2);

    test.ok(this.pinMode.calledOnce);
    test.ok(this.analogRead.calledOnce);
    test.done();
  },

  calibrated(test) {
    const spy = this.sandbox.spy();
    test.expect(1);
    this.motion.on("calibrated", spy);
    this.clock.tick(10);
    test.ok(spy.calledOnce);
    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);
    this.motion.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  change(test) {
    const spy = this.sandbox.spy();
    const callback = this.analogRead.firstCall.args[1];
    test.expect(1);
    this.motion.on("change", spy);
    callback(1023);
    this.clock.tick(25);
    callback(100);
    this.clock.tick(25);
    callback(1023);
    this.clock.tick(25);

    test.ok(spy.calledTwice);
    test.done();
  },

  noChange(test) {
    test.expect(1);
    const spy = this.sandbox.spy();
    const callback = this.analogRead.firstCall.args[1];
    this.motion.on("change", spy);

    callback(1023);
    this.clock.tick(25);
    callback(1023);
    this.clock.tick(25);
    callback(1023);
    this.clock.tick(25);
    callback(1023);
    this.clock.tick(25);

    test.ok(spy.notCalled);
    test.done();
  },

  motionstart(test) {
    const spy = this.sandbox.spy();
    const callback = this.analogRead.firstCall.args[1];

    test.expect(1);
    this.motion.on("motionstart", spy);

    callback(100);
    this.clock.tick(25);
    callback(1023);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  },

  motionend(test) {

    // this.clock.tick(250);
    const spy = this.sandbox.spy();
    const callback = this.analogRead.firstCall.args[1];

    test.expect(1);
    this.motion.on("motionend", spy);

    callback(100);
    this.clock.tick(25);
    callback(1023);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Motion - GP2Y0A60SZLF"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.motion = new Motion({
      controller: "GP2Y0A60SZLF",
      pin: "A0",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  initialize(test) {
    test.expect(2);

    test.ok(this.pinMode.calledOnce);
    test.ok(this.analogRead.calledOnce);
    test.done();
  },

  calibrated(test) {
    const spy = this.sandbox.spy();
    test.expect(1);
    this.motion.on("calibrated", spy);
    this.clock.tick(10);
    test.ok(spy.calledOnce);
    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);
    this.motion.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  change(test) {
    const spy = this.sandbox.spy();
    const callback = this.analogRead.firstCall.args[1];
    test.expect(1);
    this.motion.on("change", spy);
    callback(100);
    this.clock.tick(25);
    callback(1023);
    this.clock.tick(25);
    callback(100);
    this.clock.tick(25);

    test.ok(spy.calledTwice);
    test.done();
  },

  noChange(test) {
    test.expect(1);
    const spy = this.sandbox.spy();
    const callback = this.analogRead.firstCall.args[1];
    this.motion.on("change", spy);

    callback(100);
    this.clock.tick(25);
    callback(100);
    this.clock.tick(25);
    callback(100);
    this.clock.tick(25);
    callback(100);
    this.clock.tick(25);

    test.ok(spy.notCalled);
    test.done();
  },

  motionstart(test) {
    const spy = this.sandbox.spy();
    const callback = this.analogRead.firstCall.args[1];

    test.expect(1);
    this.motion.on("motionstart", spy);

    callback(1023);
    this.clock.tick(25);
    callback(100);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  },

  motionend(test) {

    // this.clock.tick(250);
    const spy = this.sandbox.spy();
    const callback = this.analogRead.firstCall.args[1];

    test.expect(1);
    this.motion.on("motionend", spy);

    callback(1023);
    this.clock.tick(25);
    callback(100);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  }
};

Object.keys(Motion.Controllers).forEach(name => {
  exports[`Motion - Controller, ${name}`] = addControllerTest(Motion, Motion.Controllers[name], {
    controller: name,
  });
});
