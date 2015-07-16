var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Motion = five.Motion;

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

exports["Motion"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.digitalRead = sinon.spy(MockFirmata.prototype, "digitalRead");
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.instance.length);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motion[property.name], "undefined");
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);

    test.ok(this.motion instanceof events.EventEmitter);

    test.done();
  }
};

exports["Motion - PIR"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.digitalRead = sinon.spy(MockFirmata.prototype, "digitalRead");
    this.motion = new Motion({
      pin: 7,
      calibrationDelay: 10,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  calibrated: function(test) {
    test.expect(1);
    var spy = sinon.spy();

    this.motion.on("calibrated", spy);
    this.clock.tick(10);
    test.ok(spy.calledOnce);
    test.done();
  },

  data: function(test) {
    test.expect(1);
    var spy = sinon.spy();

    this.motion.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  change: function(test) {
    test.expect(1);
    var spy = sinon.spy();
    var callback = this.digitalRead.firstCall.args[1];

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

  noChange: function(test) {
    test.expect(1);
    var spy = sinon.spy();
    var callback = this.digitalRead.firstCall.args[1];

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

  motionstart: function(test) {
    var spy = sinon.spy();
    var callback = this.digitalRead.firstCall.args[1];


    test.expect(1);
    this.motion.on("motionstart", spy);

    // 0 then changes to 1
    callback(0);
    callback(1);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  },

  motionend: function(test) {
    var spy = sinon.spy();
    var callback = this.digitalRead.firstCall.args[1];

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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cWriteReg = sinon.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.motion = new Motion({
      controller: "GP2Y0D805Z0F",
      calibrationDelay: 10,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Motion({
      controller: "GP2Y0D805Z0F",
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

  initialize: function(test) {
    test.expect(8);

    test.ok(this.i2cConfig.called);
    test.ok(this.i2cWriteReg.calledOnce);
    test.ok(this.i2cWrite.calledOnce);
    test.ok(this.i2cRead.calledOnce);

    test.deepEqual(this.i2cWriteReg.firstCall.args, [ 0x26, 0x03, 0xFE ]);
    test.deepEqual(this.i2cWrite.firstCall.args, [0x26, [0x00]]);

    test.equal(this.i2cRead.firstCall.args[0], 0x26);
    test.equal(this.i2cRead.firstCall.args[1], 1);
    test.done();
  },

  calibrated: function(test) {
    var spy = sinon.spy();
    test.expect(1);
    this.motion.on("calibrated", spy);
    this.clock.tick(10);
    test.ok(spy.calledOnce);
    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);
    this.motion.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  change: function(test) {
    var spy = sinon.spy();
    var callback = this.i2cRead.firstCall.args[2];
    test.expect(1);
    this.motion.on("change", spy);
    callback([0x00]);
    this.clock.tick(25);
    callback([0x03]);
    this.clock.tick(25);

    test.ok(spy.calledTwice);
    test.done();
  },

  noChange: function(test) {
    test.expect(1);
    var spy = sinon.spy();
    var callback = this.i2cRead.firstCall.args[2];
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

  motionstart: function(test) {

    // this.clock.tick(250);
    var spy = sinon.spy();
    var callback = this.i2cRead.firstCall.args[2];

    test.expect(1);
    this.motion.on("motionstart", spy);

    callback([3]);
    callback([1]);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  },

  motionend: function(test) {

    // this.clock.tick(250);
    var spy = sinon.spy();
    var callback = this.i2cRead.firstCall.args[2];

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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.pinMode = sinon.spy(MockFirmata.prototype, "pinMode");
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.motion = new Motion({
      controller: "GP2Y0D810Z0F",
      pin: "A0",
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  initialize: function(test) {
    test.expect(2);

    test.ok(this.pinMode.calledOnce);
    test.ok(this.analogRead.calledOnce);
    test.done();
  },

  calibrated: function(test) {
    var spy = sinon.spy();
    test.expect(1);
    this.motion.on("calibrated", spy);
    this.clock.tick(10);
    test.ok(spy.calledOnce);
    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);
    this.motion.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  change: function(test) {
    var spy = sinon.spy();
    var callback = this.analogRead.firstCall.args[1];
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

  noChange: function(test) {
    test.expect(1);
    var spy = sinon.spy();
    var callback = this.analogRead.firstCall.args[1];
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

  motionstart: function(test) {
    var spy = sinon.spy();
    var callback = this.analogRead.firstCall.args[1];

    test.expect(1);
    this.motion.on("motionstart", spy);

    callback(100);
    this.clock.tick(25);
    callback(1023);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  },

  motionend: function(test) {

    // this.clock.tick(250);
    var spy = sinon.spy();
    var callback = this.analogRead.firstCall.args[1];

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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.pinMode = sinon.spy(MockFirmata.prototype, "pinMode");
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.motion = new Motion({
      controller: "GP2Y0A60SZLF",
      pin: "A0",
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  initialize: function(test) {
    test.expect(2);

    test.ok(this.pinMode.calledOnce);
    test.ok(this.analogRead.calledOnce);
    test.done();
  },

  calibrated: function(test) {
    var spy = sinon.spy();
    test.expect(1);
    this.motion.on("calibrated", spy);
    this.clock.tick(10);
    test.ok(spy.calledOnce);
    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);
    this.motion.on("data", spy);
    this.clock.tick(25);
    test.ok(spy.calledOnce);
    test.done();
  },

  change: function(test) {
    var spy = sinon.spy();
    var callback = this.analogRead.firstCall.args[1];
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

  noChange: function(test) {
    test.expect(1);
    var spy = sinon.spy();
    var callback = this.analogRead.firstCall.args[1];
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

  motionstart: function(test) {
    var spy = sinon.spy();
    var callback = this.analogRead.firstCall.args[1];

    test.expect(1);
    this.motion.on("motionstart", spy);

    callback(1023);
    this.clock.tick(25);
    callback(100);
    this.clock.tick(25);

    test.ok(spy.calledOnce);
    test.done();
  },

  motionend: function(test) {

    // this.clock.tick(250);
    var spy = sinon.spy();
    var callback = this.analogRead.firstCall.args[1];

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
