require("./common/bootstrap");

const proto = [{
  name: "within",
}];

const instance = [{
  name: "value",
}, {
  name: "level",
}, {
  name: "lux",
}];

exports["Light"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.sandbox.spy(Board, "Component");

    done();
  },

  tearDown(done) {
    Board.purge();
    Light.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    this.light = new Light({
      pin: "A1",
      freq: 100,
      board: this.board
    });

    proto.forEach(({name}) => test.equal(typeof this.light[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.light[name], 0));

    test.done();
  },

  instanceof(test) {
    test.expect(1);
    test.equal(new Light({ board: this.board }) instanceof Light, true);
    test.done();
  },

  component(test) {
    test.expect(1);

    new Light({ board: this.board });

    test.equal(Board.Component.callCount, 1);
    test.done();
  },

  emitter(test) {
    test.expect(1);

    this.light = new Light({
      pin: "A1",
      freq: 100,
      board: this.board
    });

    test.ok(this.light instanceof Emitter);
    test.done();
  },

  customIntensityLevel(test) {
    test.expect(2);

    this.light = new Light({
      board: this.board,
      controller: {},
      toIntensityLevel(x) {
        test.ok(true);
        return x * x;
      },
    });

    test.equal(this.light.toIntensityLevel(2), 4);
    test.done();
  },

  fallbackIntensityLevel(test) {
    test.expect(1);

    this.light = new Light({
      board: this.board,
      controller: {},
    });

    test.equal(this.light.toIntensityLevel(2), 2);
    test.done();
  },
};

exports["Light: ALSPT19"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.light = new Light({
      controller: "ALSPT19",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Light.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.light[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.light[name], 0));

    test.done();
  },

  emitter(test) {
    test.expect(1);
    test.ok(this.light instanceof Emitter);
    test.done();
  }
};

exports["Light: BH1750"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.light = new Light({
      controller: "BH1750",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Light.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Light({
      controller: "BH1750",
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

  initialization(test) {
    test.expect(4);
    test.equal(this.i2cConfig.callCount, 1);
    test.equal(this.i2cWrite.callCount, 1);
    test.equal(this.i2cWrite.lastCall.args[0], 0x23);
    test.equal(this.i2cWrite.lastCall.args[1], 0x10);
    test.done();
  },

  data(test) {
    test.expect(3);

    this.clock.tick(120);

    const read = this.i2cReadOnce.lastCall.args[2];
    const spy = this.sandbox.spy();

    this.light.on("data", spy);

    read([ 3, 84 ]);

    this.clock.tick(25);

    test.equal(spy.callCount, 1);
    test.equal(this.light.level, 0.01);
    test.equal(this.light.lux, 710);

    test.done();
  },

  change(test) {
    test.expect(6);

    this.clock.tick(120);

    const read = this.i2cReadOnce.lastCall.args[2];
    const spy = this.sandbox.spy();

    this.light.on("change", spy);

    read([ 3, 84 ]);
    this.clock.tick(25);
    test.equal(spy.callCount, 1);
    test.equal(this.light.level, 0.01);
    test.equal(this.light.lux, 710);

    this.clock.tick(120);

    read([ 3, 95 ]);
    this.clock.tick(25);
    test.equal(spy.callCount, 2);
    test.equal(this.light.level, 0.01);
    test.equal(this.light.lux, 719);

    test.done();
  },
};

exports["Light: TSL2561"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.light = new Light({
      controller: "TSL2561",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Light.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Light({
      controller: "TSL2561",
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

  initialization(test) {
    test.expect(4);
    test.equal(this.i2cConfig.callCount, 1);
    test.equal(this.i2cWriteReg.callCount, 3);
    test.equal(this.i2cWriteReg.lastCall.args[0], 0x29);
    test.equal(this.i2cWriteReg.lastCall.args[1], 0x81);
    test.done();
  },

};

exports["Light: EVS_EV3, Ambient (Default)"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evswrite = this.sandbox.spy(EVS.prototype, "write");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", (address, register, numBytes, callback) => {
      callback([15, 0]);
    });

    this.light = new Light({
      controller: "EVS_EV3",
      pin: "BAS1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Light.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.light[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.light[name], 0));

    test.done();
  },

  initialization(test) {
    test.expect(2);

    const shield = {
      address: 26,
      analog: 112,
      bank: "a",
      mode: 111,
      motor: undefined,
      offset: 0,
      port: 1,
      sensor: 1
    };

    test.deepEqual(this.evssetup.lastCall.args, [shield, EVS.Type_EV3]);
    test.deepEqual(this.evswrite.lastCall.args, [shield, 0x81 + shield.offset, EVS.Type_EV3_LIGHT]);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    this.clock.tick(250);

    this.light.within([0.10, 0.20], "level", function() {
      test.equal(this.level, 0.15);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Light: EVS_EV3, Reflected"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evswrite = this.sandbox.spy(EVS.prototype, "write");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", (address, register, numBytes, callback) => {
      callback([15, 0]);
    });

    this.light = new Light({
      controller: "EVS_EV3",
      pin: "BAS1",
      mode: "reflected",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Light.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.light[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.light[name], 0));

    test.done();
  },

  initialization(test) {
    test.expect(2);

    const shield = {
      address: 26,
      analog: 112,
      bank: "a",
      mode: 111,
      motor: undefined,
      offset: 0,
      port: 1,
      sensor: 1
    };

    test.deepEqual(this.evssetup.lastCall.args, [shield, EVS.Type_EV3]);
    test.deepEqual(this.evswrite.lastCall.args, [shield, 0x81 + shield.offset, EVS.Type_EV3_LIGHT_REFLECTED]);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    this.clock.tick(250);

    this.light.within([0.10, 0.20], "level", function() {
      test.equal(this.level, 0.15);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Light: EVS_NXT, Ambient (Default)"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evswrite = this.sandbox.spy(EVS.prototype, "write");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", (address, register, numBytes, callback) => {
      callback([100, 3]);
    });

    this.light = new Light({
      controller: "EVS_NXT",
      pin: "BAS1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Light.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.light[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.light[name], 0));

    test.done();
  },

  initialization(test) {
    test.expect(1);

    const shield = {
      address: 26,
      analog: 112,
      bank: "a",
      mode: 111,
      motor: undefined,
      offset: 0,
      port: 1,
      sensor: 1
    };

    test.deepEqual(this.evssetup.lastCall.args, [shield, EVS.Type_NXT_LIGHT]);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    this.clock.tick(250);

    this.light.within([0.10, 0.20], "level", function() {
      test.equal(this.level, 0.15);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Light: EVS_NXT, Reflected"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evswrite = this.sandbox.spy(EVS.prototype, "write");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", (address, register, numBytes, callback) => {
      callback([100, 3]);
    });

    this.light = new Light({
      controller: "EVS_NXT",
      pin: "BAS1",
      mode: "reflected",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Light.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.light[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.light[name], 0));

    test.done();
  },

  initialization(test) {
    test.expect(1);

    const shield = {
      address: 26,
      analog: 112,
      bank: "a",
      mode: 111,
      motor: undefined,
      offset: 0,
      port: 1,
      sensor: 1
    };

    test.deepEqual(this.evssetup.lastCall.args, [shield, EVS.Type_NXT_LIGHT_REFLECTED]);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    this.clock.tick(250);

    this.light.within([0.10, 0.20], "level", function() {
      test.equal(this.level, 0.15);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

