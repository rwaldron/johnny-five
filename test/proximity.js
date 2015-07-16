var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Proximity = five.Proximity;

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

exports["Proximity"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2Y0A21YK",
      pin: "A1",
      freq: 100,
      board: this.board
    });

    this.instance = [{
      name: "centimeters"
    }, {
      name: "inches"
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
      test.notEqual(typeof this.proximity[property.name], "undefined");
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);
    test.ok(this.proximity instanceof events.EventEmitter);
    test.done();
  }
};

exports["Proximity: GP2Y0A21YK"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2Y0A21YK",
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

  GP2Y0A21YK: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    // 154 is an actual reading at ~14.5"
    callback(154);

    test.equals(Math.round(this.proximity.centimeters), 38);
    test.equals(Math.round(this.proximity.cm), 38);
    test.equals(Math.round(this.proximity.inches), 15);
    test.equals(Math.round(this.proximity.in), 15);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    var spy = sinon.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var callback = this.analogRead.args[0][1];
    var spy = sinon.spy();
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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2D120XJ00F",
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

  GP2D120XJ00F: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);
    // 70 is an actual reading at ~14.5"
    callback(70);

    test.equals(Math.round(this.proximity.centimeters), 38);
    test.equals(Math.round(this.proximity.cm), 38);
    test.equals(Math.round(this.proximity.inches), 15);
    test.equals(Math.round(this.proximity.in), 15);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    var spy = sinon.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var callback = this.analogRead.args[0][1];
    var spy = sinon.spy();
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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2Y0A02YK0F",
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

  GP2Y0A02YK0F: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    // 325 is an actual reading at ~14.5"
    callback(325);

    test.equals(Math.round(this.proximity.centimeters), 38);
    test.equals(Math.round(this.proximity.cm), 38);
    test.equals(Math.round(this.proximity.inches), 15);
    test.equals(Math.round(this.proximity.in), 15);

    test.done();
  },
  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    var spy = sinon.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var callback = this.analogRead.args[0][1];
    var spy = sinon.spy();
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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2Y0A41SK0F",
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

  GP2Y0A41SK0F: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    // 325 is an actual reading at ~2.5"
    callback(325);

    test.equals(Math.round(this.proximity.centimeters), 7);
    test.equals(Math.round(this.proximity.cm), 7);
    test.equals(Math.round(this.proximity.inches), 3);
    test.equals(Math.round(this.proximity.in), 3);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    var spy = sinon.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var callback = this.analogRead.args[0][1];
    var spy = sinon.spy();
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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "GP2Y0A710K0F",
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

  GP2Y0A41SK0F: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    callback(500);

    test.equals(Math.round(this.proximity.centimeters), 87);
    test.equals(Math.round(this.proximity.cm), 87);
    test.equals(Math.round(this.proximity.inches), 34);
    test.equals(Math.round(this.proximity.in), 34);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    var spy = sinon.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var callback = this.analogRead.args[0][1];
    var spy = sinon.spy();
    test.expect(2);

    callback(500);
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      test.equal(this.inches, 33.85);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: MB1000"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "MB1000",
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

  MB1000: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    // (500 / 2) * 2.54 = 635cm
    callback(500);

    test.equals(Math.round(this.proximity.centimeters), 635);
    test.equals(Math.round(this.proximity.cm), 635);
    test.equals(Math.round(this.proximity.inches), 248);
    test.equals(Math.round(this.proximity.in), 248);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    var spy = sinon.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var callback = this.analogRead.args[0][1];
    var spy = sinon.spy();
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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "MB1010",
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

  MB1010: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    // (500 / 2) * 2.54 = 635cm
    callback(500);

    test.equals(Math.round(this.proximity.centimeters), 635);
    test.equals(Math.round(this.proximity.cm), 635);
    test.equals(Math.round(this.proximity.inches), 248);
    test.equals(Math.round(this.proximity.in), 248);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    var spy = sinon.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var callback = this.analogRead.args[0][1];
    var spy = sinon.spy();
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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "MB1003",
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

  MB1003: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    // 500 is an actual reading at ~250cm
    callback(500);

    test.equals(Math.round(this.proximity.centimeters), 250);
    test.equals(Math.round(this.proximity.cm), 250);
    test.equals(Math.round(this.proximity.inches), 98);
    test.equals(Math.round(this.proximity.in), 98);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    callback(250);

    var spy = sinon.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var callback = this.analogRead.args[0][1];
    var spy = sinon.spy();
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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.proximity = new Proximity({
      controller: "MB1230",
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

  MB1230: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    callback(250);

    test.equals(Math.round(this.proximity.centimeters), 250);
    test.equals(Math.round(this.proximity.cm), 250);
    test.equals(Math.round(this.proximity.inches), 98);
    test.equals(Math.round(this.proximity.in), 98);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(1);

    // 250 is an actual reading at ~250cm
    callback(250);

    var spy = sinon.spy();

    this.proximity.on("change", spy);
    this.clock.tick(100);
    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var callback = this.analogRead.args[0][1];
    var spy = sinon.spy();
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

  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.i2cReadOnce = sinon.spy(MockFirmata.prototype, "i2cReadOnce");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");

    this.proximity = new Proximity({
      controller: "SRF10",
      board: this.board
    });

    this.proto = [{
      name: "within"
    }];

    this.instance = [{
      name: "centimeters"
    }, {
      name: "cm"
    },{
      name: "inches"
    }, {
      name: "in"
    }];

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

    new Proximity({
      controller: "SRF10",
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

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.proximity[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.proximity[property.name], 0);
    }, this);

    test.done();
  },

  initialize: function(test) {
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

  data: function(test) {
    test.expect(2);

    this.clock.tick(100);

    var callback = this.i2cReadOnce.args[0][2],
      spy = sinon.spy();

    test.equal(spy.callCount, 0);

    this.proximity.on("data", spy);

    callback([3, 225]);
    callback([3, 255]);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  change: function(test) {
    this.clock.tick(100);

    var callback = this.i2cReadOnce.args[0][2],
      spy = sinon.spy();

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

  within_unit: function(test) {
    this.clock.tick(65);

    var callback = this.i2cReadOnce.args[0][2];
    var called = false;

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
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.pulseVal = 1000;

    sinon.stub(MockFirmata.prototype, "pingRead", function(settings, handler) {
      handler(this.pulseVal);
    }.bind(this));

    this.proximity = new Proximity({
      controller: "HCSR04",
      pin: 7,
      freq: 100,
      board: this.board
    });

    this.proto = [{
      name: "within"
    }];

    this.instance = [{
      name: "centimeters"
    }, {
      name: "cm"
    },{
      name: "inches"
    }, {
      name: "in"
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
      test.equal(typeof this.proximity[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.proximity[property.name], 0);
    }, this);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    // tick the clock forward to trigger the pingRead handler
    this.clock.tick(250);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  },

  change: function(test) {
    var spy = sinon.spy();
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

  within: function(test) {
    var spy = sinon.spy();
    test.expect(2);

    // tick the clock forward to trigger the pingRead handler
    this.clock.tick(250);

    this.proximity.within([0, 120], "inches", function() {
      // The fake microseconds value is 1000, which
      // calculates to 6.76 inches.
      test.equal(this.inches, 6.7);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};

exports["Proximity: LIDARLITE"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cReadOnce = sinon.stub(MockFirmata.prototype, "i2cReadOnce", function(ADDRESS, READREGISTER, BYTES_TO_READ, callback) {
      var cm = 15;

      // Split to HIGH and LOW
      callback([ cm >> 8, cm & 0xff ]);
    });

    this.proximity = new Proximity({
      controller: "LIDARLITE",
      freq: 100,
      board: this.board
    });

    this.proto = [{
      name: "within"
    }];

    this.instance = [{
      name: "centimeters"
    }, {
      name: "cm"
    },{
      name: "inches"
    }, {
      name: "in"
    }];

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

    new Proximity({
      controller: "LIDARLITE",
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

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.proximity[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.proximity[property.name], 0);
    }, this);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    this.proximity.on("data", spy);
    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    test.done();
  },

  change: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.proximity.on("change", spy);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within: function(test) {
    var spy = sinon.spy();
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
// - GP2Y0A21YK
//     https://www.sparkfun.com/products/242
// - GP2D120XJ00F
//     https://www.sparkfun.com/products/8959
// - GP2Y0A02YK0F
//     https://www.sparkfun.com/products/8958
// - GP2Y0A41SK0F
//     https://www.sparkfun.com/products/12728
