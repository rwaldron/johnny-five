require("./common/bootstrap");

exports["ESC"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.servoWrite = this.sandbox.spy(MockFirmata.prototype, "servoWrite");
    this.board = newBoard();

    this.esc = new ESC({
      pin: 12,
      board: this.board
    });

    this.proto = [{
      name: "throttle"
    }, {
      name: "brake"
    }];

    this.instance = [{
      name: "id"
    }, {
      name: "pin"
    }, {
      name: "pwmRange"
    }, {
      name: "device"
    }, {
      name: "neutral"
    }];

    process.noDeprecation = true;
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    process.noDeprecation = false;
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

  throttlePercent(test) {
    test.expect(1001);
    this.i2cWrite.reset();

    this.esc = new ESC({
      pin: 0,
      board: this.board,
    });

    this.sandbox.spy(this.esc, "update");

    for (let i = 0; i <= 1000; i++) {
      let percent = i / 10;
      let pulse = i + 1000;

      this.esc.throttle(percent);

      test.equal(this.esc.update.lastCall.args[0], pulse);
    }
    test.done();
  },

  throttlePulse(test) {
    test.expect(1001);
    this.i2cWrite.reset();

    this.esc = new ESC({
      pin: 0,
      board: this.board,
    });

    this.sandbox.spy(this.esc, "update");

    for (let i = 0; i <= 1000; i++) {
      let pulse = i + 1000;

      this.esc.throttle(pulse);

      test.equal(this.esc.update.lastCall.args[0], pulse);
    }
    test.done();
  }
};


exports["ESC - PCA9685"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.normalize = this.sandbox.spy(Board.Pins, "normalize");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.board = newBoard();

    this.esc = new ESC({
      pin: 0,
      board: this.board,
      controller: "PCA9685",
      address: 0x40,
      device: "FORWARD"
    });

    process.noDeprecation = true;
    done();
  },

  tearDown: function(done) {
    Board.purge();
    Expander.purge();
    this.sandbox.restore();

    process.noDeprecation = false;
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

    new ESC({
      pin: 1,
      board: this.board,
      controller: "PCA9685",
      address: 0x41
    });

    test.equal(Expander.byAddress(0x41).name, "PCA9685");
    test.done();
  },

  withoutAddress: function(test) {
    test.expect(2);

    Expander.purge();

    // Assert there is not another by the default address
    test.equal(Expander.byAddress(0x40), undefined);

    new ESC({
      pin: 1,
      board: this.board,
      controller: "PCA9685"
    });

    test.equal(Expander.byAddress(0x40).name, "PCA9685");

    test.done();
  },

  defaultFrequency: function(test) {
    test.expect(1);
    test.equal(this.esc.frequency, 50);
    test.done();
  },

  customFrequency: function(test) {
    test.expect(1);

    this.esc = new ESC({
      frequency: 60,
      pin: 0,
      controller: "PCA9685",
      board: this.board
    });

    test.equal(this.esc.frequency, 60);
    test.done();
  },

  noNormalization: function(test) {
    test.expect(1);
    test.equal(this.normalize.callCount, 0);
    test.done();
  },
};


exports["ESC - FORWARD_REVERSE"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.throttle = this.sandbox.spy(ESC.prototype, "throttle");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  neutralComputedByDefault: function(test) {
    test.expect(1);

    var esc = new ESC({
      device: "FORWARD_REVERSE",
      pin: 11,
      board: this.board
    });

    test.equal(esc.neutral, 1500);
    test.done();
  },

  neutralSameAsRangeLowInvalid: function(test) {
    test.expect(1);

    test.throws(function() {
      new ESC({
        neutral: 1000,
        device: "FORWARD_REVERSE",
        pin: 11,
        board: this.board
      });
    }.bind(this));

    test.done();
  },

  neutralSameAsRangeLowInvalidFor: function(test) {
    test.expect(1);

    test.doesNotThrow(function() {
      new ESC({
        neutral: 1000,
        device: "FORWARD",
        pin: 11,
        board: this.board
      });
    }.bind(this));

    test.done();
  },

};

exports["ESC - FORWARD"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.throttle = this.sandbox.spy(ESC.prototype, "throttle");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  neutralComputedByDefault: function(test) {
    test.expect(1);

    var esc = new ESC({
      device: "FORWARD",
      pin: 11,
      board: this.board
    });

    test.equal(esc.neutral, 1000);
    test.done();
  },

  neutralSameAsRangeLow: function(test) {
    test.expect(1);

    test.doesNotThrow(function() {
      new ESC({
        neutral: 1000,
        device: "FORWARD",
        pin: 11,
        board: this.board
      });
    }.bind(this));

    test.done();
  },
};

exports["ESC.Collection"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

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
      "throttle",
      "brake",
    ];

    this.spies.forEach(method => {
      this[method] = this.sandbox.spy(ESC.prototype, method);
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  initFromESCNumbers: function(test) {
    test.expect(1);

    var escs = new ESC.Collection([3, 6, 9]);

    test.equal(escs.length, 3);
    test.done();
  },

  initFromESCs: function(test) {
    test.expect(1);

    var escs = new ESC.Collection([
      this.a, this.b, this.c
    ]);

    test.equal(escs.length, 3);
    test.done();
  },

  callForwarding: function(test) {
    test.expect(2);

    var escs = new ESC.Collection([3, 6, 9]);
    var calls = escs.length * 2;

    // 1 call each in the constructor
    // 1 call each per ESC

    escs.throttle(100);

    test.equal(this.throttle.callCount, calls);

    escs.brake();

    test.equal(this.brake.callCount, escs.length);

    test.done();
  },

};
