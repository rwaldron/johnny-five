var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata,
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Thermometer = five.Thermometer;

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

// Global suite setUp
exports.setUp = function(done) {
  // Base Shape for all Thermometer tests
  this.proto = [];
  this.instance = [{
    name: "celsius"
  }, {
    name: "fahrenheit"
  }, {
    name: "kelvin"
  }, {
    name: "C"
  }, {
    name: "F"
  }, {
    name: "K"
  }];

  this.board = newBoard();
  this.sandbox = sinon.sandbox.create();
  this.clock = sinon.useFakeTimers();
  this.freq = 100;

  done();
};

exports.tearDown = function(done) {
  Board.purge();
  this.sandbox.restore();
  this.clock.restore();
  done();
};

function createAnalog(toCelsius) {
  return new Thermometer({
    pins: ["A0"],
    toCelsius: toCelsius,
    freq: this.freq,
    board: this.board
  });
}

function makeTestAnalogConversion(opts) {
  return function testAnalogConversion(test) {
    var spy = this.sandbox.spy();
    test.expect(15);
    if (opts.aref) {
      this.temperature.aref = opts.aref;
    }
    this.temperature.on("data", spy);
    this.analogRead.firstCall.yield(opts.raw);

    test.equal(spy.callCount, 0);
    test.equal(Math.round(this.temperature.C), opts.C, "temp.C");
    test.equal(Math.round(this.temperature.celsius), opts.C, "temp.celsius");
    test.equal(Math.round(this.temperature.K), opts.K, "temp.K");
    test.equal(Math.round(this.temperature.kelvin), opts.K, "temp.kelvin");
    test.equal(Math.round(this.temperature.F), opts.F, "temp.F");
    test.equal(Math.round(this.temperature.fahrenheit), opts.F, "temp.fahrenheit");

    this.clock.tick(this.freq);

    test.equal(spy.callCount, 1);

    var data = spy.firstCall.args[0];
    test.equal(Math.round(data.C), opts.C, "data.C");
    test.equal(Math.round(data.celsius), opts.C, "data.celsius");
    test.equal(Math.round(data.K), opts.K, "data.K");
    test.equal(Math.round(data.kelvin), opts.K, "data.kelvin");
    test.equal(Math.round(data.F), opts.F, "data.F");
    test.equal(Math.round(data.fahrenheit), opts.F, "data.fahrenheit");

    this.clock.tick(this.freq);

    test.equal(spy.callCount, 2);
    test.done();
  };
}

function testAnalogChange(test) {
  var raw = this.analogRead.firstCall.yield.bind(this.analogRead.firstCall),
    spy = this.sandbox.spy();

  test.expect(1);
  this.temperature.on("change", spy);

  raw(100);
  this.clock.tick(this.freq);

  raw(100);
  this.clock.tick(this.freq);

  raw(200);
  this.clock.tick(this.freq);

  raw(100);
  this.clock.tick(this.freq);

  raw(200);
  this.clock.tick(this.freq);

  raw(200);
  this.clock.tick(this.freq);

  test.equal(spy.callCount, 4);
  test.done();
}

function testShape(test) {
  test.expect(this.proto.length + this.instance.length);

  this.proto.forEach(function testProtoMethods(method) {
    test.equal(typeof this.temperature[method.name], "function", method.name);
  }, this);

  this.instance.forEach(function testInstanceProperties(property) {
    test.notEqual(typeof this.temperature[property.name], "undefined", property.name);
  }, this);

  test.done();
}

exports["Thermometer -- Temperature alias"] = {
  alias: function(test) {
    test.expect(1);
    test.equal(five.Temperature, five.Thermometer);
    test.done();
  }
};

exports["Thermometer -- ANALOG"] = {
  setUp: function(done) {
    this.analogRead = this.sandbox.stub(MockFirmata.prototype, "analogRead");
    this.analogRead.yields(0);
    this.proto.push({ name: "toCelsius" });

    done();
  },

  "picks aref from board.io": function(test) {
    this.board.io.aref = 3.3;
    this.temperature = createAnalog.call(this);
    test.expect(1);

    test.equal(this.temperature.aref, this.board.io.aref);
    test.done();
  },

  "picks aref from options": function(test) {
    this.board.io.aref = 3.3;
    this.temperature = new Thermometer({
      aref: 1.8,
      pins: ["A0"],
      freq: this.freq,
      board: this.board
    });
    test.expect(1);

    test.equal(this.temperature.aref, 1.8);
    test.done();
  },

  "no controller": {
    setUp: function(done) {
      this.temperature = createAnalog.call(this);
      done();
    },

    shape: testShape,
    change: testAnalogChange,

    rawData: makeTestAnalogConversion({
      raw: 50,
      C: 50,
      F: 122,
      K: 323
    }),
  },

  "custom toCelsius": {
    setUp: function(done) {
      this.toCelsius = this.sandbox.stub().returns(22);
      this.temperature = createAnalog.call(this, this.toCelsius);
      done();
    },
    shape: testShape,
    conversion: makeTestAnalogConversion({
      raw: 50,
      C: 22,
      F: 72,
      K: 295
    }),
    "raw doesnt matter": makeTestAnalogConversion({
      raw: 100,
      C: 22,
      F: 72,
      K: 295
    }),
    "toCelsius receives raw": function(test) {
      test.expect(6);
      this.analogRead.yield(10);
      test.equal(this.toCelsius.callCount, 0);

      test.equal(this.temperature.C, 22);
      test.equal(this.toCelsius.callCount, 1);
      test.equal(this.toCelsius.firstCall.args[0], 10);
      this.toCelsius.reset();

      this.analogRead.yield(100);
      test.equal(this.temperature.C, 22);
      test.equal(this.toCelsius.firstCall.args[0], 100);
      test.done();
    },
  },

  LM335: {
    setUp: function(done) {
      this.temperature = new Thermometer({
        controller: "LM335",
        pins: ["A0"],
        freq: 100,
        board: this.board
      });

      done();
    },
    shape: testShape,
    aref: makeTestAnalogConversion({
      aref: 3.3,
      raw: 950,
      C: 33,
      F: 91,
      K: 306
    }),
    data: makeTestAnalogConversion({
      raw: 100,
      C: -224,
      F: -372,
      K: 49,
    }),
    change: testAnalogChange,
  },
  LM35: {
    setUp: function(done) {
      this.temperature = new Thermometer({
        controller: "LM35",
        pins: ["A0"],
        freq: 100,
        board: this.board
      });

      done();
    },

    shape: testShape,
    aref: makeTestAnalogConversion({
      aref: 3.3,
      raw: 200,
      C: 64,
      F: 148,
      K: 338
    }),
    data: makeTestAnalogConversion({
      raw: 200,
      C: 98,
      F: 208,
      K: 371
    }),
    change: testAnalogChange,
  },

  TMP36: {
    setUp: function(done) {
      this.temperature = new Thermometer({
        controller: "TMP36",
        pins: ["A0"],
        freq: this.freq,
        board: this.board
      });
      done();
    },

    shape: testShape,
    change: testAnalogChange,

    aref: makeTestAnalogConversion({
      aref: 3.3,
      raw: 150,
      C: -2,
      F: 29,
      K: 271
    }),

    data: makeTestAnalogConversion({
      raw: 150,
      C: 23,
      F: 74,
      K: 296
    }),
  },

  TMP102: {
    setUp: function(done) {
      this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
      this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
      this.temperature = new Thermometer({
        controller: "TMP102",
        freq: this.freq,
        board: this.board
      });

      done();
    },

    tearDown: function(done) {
      Board.purge();
      this.sandbox.restore();
      done();
    },

    shape: testShape,

    value: function(test) {
      var raw = this.i2cRead.args[0][3];
      test.expect(1);

      raw([100, 100]);

      test.equals(this.temperature.celsius, 100.375);

      test.done();
    },

    negative: function(test) {
      var raw = this.i2cRead.args[0][3];
      test.expect(2);

      raw([0xFF, 0x00]);
      test.equals(this.temperature.celsius, -1);

      raw([0xE2, 0x44]);
      test.equals(this.temperature.celsius, -29.75);

      test.done();
    },

    change: function(test) {
      var changeHandler = this.sandbox.spy();
      var raw = this.i2cRead.args[0][3];

      test.expect(1);
      this.temperature.on("change", changeHandler);

      raw([100, 0]);
      this.clock.tick(this.freq);

      raw([100, 0]);
      this.clock.tick(this.freq);

      raw([200, 0]);
      this.clock.tick(this.freq);

      raw([100, 0]);
      this.clock.tick(this.freq);

      raw([200, 0]);
      this.clock.tick(this.freq);

      raw([200, 0]);
      this.clock.tick(this.freq);

      test.equal(changeHandler.callCount, 4);
      test.done();
    }
  },

  GROVE: {
    setUp: function(done) {
      this.temperature = new Thermometer({
        controller: "GROVE",
        pin: "A0",
        freq: 100,
        board: this.board
      });

      done();
    },
    shape: testShape,
    aref: makeTestAnalogConversion({
      aref: 3.3,
      raw: 659,
      C: 39,
      F: 102,
      K: 312,
    }),

    data: makeTestAnalogConversion({
      raw: 659,
      C: 39,
      F: 102,
      K: 312,
    }),
  },

  TINKERKIT: {
    setUp: function(done) {
      this.temperature = new Thermometer({
        controller: "TINKERKIT",
        pin: "A0",
        freq: 100,
        board: this.board
      });

      done();
    },

    aref: makeTestAnalogConversion({
      aref: 3.3,
      raw: 810,
      C: 39,
      F: 102,
      K: 312,
    }),

    data: makeTestAnalogConversion({
      raw: 810,
      C: 39,
      F: 102,
      K: 312,
    }),
  },
};

function createDS18B20(pin, address) {
  return new Thermometer({
    controller: "DS18B20",
    pin: pin,
    address: address,
    freq: 100,
    board: this.board
  });
}

exports["Thermometer -- DS18B20"] = {

  setUp: function(done) {
    this.pin = 2;
    this.sendOneWireConfig = this.sandbox.spy(MockFirmata.prototype, "sendOneWireConfig");
    this.sendOneWireSearch = this.sandbox.spy(MockFirmata.prototype, "sendOneWireSearch");
    this.sendOneWireDelay = this.sandbox.spy(MockFirmata.prototype, "sendOneWireDelay");
    this.sendOneWireReset = this.sandbox.spy(MockFirmata.prototype, "sendOneWireReset");
    this.sendOneWireWrite = this.sandbox.spy(MockFirmata.prototype, "sendOneWireWrite");
    this.sendOneWireWriteAndRead = this.sandbox.spy(MockFirmata.prototype, "sendOneWireWriteAndRead");

    done();
  },

  tearDown: function(done) {
    Thermometer.Drivers.clear();
    done();
  },

  initialize: function(test) {
    var device = [0x28, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    var search;

    test.expect(5);

    this.temperature = createDS18B20(this.pin);
    search = this.sendOneWireSearch.args[0][1];
    search(null, [device]);


    test.ok(this.sendOneWireConfig.calledOnce);
    test.equals(this.sendOneWireConfig.args[0][0], this.pin);

    test.ok(this.sendOneWireSearch.calledOnce);
    test.equals(this.sendOneWireSearch.args[0][0], this.pin);

    test.equals(this.temperature.address, 0x050403020100);

    test.done();
  },

  data: function(test) {
    var device = [0x28, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    var search, data;
    var spy = this.sandbox.spy();

    test.expect(18);

    this.temperature = createDS18B20(this.pin);
    this.temperature.on("data", spy);
    search = this.sendOneWireSearch.args[0][1];
    search(null, [device]);

    data = this.sendOneWireWriteAndRead.args[0][4];
    data(null, [0x01, 0x02]);


    test.ok(this.sendOneWireReset.calledTwice);
    test.equals(this.sendOneWireReset.args[0], this.pin);

    test.ok(this.sendOneWireWrite.calledOnce);
    test.equals(this.sendOneWireWrite.args[0][0], this.pin);
    test.equals(this.sendOneWireWrite.args[0][1], device);
    test.equals(this.sendOneWireWrite.args[0][2], 0x44);

    test.ok(this.sendOneWireDelay.calledOnce);
    test.equals(this.sendOneWireDelay.args[0][0], this.pin);
    test.equals(this.sendOneWireDelay.args[0][1], 1);

    test.equals(this.sendOneWireReset.args[1], 2);

    test.ok(this.sendOneWireWriteAndRead.calledOnce);
    test.equals(this.sendOneWireWriteAndRead.args[0][0], this.pin);
    test.equals(this.sendOneWireWriteAndRead.args[0][1], device);
    test.equals(this.sendOneWireWriteAndRead.args[0][2], 0xBE);
    test.equals(this.sendOneWireWriteAndRead.args[0][3], 2);

    this.clock.tick(100);

    test.equals(Math.round(spy.getCall(0).args[0].celsius), 32);
    test.equals(Math.round(spy.getCall(0).args[0].fahrenheit), 90);
    test.equals(Math.round(spy.getCall(0).args[0].kelvin), 305);

    test.done();
  },

  address: function(test) {
    var device1 = [0x28, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    var device2 = [0x28, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0xFF];
    var search;

    test.expect(3);

    this.temperature = createDS18B20(this.pin, 0x554433221100);
    search = this.sendOneWireSearch.args[0][1];
    search(null, [device1, device2]);

    test.equals(this.sendOneWireWrite.args[0][1], device2);
    test.equals(this.sendOneWireWriteAndRead.args[0][1], device2);
    test.equals(this.temperature.address, 0x554433221100);

    test.done();
  },

  twoAddressedUnits: function(test) {
    var spyA = this.sandbox.spy();
    var spyB = this.sandbox.spy();
    var deviceA = [0x28, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    var deviceB = [0x28, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0xFF];
    var search, data;

    test.expect(2);

    this.temperatureA = createDS18B20(this.pin, 0x554433221100);
    this.temperatureA.on("data", spyA);
    this.temperatureB = createDS18B20(this.pin, 0x050403020100);
    this.temperatureB.on("data", spyB);

    search = this.sendOneWireSearch.args[0][1];
    search(null, [deviceA, deviceB]);

    data = this.sendOneWireWriteAndRead.args[0][4];
    data(null, [0x01, 0x02]);
    data = this.sendOneWireWriteAndRead.args[1][4];
    data(null, [0x03, 0x04]);

    this.clock.tick(100);

    test.equals(Math.round(spyA.getCall(0).args[0].celsius), 32);
    test.equals(Math.round(spyB.getCall(0).args[0].celsius), 64);

    test.done();
  },

  twoAddresslessUnitsThrowsError: function(test) {
    var failedToCreate = false;

    test.expect(1);

    this.temperature = createDS18B20(this.pin);

    try {
      createDS18B20(this.pin);
    } catch (err) {
      failedToCreate = true;
    }

    test.equals(failedToCreate, true);

    test.done();
  }
};

exports["Thermometer -- MPU6050"] = {

  setUp: function(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.temperature = new Thermometer({
      controller: "MPU6050",
      freq: 100,
      board: this.board
    });

    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "MPU6050",
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
    var read, spy = this.sandbox.spy();

    test.expect(12);
    this.temperature.on("data", spy);

    read = this.i2cRead.args[0][3];
    read([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // accelerometer
      0x11, 0x22,                         // temperature
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00  // gyro
    ]);


    test.ok(this.i2cConfig.calledOnce);

    test.ok(this.i2cWrite.calledOnce);
    test.equals(this.i2cWrite.args[0][0], 0x68);
    test.deepEqual(this.i2cWrite.args[0][1], [0x6B, 0x00]);

    test.ok(this.i2cRead.calledOnce);
    test.equals(this.i2cRead.args[0][0], 0x68);
    test.deepEqual(this.i2cRead.args[0][1], 0x3B);
    test.equals(this.i2cRead.args[0][2], 14);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.getCall(0).args[0].celsius), 49);
    test.equals(Math.round(spy.getCall(0).args[0].fahrenheit), 121);
    test.equals(Math.round(spy.getCall(0).args[0].kelvin), 323);

    test.done();
  }
};

exports["Thermometer -- MPL115A2"] = {

  setUp: function(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.temperature = new Thermometer({
      controller: "MPL115A2",
      board: this.board,
      freq: 10
    });

    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "MPL115A2",
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

    // var spy = sinon.spy();
    // this.temperature.on("data", spy);

    var readOnce = this.i2cReadOnce.firstCall.args[3];
    readOnce([
      67, 111,  // A0
      176, 56,  // B1
      179, 101, // B2
      56, 116   // C12
    ]);


    // In order to handle the Promise used for initialization,
    // there can be no fake timers in this test, which means we
    // can't use the clock.tick to move the interval forward
    // in time.
    this.clock.restore();

    setImmediate(function() {
      test.ok(this.i2cConfig.calledOnce);
      test.ok(this.i2cWrite.calledOnce);

      test.equals(this.i2cWrite.firstCall.args[0], 0x60);
      test.deepEqual(this.i2cWrite.firstCall.args[1], [0x12, 0x00]);

      test.ok(this.i2cRead.calledOnce);
      test.equals(this.i2cRead.firstCall.args[0], 0x60);
      test.deepEqual(this.i2cRead.firstCall.args[1], 0x00);
      test.equals(this.i2cRead.firstCall.args[2], 4);

      // read = this.i2cRead.args[0][3];

      // read([
      //   0, 0, // barometer
      //   129, 64, // temperature
      // ]);

      // this.clock.tick(100);
      // test.ok(spy.called);
      // test.equals(Math.round(spy.args[0][0].temperature), 70);

      test.done();
    }.bind(this));
  }
};

exports["Thermometer -- SI7020"] = {

  setUp: function(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.temperature = new Thermometer({
      controller: "SI7020",
      board: this.board,
      freq: 10
    });

    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
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

  enforceExplicitReadDelay: function(test) {
    test.expect(1);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "SI7020",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(forwarded.delay, 50000);
    test.done();
  },

  data: function(test) {
    test.expect(8);

    test.equal(this.i2cRead.callCount, 2);
    // address
    test.equal(this.i2cRead.firstCall.args[0], 0x40);
    // register
    test.equal(this.i2cRead.firstCall.args[1], 0xE3);
    // byte count
    test.equal(this.i2cRead.firstCall.args[2], 2);

    var spy = this.sandbox.spy();
    var read = this.i2cRead.firstCall.args[3];

    this.temperature.on("data", spy);

    read([103, 4, 63]);

    this.clock.tick(10);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.getCall(0).args[0].celsius), 24);
    test.equals(Math.round(spy.getCall(0).args[0].fahrenheit), 75);
    test.equals(Math.round(spy.getCall(0).args[0].kelvin), 297);

    test.done();
  }
};

exports["Thermometer -- HTU21D"] = {

  setUp: function(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.temperature = new Thermometer({
      controller: "HTU21D",
      board: this.board,
      freq: 10
    });

    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
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

  enforceExplicitReadDelay: function(test) {
    test.expect(1);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "SI7020",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(forwarded.delay, 50000);
    test.done();
  },

  data: function(test) {
    test.expect(6);

    test.equal(this.i2cRead.callCount, 2);
    test.deepEqual(this.i2cRead.firstCall.args.slice(0, 3), [
      0x40, // address
      0xE3, // register
      2,    // data length
    ]);


    var spy = this.sandbox.spy();
    var read = this.i2cRead.firstCall.args[3];

    this.temperature.on("data", spy);

    read([0x67, 0x00]); // humidity
    read = this.i2cRead.firstCall.args[3];
    read([0x67, 0x00]); // temperature
    read = this.i2cRead.firstCall.args[3];
    read([0x67, 0x00]); // humidity again

    this.clock.tick(10);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.getCall(0).args[0].celsius), 24);
    test.equals(Math.round(spy.getCall(0).args[0].fahrenheit), 75);
    test.equals(Math.round(spy.getCall(0).args[0].kelvin), 297);

    test.done();
  }
};

function mpl3115aDataLoop(test, initialCount, data) {
  test.equal(this.i2cReadOnce.callCount, initialCount + 1);
  test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, 3), [
    0x60, // address
    0x00, // status register
    1,    // data length
  ]);

  var read = this.i2cReadOnce.lastCall.args[3];
  read([0x04]); // write status bit

  test.equal(this.i2cReadOnce.callCount, initialCount + 2);
  test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, 3), [
    0x60, // address
    0x01, // altitude register
    6,    // data length (pressure + temp)
  ]);

  read = this.i2cReadOnce.lastCall.args[3];
  read(data);
}

exports["Thermometer -- MPL3115A2"] = {

  setUp: function(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.temperature = new Thermometer({
      controller: "MPL3115A2",
      board: this.board,
      freq: 10
    });

    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "MPL3115A2",
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
    test.expect(19);

    test.equal(this.i2cWrite.callCount, 1);
    test.equal(this.i2cWriteReg.callCount, 4);

    test.deepEqual(this.i2cWriteReg.getCall(0).args.slice(0, 3), [
      0x60, // address
      0x2D, // config register
      0x00, // config value
    ]);

    test.deepEqual(this.i2cWriteReg.getCall(1).args.slice(0, 3), [
      0x60, // address
      0x14, // config register
      0x00, // config value
    ]);

    test.deepEqual(this.i2cWriteReg.getCall(2).args.slice(0, 3), [
      0x60, // address
      0x15, // config register
      0x00, // config value
    ]);

    test.deepEqual(this.i2cWriteReg.getCall(3).args.slice(0, 3), [
      0x60, // address
      0x13, // config register
      0x07, // config value
    ]);

    test.deepEqual(this.i2cWrite.firstCall.args.slice(0, 3), [
      0x60, // address
      0x26, // config register
      0xB9, // config value
    ]);

    // test.deepEqual(this.i2cWrite.lastCall.args.slice(0, 3), [
    //   0x60, // address
    //   0x26, // control register
    //   0xB9, // config value
    // ]);

    var spy = this.sandbox.spy();
    this.temperature.on("data", spy);

    // Altitude Loop
    mpl3115aDataLoop.call(this, test, 0, [
      0x00,             // status
      0x00, 0x00, 0x00, // altitude
      0x66, 0x77        // temperature
    ]);


    // Pressure Loop
    mpl3115aDataLoop.call(this, test, 2, [
      0x00,             // status
      0x00, 0x00, 0x00, // pressure
      0x18, 0x20        // temperature
    ]);

    this.clock.tick(10);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.getCall(0).args[0].celsius), 24);
    test.equals(Math.round(spy.getCall(0).args[0].fahrenheit), 75);
    test.equals(Math.round(spy.getCall(0).args[0].kelvin), 297);

    test.done();
  },

  change: function(test) {
    test.expect(39);

    var spy = this.sandbox.spy();
    this.temperature.on("change", spy);

    // First Pass -- initial
    mpl3115aDataLoop.call(this, test, 0, [
      0x00,             // status
      0x00, 0x00, 0x00, // altitude
      0x18, 0x20        // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 2, [
      0x00,             // status
      0x00, 0x00, 0x00, // pressure
      0x18, 0x20        // temperature
    ]);
    this.clock.tick(10);

    // Second Pass -- same
    mpl3115aDataLoop.call(this, test, 4, [
      0x00,             // status
      0x00, 0x00, 0x00, // altitude
      0x18, 0x20        // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 6, [
      0x00,             // status
      0x00, 0x00, 0x00, // pressure
      0x18, 0x20        // temperature
    ]);
    this.clock.tick(10);

    // Third Pass -- change
    mpl3115aDataLoop.call(this, test, 8, [
      0x00,             // status
      0x00, 0x00, 0x00, // altitude
      0x28, 0x20        // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 10, [
      0x00,             // status
      0x00, 0x00, 0x00, // pressure
      0x28, 0x20        // temperature
    ]);
    this.clock.tick(10);

    // Fourth Pass -- same
    mpl3115aDataLoop.call(this, test, 12, [
      0x00,             // status
      0x00, 0x00, 0x00, // altitude
      0x28, 0x20        // temperature
    ]);
    mpl3115aDataLoop.call(this, test, 14, [
      0x00,             // status
      0x00, 0x00, 0x00, // pressure
      0x28, 0x20        // temperature
    ]);
    this.clock.tick(10);

    test.ok(spy.calledTwice);
    test.equals(Math.round(spy.getCall(0).args[0].celsius), 24);
    test.equals(Math.round(spy.getCall(0).args[0].fahrenheit), 75);
    test.equals(Math.round(spy.getCall(0).args[0].kelvin), 297);
    test.equals(Math.round(spy.getCall(1).args[0].celsius), 40);
    test.equals(Math.round(spy.getCall(1).args[0].fahrenheit), 104);
    test.equals(Math.round(spy.getCall(1).args[0].kelvin), 313);

    test.done();
  }
};
