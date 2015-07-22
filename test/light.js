var sinon = require("sinon");
var Emitter = require("events").EventEmitter;
var MockFirmata = require("./util/mock-firmata");
var EVS = require("../lib/evshield");
var five = require("../lib/johnny-five");
var Board = five.Board;
var Light = five.Light;

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

var proto = [{
  name: "within"
}];

var instance = [{
  name: "value"
}, {
  name: "level"
}];

exports["Light"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.light = new Light({
      pin: "A1",
      freq: 100,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.light[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.light[property.name], 0);
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);
    test.ok(this.light instanceof Emitter);
    test.done();
  }
};

exports["Light: EVS_EV3, Ambient (Default)"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();

    this.evssetup = sinon.spy(EVS.prototype, "setup");
    this.evswrite = sinon.spy(EVS.prototype, "write");
    this.evsread = sinon.spy(EVS.prototype, "read");

    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.light[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.light[property.name], 0);
    }, this);

    test.done();
  },

  initialization: function(test) {
    test.expect(2);

    var shield = {
      address: 26,
      analog: 112,
      bank: "a",
      mode: 111,
      motor: undefined,
      offset: 0,
      port: 1,
      sensor: 1
    };

    test.deepEqual(this.evssetup.lastCall.args, [ shield, EVS.Type_EV3 ]);
    test.deepEqual(this.evswrite.lastCall.args, [ shield, 0x81 + shield.offset, EVS.Type_EV3_LIGHT ]);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = sinon.spy();
    test.expect(2);

    this.clock.tick(250);

    this.light.within([10, 20], "level", function() {
      test.equal(this.level, 15);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Light: EVS_EV3, Reflected"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();

    this.evssetup = sinon.spy(EVS.prototype, "setup");
    this.evswrite = sinon.spy(EVS.prototype, "write");
    this.evsread = sinon.spy(EVS.prototype, "read");

    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.light[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.light[property.name], 0);
    }, this);

    test.done();
  },

  initialization: function(test) {
    test.expect(2);

    var shield = {
      address: 26,
      analog: 112,
      bank: "a",
      mode: 111,
      motor: undefined,
      offset: 0,
      port: 1,
      sensor: 1
    };

    test.deepEqual(this.evssetup.lastCall.args, [ shield, EVS.Type_EV3 ]);
    test.deepEqual(this.evswrite.lastCall.args, [ shield, 0x81 + shield.offset, EVS.Type_EV3_LIGHT_REFLECTED ]);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = sinon.spy();
    test.expect(2);

    this.clock.tick(250);

    this.light.within([10, 20], "level", function() {
      test.equal(this.level, 15);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Light: EVS_NXT, Ambient (Default)"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();

    this.evssetup = sinon.spy(EVS.prototype, "setup");
    this.evswrite = sinon.spy(EVS.prototype, "write");
    this.evsread = sinon.spy(EVS.prototype, "read");

    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.light[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.light[property.name], 0);
    }, this);

    test.done();
  },

  initialization: function(test) {
    test.expect(1);

    var shield = {
      address: 26,
      analog: 112,
      bank: "a",
      mode: 111,
      motor: undefined,
      offset: 0,
      port: 1,
      sensor: 1
    };

    test.deepEqual(this.evssetup.lastCall.args, [ shield, EVS.Type_NXT_LIGHT ]);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = sinon.spy();
    test.expect(2);

    this.clock.tick(250);

    this.light.within([10, 20], "level", function() {
      test.equal(this.level, 15);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Light: EVS_NXT, Reflected"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();

    this.evssetup = sinon.spy(EVS.prototype, "setup");
    this.evswrite = sinon.spy(EVS.prototype, "write");
    this.evsread = sinon.spy(EVS.prototype, "read");

    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.light[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.light[property.name], 0);
    }, this);

    test.done();
  },

  initialization: function(test) {
    test.expect(1);

    var shield = {
      address: 26,
      analog: 112,
      bank: "a",
      mode: 111,
      motor: undefined,
      offset: 0,
      port: 1,
      sensor: 1
    };

    test.deepEqual(this.evssetup.lastCall.args, [ shield, EVS.Type_NXT_LIGHT_REFLECTED ]);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = sinon.spy();
    test.expect(2);

    this.clock.tick(250);

    this.light.within([10, 20], "level", function() {
      test.equal(this.level, 15);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};
