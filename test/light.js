require("./common/bootstrap");

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
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.light = new Light({
      pin: "A1",
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

exports["Light: ALSPT19"] = {
  setUp: function(done) {
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

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
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
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evswrite = this.sandbox.spy(EVS.prototype, "write");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
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
    this.sandbox.restore();
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

    test.deepEqual(this.evssetup.lastCall.args, [shield, EVS.Type_EV3]);
    test.deepEqual(this.evswrite.lastCall.args, [shield, 0x81 + shield.offset, EVS.Type_EV3_LIGHT]);

    test.done();
  },

  data: function(test) {
    var spy = this.sandbox.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = this.sandbox.spy();
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
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evswrite = this.sandbox.spy(EVS.prototype, "write");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
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
    this.sandbox.restore();
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

    test.deepEqual(this.evssetup.lastCall.args, [shield, EVS.Type_EV3]);
    test.deepEqual(this.evswrite.lastCall.args, [shield, 0x81 + shield.offset, EVS.Type_EV3_LIGHT_REFLECTED]);

    test.done();
  },

  data: function(test) {
    var spy = this.sandbox.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = this.sandbox.spy();
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
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evswrite = this.sandbox.spy(EVS.prototype, "write");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
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
    this.sandbox.restore();
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

    test.deepEqual(this.evssetup.lastCall.args, [shield, EVS.Type_NXT_LIGHT]);

    test.done();
  },

  data: function(test) {
    var spy = this.sandbox.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = this.sandbox.spy();
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
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evswrite = this.sandbox.spy(EVS.prototype, "write");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.stub(MockFirmata.prototype, "i2cRead", function(address, register, numBytes, callback) {
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
    this.sandbox.restore();
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

    test.deepEqual(this.evssetup.lastCall.args, [shield, EVS.Type_NXT_LIGHT_REFLECTED]);

    test.done();
  },

  data: function(test) {
    var spy = this.sandbox.spy();
    test.expect(1);

    this.light.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.light.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = this.sandbox.spy();
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

Object.keys(Light.Controllers).forEach(function(name) {
  // These are duplicates
  if (name.startsWith("EVS_") || name.includes("MaxSonar") || name.startsWith("LIDAR")) {
    return;
  }

  exports["Light - Controller, " + name] = addControllerTest(Light, Light.Controllers[name], {
    controller: name,
  });
});
