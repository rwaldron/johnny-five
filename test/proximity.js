require("./common/bootstrap");

const EVS = require("../lib/evshield");

const proto = [{
  name: "within"
}];

const instance = [{
  name: "centimeters"
}, {
  name: "cm"
}, {
  name: "inches"
}, {
  name: "in"
}];

exports["Proximity"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2Y0A21YK",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.proximity[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.proximity[name], 0));

    test.done();
  },

  emitter(test) {
    test.expect(1);
    test.ok(this.proximity instanceof Emitter);
    test.done();
  }
};

exports["Proximity: GP2Y0A21YK"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2Y0A21YK",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  GP2Y0A21YK(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(4);

    // 154 is an actual reading at ~14.5"
    callback(154);

    test.equals(Math.round(this.proximity.centimeters), 38);
    test.equals(Math.round(this.proximity.cm), 38);
    test.equals(Math.round(this.proximity.inches), 15);
    test.equals(Math.round(this.proximity.in), 15);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const callback = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();
    test.expect(2);

    callback(500);
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 3.79);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: GP2D120XJ00F"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2D120XJ00F",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  GP2D120XJ00F(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(4);
    // 70 is an actual reading at ~14.5"
    callback(70);

    test.equals(Math.round(this.proximity.centimeters), 38);
    test.equals(Math.round(this.proximity.cm), 38);
    test.equals(Math.round(this.proximity.inches), 15);
    test.equals(Math.round(this.proximity.in), 15);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const callback = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();
    test.expect(2);

    callback(100);
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 10.43);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: GP2Y0A02YK0F"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2Y0A02YK0F",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  GP2Y0A02YK0F(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(4);

    // 325 is an actual reading at ~14.5"
    callback(325);

    test.equals(Math.round(this.proximity.centimeters), 38);
    test.equals(Math.round(this.proximity.cm), 38);
    test.equals(Math.round(this.proximity.inches), 15);
    test.equals(Math.round(this.proximity.in), 15);

    test.done();
  },
  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const callback = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();
    test.expect(2);

    callback(500);
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 8.54);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: GP2Y0A41SK0F"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2Y0A41SK0F",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  GP2Y0A41SK0F(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(4);

    // 325 is an actual reading at ~2.5"
    callback(325);

    test.equals(Math.round(this.proximity.centimeters), 7);
    test.equals(Math.round(this.proximity.cm), 7);
    test.equals(Math.round(this.proximity.inches), 3);
    test.equals(Math.round(this.proximity.in), 3);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const callback = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();
    test.expect(2);

    callback(128);
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 6.92);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: GP2Y0A710K0F"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2Y0A710K0F",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  GP2Y0A41SK0F(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(4);

    callback(500);

    test.equals(Math.round(this.proximity.centimeters), 87);
    test.equals(Math.round(this.proximity.cm), 87);
    test.equals(Math.round(this.proximity.inches), 34);
    test.equals(Math.round(this.proximity.in), 34);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const callback = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();
    test.expect(2);

    callback(500);
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 33.93);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: MB1000"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "MB1000",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  MB1000(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(5);

    // (500 / 2) * 2.54 = 648,97cm
    callback(511);

    test.equals(Math.round(this.proximity.centimeters), 649);
    test.equals(Math.round(this.proximity.cm), 649);
    test.equals(Math.round(this.proximity.inches), 253);
    test.equals(Math.round(this.proximity.in), 253);
    test.equals(digits.fractional(this.proximity.centimeters), 2);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const callback = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();
    test.expect(2);

    callback(11);
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 5.45);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: MB1010"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "MB1010",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  MB1010(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(4);

    // (500 / 2) * 2.54 = 635cm
    callback(500);

    test.equals(Math.round(this.proximity.centimeters), 635);
    test.equals(Math.round(this.proximity.cm), 635);
    test.equals(Math.round(this.proximity.inches), 248);
    test.equals(Math.round(this.proximity.in), 248);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const callback = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();
    test.expect(2);

    callback(11);
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 5.45);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: MB1003"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "MB1003",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  MB1003(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(5);

    // 500 is an actual reading at ~250cm
    callback(507);

    test.equals(Math.round(this.proximity.centimeters), 254);
    test.equals(Math.round(this.proximity.cm), 254);
    test.equals(Math.round(this.proximity.inches), 99);
    test.equals(Math.round(this.proximity.in), 99);
    test.equals(digits.fractional(this.proximity.centimeters), 1);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const callback = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();
    test.expect(2);

    callback(30);
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 5.85);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: MB1230"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "MB1230",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  MB1230(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(5);

    callback(250);

    test.equals(Math.round(this.proximity.centimeters), 250);
    test.equals(Math.round(this.proximity.cm), 250);
    test.equals(Math.round(this.proximity.inches), 98);
    test.equals(Math.round(this.proximity.in), 98);
    test.equals(digits.fractional(this.proximity.centimeters), 0);

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    const callback = this.analogRead.args[0][1];

    test.expect(1);

    // 250 is an actual reading at ~250cm
    callback(250);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const callback = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();
    test.expect(2);

    callback(15);
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 5.85);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};


exports["Proximity: SRF10"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");

    this.proximity = new Proximity({
      controller: "SRF10",
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

    new Proximity({
      controller: "SRF10",
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

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.proximity[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.proximity[name], 0));

    test.done();
  },

  initialize(test) {
    test.expect(4);

    test.ok(this.i2cConfig.called);
    test.ok(this.i2cWrite.calledThrice);

    test.deepEqual(
      this.i2cWrite.firstCall.args, [0x70, [0x01, 16]]
    );
    test.deepEqual(
      this.i2cWrite.secondCall.args, [0x70, [0x02, 255]]
    );

    test.done();
  },

  data(test) {
    test.expect(2);

    this.clock.tick(100);

    const callback = this.i2cReadOnce.args[0][2];
    const spy = this.sandbox.spy();

    test.equal(spy.callCount, 0);

    this.proximity.on("data", spy);

    callback([3, 225]);
    callback([3, 255]);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  change(test) {
    this.clock.tick(100);

    const callback = this.i2cReadOnce.args[0][2];
    const spy = this.sandbox.spy();

    test.expect(1);
    this.proximity.on("change", spy);

    this.clock.tick(100);
    callback([3, 225]);

    this.clock.tick(100);
    callback([3, 255]);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within_unit(test) {
    this.clock.tick(65);

    const callback = this.i2cReadOnce.args[0][2];
    let called = false;

    test.expect(1);

    this.proximity.within([3, 6], "inches", function() {
      if (!called) {
        called = true;
        test.equal(this.inches, 3.9);
        test.done();
      }
    });

    callback([0, 10]);
    this.clock.tick(100);
  }
};

exports["Proximity: HCSR04"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.pulseVal = 1000;

    this.sandbox.stub(MockFirmata.prototype, "pingRead", (settings, handler) => {
      handler(this.pulseVal);
    });

    this.proximity = new Proximity({
      controller: "HCSR04",
      pin: 7,
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  acceptAnalogPin(test) {
    test.expect(4);

    const a = this.sandbox.spy();
    const b = this.sandbox.spy();

    this.proximity = new Proximity({
      controller: "HCSR04",
      pin: "A0",
      freq: 100,
      board: this.board
    });

    test.equal(this.proximity.pin, 14);

    // tick the clock forward to trigger the pingRead handler
    this.clock.tick(250);

    this.proximity.on("data", a);
    this.clock.tick(100);
    test.ok(a.calledOnce);

    this.proximity = new Proximity({
      controller: "HCSR04",
      pin: 15,
      freq: 100,
      board: this.board
    });

    test.equal(this.proximity.pin, 15);

    // tick the clock forward to trigger the pingRead handler
    this.clock.tick(250);

    this.proximity.on("data", b);
    this.clock.tick(100);

    test.ok(b.calledOnce);

    test.done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.proximity[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.proximity[name], 0));

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    // tick the clock forward to trigger the pingRead handler
    this.clock.tick(250);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.equals(digits.fractional(this.proximity.centimeters), 1);

    test.done();
  },

  change(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.pulseVal = 0;

    // tick the clock forward to trigger the pingRead handler
    this.clock.tick(250);

    this.pulseVal = 1000;

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();

  },

  within(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    // tick the clock forward to trigger the pingRead handler
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      // The fake microseconds value is 1000, which
      // calculates to 6.71 inches.
      test.equal(this.inches, 6.71);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: HCSR04I2C"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cReadOnce = this.sandbox.stub(MockFirmata.prototype, "i2cReadOnce", (ADDRESS, BYTES_TO_READ, callback) => {
      // Use this for 1000 us as duration (HIGH and LOW)
      const pulseval = 1000;
      callback([pulseval >> 8, pulseval & 0xFF]);
    });

    this.proximity = new Proximity({
      controller: "HCSR04I2CBACKPACK",
      freq: 100,
    });

    done();
  },

  tearDown(done) {
    this.i2cConfig.restore();
    this.i2cReadOnce.restore();
    this.clock.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.proximity[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.proximity[name], 0));

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.equal(digits.fractional(this.proximity.centimeters), 1);

    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 6.71);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: LIDARLITE"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cReadOnce = this.sandbox.stub(MockFirmata.prototype, "i2cReadOnce", (ADDRESS, READREGISTER, BYTES_TO_READ, callback) => {
      const cm = 15;

      // Split to HIGH and LOW
      callback([cm >> 8, cm & 0xff]);
    });

    this.proximity = new Proximity({
      controller: "LIDARLITE",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cReadOnce.restore();
    this.clock.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.proximity[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.proximity[name], 0));

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);

    test.equal(digits.fractional(this.proximity.centimeters), 0);

    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 5.85);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: EVS_EV3_IR"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", (address, register, numBytes, callback) => {
      callback([15, 0]);
    });

    this.proximity = new Proximity({
      controller: "EVS_EV3_IR",
      pin: "BAS1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.proximity[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.proximity[name], 0));

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 5.85);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: EVS_EV3_US"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", (address, register, numBytes, callback) => {
      callback([150, 0]);
    });

    this.proximity = new Proximity({
      controller: "EVS_EV3_US",
      pin: "BAS1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(({name}) => test.equal(typeof this.proximity[name], "function"));
    instance.forEach(({name}) => test.notEqual(typeof this.proximity[name], 0));

    test.done();
  },

  data(test) {
    const spy = this.sandbox.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.proximity.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within(test) {
    const spy = this.sandbox.spy();
    test.expect(2);

    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 5.85);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity.Collection"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.board = newBoard();
    this.pinMode = this.sandbox.stub(MockFirmata.prototype, "pinMode");
    this.analogRead = this.sandbox.stub(MockFirmata.prototype, "analogRead");
    this.digitalRead = this.sandbox.stub(MockFirmata.prototype, "digitalRead");
    this.i2cConfig = this.sandbox.stub(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead");
    this.i2cReadOnce = this.sandbox.stub(MockFirmata.prototype, "i2cReadOnce");
    this.i2cWrite = this.sandbox.stub(MockFirmata.prototype, "i2cWrite");
    this.pingRead = this.sandbox.stub(MockFirmata.prototype, "pingRead");

    this.spy = this.sandbox.spy();
    // var hcsr04sOnBackpack = new Proximity.Collection({
    //   pins: [2, 3, 4],
    //   controller: "HCSR04I2CBACKPACK",
    //   board: this.board
    // });

    // var hcsr04sOnBoard = new Proximity.Collection({
    //   pins: [2, 3, 4],
    //   controller: "HCSR04",
    //   board: this.board
    // });

    // var mixed = new Proximity.Collection([
    //   { controller: "GP2Y0A710K0F", pin: "A0", board: this.board },
    //   { controller: "HCSR04I2CBACKPACK", board: this.board },
    //   { controller: "LIDARLITE", board: this.board },
    //   { controller: "MB1003", pin: "A0", board: this.board },
    //   { controller: "SRF10", board: this.board },
    // ]);

    done();
  },

  tearDown(done) {
    Proximity.purge();
    Board.purge();
    this.sandbox.restore();
    done();
  },

  "data: Collection of 3 HCSR04s On One Backpack": function(test) {
    test.expect(7);


    const collection = new Proximity.Collection({
      pins: [2, 3, 4],
      controller: "HCSR04I2CBACKPACK",
      board: this.board
    });

    collection.on("data", this.spy);

    test.equal(this.i2cConfig.callCount, 3);
    test.equal(this.i2cReadOnce.callCount, 3);


    // These should be .args[3] when firmware and controller updates land
    this.i2cReadOnce.getCall(0).args[2]([ 0x00, 0x10 ]);
    this.i2cReadOnce.getCall(1).args[2]([ 0x00, 0x20 ]);
    this.i2cReadOnce.getCall(2).args[2]([ 0x00, 0x30 ]);

    this.clock.tick(15);

    test.equal(this.spy.callCount, 3);

    test.equal(collection.length, 3);
    test.equal(collection[0].cm, 0.3);
    test.equal(collection[1].cm, 0.5);
    test.equal(collection[2].cm, 0.8);

    test.done();
  },

  "data: Collection of 3 HCSR04s On One Board": function(test) {
    test.expect(6);

    const collection = new Proximity.Collection({
      pins: [2, 3, 4],
      controller: "HCSR04",
      board: this.board
    });

    collection.on("data", this.spy);

    test.equal(this.pingRead.callCount, 3);

    // These should be .args[3] when firmware and controller updates land
    this.pingRead.getCall(0).args[1](100);
    this.pingRead.getCall(1).args[1](200);
    this.pingRead.getCall(2).args[1](300);

    this.clock.tick(15);

    test.equal(this.spy.callCount, 3);

    test.equal(collection.length, 3);
    test.equal(collection[0].cm, 1.7);
    test.equal(collection[1].cm, 3.4);
    test.equal(collection[2].cm, 5.2);

    test.done();
  },

  "data: Collection of Mixed Proximity Sensors": function(test) {
    test.expect(23);

    const collection = new Proximity.Collection([
      { controller: "GP2Y0A710K0F", pin: "A0", board: this.board },
      { controller: "HCSR04I2CBACKPACK", board: this.board },
      { controller: "LIDARLITE", board: this.board },
      { controller: "MB1003", pin: "A1", board: this.board },
      { controller: "SRF10", board: this.board },
    ]);

    collection.on("data", this.spy);

    this.clock.tick(100);

    // GP2Y0A710K0F, MB1003
    test.equal(this.pinMode.callCount, 2);
    test.equal(this.analogRead.callCount, 2);

    test.equal(this.pinMode.getCall(0).args[0], 0);
    test.equal(this.analogRead.getCall(0).args[0], 0);

    test.equal(this.pinMode.getCall(1).args[0], 1);
    test.equal(this.analogRead.getCall(1).args[0], 1);


    this.analogRead.getCall(0).args[1](1021);
    this.analogRead.getCall(1).args[1](512);


    // HCSR04I2CBACKPACK, LIDARLITE, SRF10
    test.equal(this.i2cConfig.callCount, 3);
    test.equal(this.i2cReadOnce.callCount, 3);


    // LIDARLITE, SRF10
    test.equal(this.i2cWrite.callCount, 6);

    // LIDARLITE: address, enable, measuremode
    test.deepEqual(this.i2cWrite.getCall(0).args, [ 0x62, 0x00, 0x04 ]);

    // SRF10: startup register writes
    test.deepEqual(this.i2cWrite.getCall(1).args, [ 0x70, [0x01, 0x10] ]);
    test.deepEqual(this.i2cWrite.getCall(2).args, [ 0x70, [0x02, 0xFF] ]);
    // SRF10: Set to CM
    test.deepEqual(this.i2cWrite.getCall(3).args, [ 0x70, [0x00, 0x51] ]);
    // SRF10: Initiate Measurement
    test.deepEqual(this.i2cWrite.getCall(4).args, [ 0x70, [0x02] ]);


    // HCSR04I2CBACKPACK
    test.equal(this.i2cReadOnce.getCall(0).args[0], 0x27);
    // LIDARLITE
    test.equal(this.i2cReadOnce.getCall(1).args[0], 0x62);
    // SRF10
    test.equal(this.i2cReadOnce.getCall(2).args[0], 0x70);

    // HCSR04I2CBACKPACK
    // These should be .args[3] when firmware and controller updates land
    this.i2cReadOnce.getCall(0).args[2]([ 0x00, 0x10 ]);
    // LIDARLITE
    this.i2cReadOnce.getCall(1).args[3]([ 0x00, 0x20 ]);
    // SRF10
    this.i2cReadOnce.getCall(2).args[2]([ 0x00, 0x30 ]);


    test.equal(collection.length, 5);

    // GP2Y0A710K0F
    test.equal(collection[0].cm, 15);
    // HCSR04I2CBACKPACK
    test.equal(collection[1].cm, 0.3);
    // LIDARLITE
    test.equal(collection[2].cm, 32);
    // MB1003
    test.equal(collection[3].cm, 256);
    // SRF10
    test.equal(collection[4].cm, 48);


    test.done();
  },

  change(test) {
    test.expect(10);


    const collection = new Proximity.Collection({
      pins: [2, 3, 4],
      controller: "HCSR04I2CBACKPACK",
      board: this.board
    });

    collection.on("change", this.spy);

    test.equal(this.i2cConfig.callCount, 3);
    test.equal(this.i2cReadOnce.callCount, 3);


    // These should be .args[3] when firmware and controller updates land
    this.i2cReadOnce.getCall(0).args[2]([ 0x00, 0x00 ]);
    this.i2cReadOnce.getCall(0).args[2]([ 0x00, 0x10 ]);
    this.i2cReadOnce.getCall(1).args[2]([ 0x00, 0x00 ]);
    this.i2cReadOnce.getCall(1).args[2]([ 0x00, 0x20 ]);
    this.i2cReadOnce.getCall(2).args[2]([ 0x00, 0x00 ]);
    this.i2cReadOnce.getCall(2).args[2]([ 0x00, 0x30 ]);

    this.clock.tick(100);

    test.equal(this.spy.callCount, 3);

    test.equal(collection.length, 3);
    test.equal(collection[0].cm, 0.3);
    test.equal(collection[1].cm, 0.5);
    test.equal(collection[2].cm, 0.8);

    test.equal(this.spy.getCall(0).args[0], collection[0]);
    test.equal(this.spy.getCall(1).args[0], collection[1]);
    test.equal(this.spy.getCall(2).args[0], collection[2]);

    test.done();
  },
};

Object.keys(Proximity.Controllers).forEach(controller => {

  // These are duplicates
  if (controller.startsWith("EVS_") ||
      controller.includes("MaxSonar") ||
      controller.startsWith("LIDAR")) {
    return;
  }

  exports[`Proximity - Controller, ${controller}`] = addControllerTest(
    Proximity, Proximity.Controllers[controller],
    { controller, pin: 1 }
  );
});

// - GP2Y0A21YK
//     https://www.sparkfun.com/products/242
// - GP2D120XJ00F
//     https://www.sparkfun.com/products/8959
// - GP2Y0A02YK0F
//     https://www.sparkfun.com/products/8958
// - GP2Y0A41SK0F
//     https://www.sparkfun.com/products/12728
