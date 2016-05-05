// Global suite setUp
exports.setUp = function(done) {
  // Base Shape for all Temperature tests
  this.proto = [];
  this.instance = [{
    name: "relativeHumidity"
  }];

  this.board = newBoard();
  this.sandbox = sinon.sandbox.create();
  this.clock = this.sandbox.useFakeTimers();
  this.freq = 100;
  done();
};

function testShape(test) {
  test.expect(this.proto.length + this.instance.length);

  this.proto.forEach(function testProtoMethods(method) {
    test.equal(typeof this.hygrometer[method.name], "function", method.name);
  }, this);

  this.instance.forEach(function testInstanceProperties(property) {
    test.notEqual(typeof this.hygrometer[property.name], "undefined", property.name);
  }, this);

  test.done();
}

exports["Hygrometer -- SHT31D"] = {

  setUp: function(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.hygrometer = new Hygrometer({
      controller: "SHT31D",
      board: this.board,
      freq: 10
    });

    this.instance = [{
      name: "relativeHumidity"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  testShape: testShape,

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Hygrometer({
      controller: "SHT31D",
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
};

exports["Hygrometer -- HTU21D"] = {

  setUp: function(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.hygrometer = new Hygrometer({
      controller: "HTU21D",
      board: this.board,
      freq: 10
    });

    this.instance = [{
      name: "relativeHumidity"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  testShape: testShape,

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Hygrometer({
      controller: "HTU21D",
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

  data: function(test) {
    test.expect(8);
    var readOnce;
    var spy = this.sandbox.spy();

    this.hygrometer.on("data", spy);

    test.equal(this.i2cReadOnce.callCount, 1);
    test.equal(this.i2cReadOnce.lastCall.args[0], 0x40);
    test.equal(this.i2cReadOnce.lastCall.args[1], 0xE3);

    readOnce = this.i2cReadOnce.lastCall.args[3];
    readOnce([ 100, 76 ]);
    this.clock.tick(10);


    test.equal(this.i2cReadOnce.callCount, 2);
    test.equal(this.i2cReadOnce.lastCall.args[0], 0x40);
    test.equal(this.i2cReadOnce.lastCall.args[1], 0xE5);

    readOnce = this.i2cReadOnce.lastCall.args[3];
    readOnce([ 94, 6 ]);
    this.clock.tick(10);

    test.equal(spy.callCount, 1);
    test.equal(Math.round(this.hygrometer.relativeHumidity), 40);
    test.done();
  },

  change: function(test) {
    test.expect(5);

    var readOnce;
    var spy = this.sandbox.spy();

    this.hygrometer.on("change", spy);

    test.equal(this.i2cReadOnce.callCount, 1);
    test.equal(this.i2cReadOnce.lastCall.args[0], 0x40);
    test.equal(this.i2cReadOnce.lastCall.args[1], 0xE3);

    readOnce = this.i2cReadOnce.lastCall.args[3];
    readOnce([ 100, 136 ]);
    this.clock.tick(10);

    readOnce = this.i2cReadOnce.lastCall.args[3];
    readOnce([ 93, 202 ]);
    this.clock.tick(10);


    readOnce = this.i2cReadOnce.lastCall.args[3];
    readOnce([ 100, 76 ]);
    this.clock.tick(10);

    readOnce = this.i2cReadOnce.lastCall.args[3];
    readOnce([ 94, 6 ]);
    this.clock.tick(10);


    test.equal(spy.callCount, 2);
    test.equal(Math.round(this.hygrometer.relativeHumidity), 40);

    test.done();
  }

};


exports["Hygrometer -- SI7020"] = {

  setUp: function(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.hygrometer = new Hygrometer({
      controller: "SI7020",
      board: this.board,
      freq: 10
    });

    this.instance = [{
      name: "relativeHumidity"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  testShape: testShape,

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Hygrometer({
      controller: "SI7020",
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

  data: function(test) {
    test.expect(4);

    test.equal(this.i2cRead.callCount, 2);
    test.deepEqual(this.i2cRead.lastCall.args.slice(0, 3), [
      0x40, // address
      0xE5, // register
      2, // data length
    ]);


    var spy = this.sandbox.spy();
    var read = this.i2cRead.lastCall.args[3];

    this.hygrometer.on("data", spy);

    read([0x6F, 0xFF, 0x00]); // humidity

    this.clock.tick(10);

    test.ok(spy.calledOnce);
    test.equal(Math.round(spy.args[0][0].relativeHumidity), 49);

    test.done();
  },

  change: function(test) {
    test.expect(4);

    test.equal(this.i2cRead.callCount, 2);
    test.deepEqual(this.i2cRead.lastCall.args.slice(0, 3), [
      0x40, // address
      0xE5, // register
      2, // data length
    ]);


    var spy = this.sandbox.spy();
    var read = this.i2cRead.lastCall.args[3];

    this.hygrometer.on("change", spy);

    read([0x6F, 0xFF, 0x6F, 0xFF]); // humidity
    this.clock.tick(10);

    read = this.i2cRead.lastCall.args[3];
    read([0x6F, 0xFF, 0x00]); // temperature
    read = this.i2cRead.lastCall.args[3];
    read([0x6F, 0xFF, 0x00]); // humidity -- same
    this.clock.tick(10);

    read = this.i2cRead.lastCall.args[3];
    read([0x6F, 0xFF, 0x00]); // temperature
    read = this.i2cRead.lastCall.args[3];
    read([0x40, 0x00, 0x00]); // humidity -- different --

    this.clock.tick(10);

    test.equal(spy.callCount, 2);
    test.equal(Math.round(spy.lastCall.args[0].relativeHumidity), 25);

    test.done();
  }
};
