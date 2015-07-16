var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  ESC = five.ESC;

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

exports["ESC"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.servoWrite = sinon.spy(MockFirmata.prototype, "servoWrite");
    this.board = newBoard();


    this.esc = new ESC({
      pin: 12,
      board: this.board
    });


    this.proto = [{
      name: "speed"
    }, {
      name: "forward"
    }, {
      name: "reverse"
    }, {
      name: "brake"
    }];

    this.instance = [{
      name: "id"
    }, {
      name: "pin"
    }, {
      name: "range"
    }, {
      name: "pwmRange"
    }, {
      name: "interval"
    }, {
      name: "startAt"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.esc[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.esc[property.name], "undefined");
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);

    test.ok(this.esc instanceof events.EventEmitter);

    test.done();
  },

  startAt: function(test) {
    test.expect(2);

    this.spy = sinon.spy(ESC.prototype, "speed");
    this.servoWrite.reset();

    this.esc = new ESC({
      pin: 12,
      board: this.board,
      startAt: 1
    });

    test.ok(this.spy.called);
    this.clock.tick(10);

    test.equal(this.servoWrite.callCount, 1);
    test.done();
  },

  speed: function(test) {
    test.expect(6);

    this.esc.speed(1);
    this.esc.speed(10);
    this.clock.tick(120);
    test.equal(this.servoWrite.callCount, 10);
    // (10 * 180 / 100) | 0 = 18
    test.equal(this.servoWrite.lastCall.args[1], 18);

    this.servoWrite.reset();

    this.esc.speed(9);
    this.clock.tick(10);
    test.equal(this.servoWrite.callCount, 1);
    // (9 * 180 / 100) = 16.2
    test.equal(this.servoWrite.lastCall.args[1], 16.2);

    this.servoWrite.reset();

    this.esc.speed(12);
    this.clock.tick(30);
    test.equal(this.servoWrite.callCount, 3);
    // (12 * 180 / 100) = 21.6
    test.equal(this.servoWrite.lastCall.args[1], 21.6);

    test.done();
  },
  constrainSpeed: function(test) {
    test.expect(2);

    this.esc.speed(1);
    this.esc.speed(1000);
    this.clock.tick(1000);

    // 100 steps, not 1000
    test.equal(this.servoWrite.callCount, 100);
    test.equal(this.esc.value, 100);

    test.done();
  },

  speedIgnoresDupCommand: function(test) {
    test.expect(1);

    var intervalId;

    this.esc.speed(1);
    this.esc.speed(50);
    this.clock.tick(10);
    intervalId = this.esc.interval;

    this.esc.speed(50);
    this.clock.tick(10);

    // When receiving a duplicate, the in-progress
    // interval will not be interrupted.
    test.equal(intervalId, this.esc.interval);

    test.done();
  },

  speedInterruptsInterval: function(test) {
    test.expect(1);

    var intervalId;

    this.esc.speed(1);
    this.esc.speed(50);
    this.clock.tick(10);
    intervalId = this.esc.interval;

    this.esc.speed(60);
    this.clock.tick(10);

    // When receiving a unique speed, the in-progress
    // interval will be interrupted.
    test.notEqual(intervalId, this.esc.interval);

    test.done();
  },

  range: function(test) {
    test.expect(2);

    this.esc.range[0] = 50;
    this.esc.range[1] = 60;

    this.esc.speed(40);
    // constrained to the lower range boundary
    test.equal(this.esc.value, 50);

    this.esc.speed(70);
    // constrained to the upper range boundary
    test.equal(this.esc.value, 60);

    test.done();
  },

  bailout: function(test) {
    test.expect(4);

    this.esc.speed(1);
    this.esc.speed(10);
    this.clock.tick(10);
    test.equal(this.esc.last.speed, 10);
    test.equal(this.servoWrite.args.length, 10);

    this.esc.speed(0);
    this.clock.tick(10);
    test.equal(this.esc.last.speed, 0);
    test.equal(this.servoWrite.args.length, 20);

    test.done();
  },

  accelerateDecelerate: function(test) {
    test.expect(4);

    this.esc.speed(1);
    this.esc.speed(10);
    this.clock.tick(100);
    test.equal(this.esc.last.speed, 10);
    test.equal(this.servoWrite.args.length, 10);

    this.esc.speed(0);
    this.clock.tick(100);
    test.equal(this.esc.last.speed, 0);
    test.equal(this.servoWrite.args.length, 20);

    test.done();
  },
};


exports["ESC - PCA9685"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.board = newBoard();

    this.esc = new ESC({
      pin: 0,
      board: this.board,
      controller: "PCA9685",
      address: 0x40
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

    new ESC({
      controller: "PCA9685",
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

  withAddress: function(test) {
    test.expect(1);

    var esc = new ESC({
      pin: 0,
      board: this.board,
      controller: "PCA9685",
      address: 0x40
    });

    test.notEqual(esc.board.Drivers[0x40], undefined);
    test.done();
  },

  withoutAddress: function(test) {
    test.expect(1);

    var esc = new ESC({
      pin: 0,
      board: this.board,
      controller: "PCA9685"
    });

    test.notEqual(esc.board.Drivers[0x40], undefined);
    test.done();
  },
  speed: function(test) {
    test.expect(6);
    this.i2cWrite.reset();

    this.esc.speed(10);
    this.clock.tick(1);

    test.equal(this.i2cWrite.args[0][0], 0x40);
    test.equal(this.i2cWrite.args[0][1][0], 6);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 182);
    test.equal(this.i2cWrite.args[0][1][4], 0);

    test.done();
  }
};


exports["ESC - FORWARD_REVERSE"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.board = newBoard();
    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  missingNeutralThrows: function(test) {
    test.expect(1);

    test.throws(function() {
      new ESC({
        device: "FORWARD_REVERSE",
        pin: 11,
        board: this.board
      }.bind(this));
    }.bind(this));

    test.done();
  },
  neutralStartAt: function(test) {
    test.expect(2);

    var spy = sinon.spy(ESC.prototype, "speed");
    var esc = new ESC({
      device: "FORWARD_REVERSE",
      neutral: 50,
      pin: 11,
      board: this.board,
    });

    test.ok(spy.calledOnce);
    test.equal(esc.startAt, 50);

    spy.restore();

    test.done();
  },
  forward: function(test) {
    test.expect(4);

    var spy = sinon.spy(ESC.prototype, "speed");
    var esc = new ESC({
      device: "FORWARD_REVERSE",
      neutral: 50,
      pin: 11,
      board: this.board,
    });

    spy.reset();

    esc.forward(100);

    test.ok(spy.calledOnce);
    test.equal(spy.getCall(0).args[0], 100);

    esc.forward(0);

    test.ok(spy.calledTwice);
    test.equal(spy.getCall(1).args[0], 50);

    spy.restore();
    test.done();
  },
  reverse: function(test) {
    test.expect(4);

    var spy = sinon.spy(ESC.prototype, "speed");
    var esc = new ESC({
      device: "FORWARD_REVERSE",
      neutral: 50,
      pin: 11,
      board: this.board,
    });

    spy.reset();

    esc.reverse(100);

    test.ok(spy.calledOnce);
    test.equal(spy.getCall(0).args[0], 0);

    esc.reverse(0);

    test.ok(spy.calledTwice);
    test.equal(spy.getCall(1).args[0], 50);

    spy.restore();
    test.done();
  },
  brake: function(test) {
    test.expect(3);

    var esc = new ESC({
      device: "FORWARD_REVERSE",
      neutral: 50,
      pin: 11,
      board: this.board,
    });

    var spy = sinon.spy(esc, "write");

    esc.forward(1);
    spy.reset();
    esc.brake();

    test.ok(spy.calledOnce);
    test.equal(spy.getCall(0).args[0], 11);
    test.equal(spy.getCall(0).args[1], 90);

    spy.restore();
    test.done();
  },
};

exports["ESC.Array"] = {
  setUp: function(done) {
    this.board = newBoard();


    ESC.purge();

    this.a = new ESC({
      pin: 3,
      board: this.board
    });

    this.b = new ESC({
      pin: 6,
      board: this.board
    });

    this.c = new ESC({
      pin: 9,
      board: this.board
    });

    this.spies = [
      "speed",
      "brake",
    ];

    this.spies.forEach(function(method) {
      this[method] = sinon.spy(ESC.prototype, method);
    }.bind(this));

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  initFromESCNumbers: function(test) {
    test.expect(1);

    var escs = new ESC.Array([3, 6, 9]);

    test.equal(escs.length, 3);
    test.done();
  },

  initFromESCs: function(test) {
    test.expect(1);

    var escs = new ESC.Array([
      this.a, this.b, this.c
    ]);

    test.equal(escs.length, 3);
    test.done();
  },

  callForwarding: function(test) {
    test.expect(3);

    var escs = new ESC.Array([3, 6, 9]);

    escs.speed(100);

    test.equal(this.speed.callCount, escs.length);
    test.equal(this.speed.getCall(0).args[0], 100);

    escs.brake();

    test.equal(this.brake.callCount, escs.length);

    test.done();
  },

};
