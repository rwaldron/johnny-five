require("./common/bootstrap");

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
  IMU.Drivers.clear();
  this.sandbox.restore();
  this.clock.restore();
  done();
};

function createAnalog(toCelsius) {
  return new Thermometer({
    pins: ["A0"],
    toCelsius,
    freq: this.freq,
    board: this.board
  });
}

function makeTestAnalogConversion(opts) {
  return function testAnalogConversion(test) {
    const spy = this.sandbox.spy();
    test.expect(15);
    if (opts.aref) {
      this.thermometer.aref = opts.aref;
    }
    this.thermometer.on("data", spy);
    this.analogRead.firstCall.yield(opts.raw);

    test.equal(spy.callCount, 0);
    test.equal(Math.round(this.thermometer.C), opts.C, "temp.C");
    test.equal(Math.round(this.thermometer.celsius), opts.C, "temp.celsius");
    test.equal(Math.round(this.thermometer.K), opts.K, "temp.K");
    test.equal(Math.round(this.thermometer.kelvin), opts.K, "temp.kelvin");
    test.equal(Math.round(this.thermometer.F), opts.F, "temp.F");
    test.equal(Math.round(this.thermometer.fahrenheit), opts.F, "temp.fahrenheit");

    this.clock.tick(this.freq);

    test.equal(spy.callCount, 1);

    const data = spy.firstCall.args[0];
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
  const raw = this.analogRead.firstCall.yield.bind(this.analogRead.firstCall);
  const spy = this.sandbox.spy();

  test.expect(1);
  this.thermometer.on("change", spy);

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

function testConstructDisabled(test) {
  this.thermometer = new Thermometer({
    controller: this.thermometer.controller,
    pin: this.thermometer.pin,
    freq: this.thermometer.freq,
    board: this.board,
    enabled: false,
  });

  const raw = this.analogRead.firstCall.yield.bind(this.analogRead.firstCall);
  const spy = this.sandbox.spy();

  test.expect(2);

  this.thermometer.on("change", spy);

  raw(100);
  this.clock.tick(this.freq);
  raw(200);
  this.clock.tick(this.freq);

  test.equal(spy.callCount, 0);

  this.thermometer.enable();

  raw(100);
  this.clock.tick(this.freq);
  raw(200);
  this.clock.tick(this.freq);

  test.equal(spy.callCount, 1);
  test.done();
}

function testEnable(test) {
  const raw = this.analogRead.firstCall.yield.bind(this.analogRead.firstCall);
  const spy = this.sandbox.spy();

  test.expect(2);

  this.thermometer.disable();

  this.thermometer.on("change", spy);

  raw(100);
  this.clock.tick(this.freq);
  raw(200);
  this.clock.tick(this.freq);

  test.equal(spy.callCount, 0);

  this.thermometer.enable();

  raw(100);
  this.clock.tick(this.freq);
  raw(200);
  this.clock.tick(this.freq);

  test.equal(spy.callCount, 2);
  test.done();
}

function testDisable(test) {
  const raw = this.analogRead.firstCall.yield.bind(this.analogRead.firstCall);
  const spy = this.sandbox.spy();

  test.expect(1);

  this.thermometer.disable();

  this.thermometer.on("change", spy);

  raw(100);
  this.clock.tick(this.freq);
  raw(200);
  this.clock.tick(this.freq);

  test.equal(spy.callCount, 0);

  test.done();
}

function testShape(test) {
  test.expect(this.proto.length + this.instance.length);

  this.proto.forEach(function testProtoMethods(method) {
    test.equal(typeof this.thermometer[method.name], "function", method.name);
  }, this);

  this.instance.forEach(function testInstanceProperties(property) {
    test.notEqual(typeof this.thermometer[property.name], "undefined", property.name);
  }, this);

  test.done();
}

exports["Thermometer -- ANY"] = {
  neverEmitNullOrUndefined(test) {
    test.expect(4);

    const spy = this.sandbox.spy();
    const controller = {
      initialize: {
        value(opts, dataHandler) {
          setTimeout(() => {
            dataHandler(25);
          }, 2);
        }
      },
      toCelsius: {
        value(raw) {
          return raw;
        }
      }
    };

    this.thermometer = new Thermometer({
      controller,
      board: this.board,
      freq: 1
    });

    this.thermometer.on("data", spy);

    this.clock.tick(1);

    // No reading has occurred yet.
    test.equal(this.thermometer.C, null);
    test.equal(spy.callCount, 0);

    // 2ms passed, a reading has occurred, safe
    // to emit the data and C is not null
    this.clock.tick(1);

    test.equal(this.thermometer.C, 25);
    test.equal(spy.callCount, 1);

    test.done();
  }
};


exports["Thermometer -- ANALOG"] = {
  setUp(done) {
    this.analogRead = this.sandbox.stub(MockFirmata.prototype, "analogRead");
    this.analogRead.yields(0);
    this.proto.push({
      name: "toCelsius"
    });

    done();
  },

  "picks aref from board.io": function(test) {
    this.board.io.aref = 3.3;
    this.thermometer = createAnalog.call(this);
    test.expect(1);

    test.equal(this.thermometer.aref, this.board.io.aref);
    test.done();
  },

  "picks aref from options": function(test) {
    this.board.io.aref = 3.3;
    this.thermometer = new Thermometer({
      aref: 1.8,
      pins: ["A0"],
      freq: this.freq,
      board: this.board
    });
    test.expect(1);

    test.equal(this.thermometer.aref, 1.8);
    test.done();
  },

  "no controller": {
    setUp(done) {
      this.thermometer = createAnalog.call(this);
      done();
    },

    shape: testShape,
    change: testAnalogChange,
    enable: testEnable,
    disable: testDisable,
    constructDisabled: testConstructDisabled,

    rawData: makeTestAnalogConversion({
      raw: 50,
      C: 50,
      F: 122,
      K: 323
    }),
  },

  "custom toCelsius": {
    setUp(done) {
      this.toCelsius = this.sandbox.stub().returns(22);
      this.thermometer = createAnalog.call(this, this.toCelsius);
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

      test.equal(this.thermometer.C, 22);
      test.equal(this.toCelsius.callCount, 1);
      test.equal(this.toCelsius.firstCall.args[0], 10);
      this.toCelsius.reset();

      this.analogRead.yield(100);
      test.equal(this.thermometer.C, 22);
      test.equal(this.toCelsius.firstCall.args[0], 100);
      test.done();
    },
  },

  LM335: {
    setUp(done) {
      this.thermometer = new Thermometer({
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
      F: -371,
      K: 49,
    }),
    maxRawValue1023: makeTestAnalogConversion({
      raw: 763,
      C: 100,
      F: 212,
      K: 373,
    }),
    change: testAnalogChange,
    enable: testEnable,
    disable: testDisable,
    constructDisabled: testConstructDisabled,
    digits(test) {
      test.expect(1);
      test.equal(digits.fractional(this.thermometer.C), 0);
      test.done();
    }
  },
  LM35: {
    setUp(done) {
      this.thermometer = new Thermometer({
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
      raw: 81,
      C: 26,
      F: 79,
      K: 299
    }),
    data: makeTestAnalogConversion({
      raw: 200,
      C: 98,
      F: 208,
      K: 371
    }),
    maxRawValue1023: makeTestAnalogConversion({
      raw: 214,
      C: 105,
      F: 221,
      K: 378,
    }),
    change: testAnalogChange,
    enable: testEnable,
    disable: testDisable,
    constructDisabled: testConstructDisabled,
    digits(test) {
      test.expect(1);
      test.equal(digits.fractional(this.thermometer.C), 0);
      test.done();
    }

  },

  TMP36: {
    setUp(done) {
      this.thermometer = new Thermometer({
        controller: "TMP36",
        pins: ["A0"],
        freq: this.freq,
        board: this.board
      });
      done();
    },

    shape: testShape,
    change: testAnalogChange,
    enable: testEnable,
    disable: testDisable,
    constructDisabled: testConstructDisabled,

    aref: makeTestAnalogConversion({
      aref: 3.3,
      raw: 150,
      C: -2,
      F: 28,
      K: 271
    }),

    data: makeTestAnalogConversion({
      raw: 150,
      C: 23,
      F: 73,
      K: 296
    }),

    maxRawValue1023: makeTestAnalogConversion({
      raw: 306,
      C: 100,
      F: 212,
      K: 373,
    }),

    digits(test) {
      test.expect(1);
      test.equal(digits.fractional(this.thermometer.C), 0);
      test.done();
    }
  },

  GROVE: {
    setUp(done) {
      this.thermometer = new Thermometer({
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
    digits(test) {
      test.expect(1);
      test.equal(digits.fractional(this.thermometer.C), 0);
      test.done();
    },
    enable: testEnable,
    disable: testDisable,
    constructDisabled: testConstructDisabled,
  },

  TINKERKIT: {
    setUp(done) {
      this.thermometer = new Thermometer({
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

    digits(test) {
      test.expect(1);
      test.equal(digits.fractional(this.thermometer.C), 0);
      test.done();
    },
    enable: testEnable,
    disable: testDisable,
    constructDisabled: testConstructDisabled,
  },
};

function createMAX31850K(pin, address) {
  return new Thermometer({
    controller: "MAX31850K",
    pin,
    address,
    freq: 100,
    board: this.board
  });
}

exports["Thermometer -- MAX31850K"] = {

  setUp(done) {
    this.pin = 2;
    this.sendOneWireConfig = this.sandbox.spy(MockFirmata.prototype, "sendOneWireConfig");
    this.sendOneWireSearch = this.sandbox.spy(MockFirmata.prototype, "sendOneWireSearch");
    this.sendOneWireDelay = this.sandbox.spy(MockFirmata.prototype, "sendOneWireDelay");
    this.sendOneWireReset = this.sandbox.spy(MockFirmata.prototype, "sendOneWireReset");
    this.sendOneWireWrite = this.sandbox.spy(MockFirmata.prototype, "sendOneWireWrite");
    this.sendOneWireWriteAndRead = this.sandbox.spy(MockFirmata.prototype, "sendOneWireWriteAndRead");

    done();
  },

  tearDown(done) {
    Thermometer.Drivers.clear();
    done();
  },

  initialize(test) {
    const device = [0x3B, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    let search;

    test.expect(5);

    this.thermometer = createMAX31850K(this.pin);
    search = this.sendOneWireSearch.args[0][1];
    search(null, [device]);


    test.ok(this.sendOneWireConfig.calledOnce);
    test.equals(this.sendOneWireConfig.args[0][0], this.pin);

    test.ok(this.sendOneWireSearch.calledOnce);
    test.equals(this.sendOneWireSearch.args[0][0], this.pin);

    test.equals(this.thermometer.address, 0x050403020100);

    test.done();
  },

  data(test) {
    const device = [0x3B, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    let search;
    let data;
    const spy = this.sandbox.spy();

    test.expect(14);

    this.thermometer = createMAX31850K(this.pin);
    this.thermometer.on("data", spy);
    search = this.sendOneWireSearch.args[0][1];
    search(null, [device]);

    data = this.sendOneWireWriteAndRead.args[0][4];
    data(null, [0x01, 0x02]);


    test.ok(this.sendOneWireReset.calledThrice);
    test.equals(this.sendOneWireReset.args[0], this.pin);

    test.ok(this.sendOneWireWrite.calledOnce);
    test.equals(this.sendOneWireWrite.args[0][0], this.pin);
    test.equals(this.sendOneWireWrite.args[0][1], device);
    test.equals(this.sendOneWireWrite.args[0][2], 0x44);

    test.ok(this.sendOneWireWriteAndRead.calledTwice);
    test.equals(this.sendOneWireWriteAndRead.args[0][0], this.pin);
    test.equals(this.sendOneWireWriteAndRead.args[0][1], device);
    test.equals(this.sendOneWireWriteAndRead.args[0][2], 0xBE);
    test.equals(this.sendOneWireWriteAndRead.args[0][3], 9);

    data = this.sendOneWireWriteAndRead.args[1][4];
    data(null, [0x01, 0x02]);
    this.clock.tick(100);

    test.equals(Math.round(spy.getCall(0).args[0].celsius), 32);
    test.equals(Math.round(spy.getCall(0).args[0].fahrenheit), 90);
    test.equals(Math.round(spy.getCall(0).args[0].kelvin), 305);

    test.done();
  },

  address(test) {
    const device1 = [0x3B, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    const device2 = [0x3B, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0xFF];
    let search;

    test.expect(3);

    this.thermometer = createMAX31850K(this.pin, 0x554433221100);
    search = this.sendOneWireSearch.args[0][1];
    search(null, [device1, device2]);

    test.equals(this.sendOneWireWrite.args[0][1], device2);
    test.equals(this.sendOneWireWriteAndRead.args[0][1], device2);
    test.equals(this.thermometer.address, 0x554433221100);

    test.done();
  },

  twoAddressedUnits(test) {
    const spyA = this.sandbox.spy();
    const spyB = this.sandbox.spy();
    const deviceA = [0x3B, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    const deviceB = [0x3B, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0xFF];
    let search;
    let data;

    test.expect(3);

    this.thermometerA = createMAX31850K(this.pin, 0x554433221100);
    this.thermometerA.on("data", spyA);
    this.thermometerB = createMAX31850K(this.pin, 0x050403020100);
    this.thermometerB.on("data", spyB);

    search = this.sendOneWireSearch.args[0][1];
    search(null, [deviceA, deviceB]);

    data = this.sendOneWireWriteAndRead.args[0][4];
    data(null, [0x01, 0x02]);
    data = this.sendOneWireWriteAndRead.args[1][4];
    data(null, [0x03, 0x04]);
    data = this.sendOneWireWriteAndRead.args[2][4];
    data(null, [0x01, 0x02]);
    data = this.sendOneWireWriteAndRead.args[3][4];
    data(null, [0x03, 0x04]);

    this.clock.tick(100);

    test.equals(Math.round(spyA.getCall(0).args[0].celsius), 32);
    test.equals(Math.round(spyB.getCall(0).args[0].celsius), 64);

    test.equal(digits.fractional(this.thermometerA.C), 2);

    test.done();
  },

  twoAddresslessUnitsThrowsError(test) {
    let failedToCreate = false;

    test.expect(1);

    this.thermometer = createMAX31850K(this.pin);

    try {
      createMAX31850K(this.pin);
    } catch (err) {
      failedToCreate = true;
    }

    test.equals(failedToCreate, true);

    test.done();
  },
};

function createDS18B20(pin, address) {
  return new Thermometer({
    controller: "DS18B20",
    pin,
    address,
    freq: 100,
    board: this.board
  });
}

exports["Thermometer -- DS18B20"] = {

  setUp(done) {
    this.pin = 2;
    this.sendOneWireConfig = this.sandbox.spy(MockFirmata.prototype, "sendOneWireConfig");
    this.sendOneWireSearch = this.sandbox.spy(MockFirmata.prototype, "sendOneWireSearch");
    this.sendOneWireDelay = this.sandbox.spy(MockFirmata.prototype, "sendOneWireDelay");
    this.sendOneWireReset = this.sandbox.spy(MockFirmata.prototype, "sendOneWireReset");
    this.sendOneWireWrite = this.sandbox.spy(MockFirmata.prototype, "sendOneWireWrite");
    this.sendOneWireWriteAndRead = this.sandbox.spy(MockFirmata.prototype, "sendOneWireWriteAndRead");

    done();
  },

  tearDown(done) {
    Thermometer.Drivers.clear();
    done();
  },

  initialize(test) {
    const device = [0x28, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    let search;

    test.expect(5);

    this.thermometer = createDS18B20(this.pin);
    search = this.sendOneWireSearch.args[0][1];
    search(null, [device]);


    test.ok(this.sendOneWireConfig.calledOnce);
    test.equals(this.sendOneWireConfig.args[0][0], this.pin);

    test.ok(this.sendOneWireSearch.calledOnce);
    test.equals(this.sendOneWireSearch.args[0][0], this.pin);

    test.equals(this.thermometer.address, 0x050403020100);

    test.done();
  },

  data(test) {
    const device = [0x28, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    let search;
    let data;
    const spy = this.sandbox.spy();

    test.expect(19);

    this.thermometer = createDS18B20(this.pin);
    this.thermometer.on("data", spy);
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

    test.equal(digits.fractional(this.thermometer.C), 4);

    test.done();
  },

  address(test) {
    const device1 = [0x28, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    const device2 = [0x28, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0xFF];
    let search;

    test.expect(3);

    this.thermometer = createDS18B20(this.pin, 0x554433221100);
    search = this.sendOneWireSearch.args[0][1];
    search(null, [device1, device2]);

    test.equals(this.sendOneWireWrite.args[0][1], device2);
    test.equals(this.sendOneWireWriteAndRead.args[0][1], device2);
    test.equals(this.thermometer.address, 0x554433221100);

    test.done();
  },

  twoAddressedUnits(test) {
    const spyA = this.sandbox.spy();
    const spyB = this.sandbox.spy();
    const deviceA = [0x28, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    const deviceB = [0x28, 0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0xFF];
    let search;
    let data;

    test.expect(2);

    this.thermometerA = createDS18B20(this.pin, 0x554433221100);
    this.thermometerA.on("data", spyA);
    this.thermometerB = createDS18B20(this.pin, 0x050403020100);
    this.thermometerB.on("data", spyB);

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

  twoAddresslessUnitsThrowsError(test) {
    let failedToCreate = false;

    test.expect(1);

    this.thermometer = createDS18B20(this.pin);

    try {
      createDS18B20(this.pin);
    } catch (err) {
      failedToCreate = true;
    }

    test.equals(failedToCreate, true);

    test.done();
  },

  twoDriversOnDifferentPins(test) {
    const spy = this.sandbox.spy(Thermometer.Drivers, "get");
    createDS18B20(1);
    createDS18B20(2);
    const drv1 = spy.getCall(0).returnValue;
    const drv2 = spy.getCall(1).returnValue;
    test.ok(drv1 !== drv2);
    test.done();
  },

  multipleAddressedDriversOnDifferentPins(test) {
    const device1 = [0x3B, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xFF];
    const device2 = [0x3B, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x00];
    const device3 = [0x3B, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0xF0];
    const spy = this.sandbox.spy(Thermometer.Drivers, "get");
    createDS18B20(1, device1);
    createDS18B20(2, device2);
    createDS18B20(1, device3);
    const drv1 = spy.getCall(0).returnValue;
    const drv2 = spy.getCall(1).returnValue;
    const drv3 = spy.getCall(2).returnValue;
    test.ok(drv1 !== drv2);
    test.ok(drv1 === drv3);
    test.done();
  }
};

exports["Thermometer -- MPU6050"] = {

  setUp(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.thermometer = new Thermometer({
      controller: "MPU6050",
      freq: 100,
      board: this.board
    });

    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "MPU6050",
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
  data(test) {
    let read;
    const spy = this.sandbox.spy();

    test.expect(13);
    this.thermometer.on("data", spy);

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
    test.equals(Math.round(spy.getCall(0).args[0].fahrenheit), 120);
    test.equals(Math.round(spy.getCall(0).args[0].kelvin), 322);

    test.equal(digits.fractional(this.thermometer.C), 0);

    test.done();
  }
};

exports["Thermometer -- MPL115A2"] = {

  setUp(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.thermometer = new Thermometer({
      controller: "MPL115A2",
      board: this.board,
      freq: 10
    });

    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "MPL115A2",
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

  // data: function(test) {
  //   test.expect(7);

  //   var spies = {
  //     data: sinon.spy(),
  //     change: sinon.spy(),
  //   };


  //   // In order to handle the Promise used for initialization,
  //   // there can be no fake timers in this test, which means we
  //   // can't use the clock.tick to move the interval forward
  //   // in time.
  //   this.clock.restore();

  //   this.thermometer = new Thermometer({
  //     controller: "MPL115A2",
  //     board: this.board,
  //     freq: 10
  //   });

  //   this.thermometer.on("data", spies.data);
  //   this.thermometer.on("change", spies.change);

  //   // Simulate receipt of coefficients
  //   var pCoefficients = this.i2cReadOnce.firstCall.args[3];

  //   pCoefficients([
  //     67, 111,  // A0
  //     176, 56,  // B1
  //     179, 101, // B2
  //     56, 116   // C12
  //   ]);

  //   this.i2cWriteReg.reset();
  //   this.i2cReadOnce.reset();

  //   var interval = setInterval(function() {

  //     if (this.i2cWriteReg.callCount === 1) {

  //       test.equal(this.i2cWriteReg.firstCall.args[0], 0x60);
  //       test.equal(this.i2cWriteReg.firstCall.args[1], 0x12);
  //       test.equal(this.i2cWriteReg.firstCall.args[2], 0x00);

  //       test.equal(this.i2cReadOnce.callCount, 1);
  //       test.equal(this.i2cReadOnce.lastCall.args[0], 0x60);
  //       test.equal(this.i2cReadOnce.lastCall.args[1], 0x00);
  //       test.equal(this.i2cReadOnce.lastCall.args[2], 4);

  //       // var handler = this.i2cReadOnce.lastCall.args[3];

  //       // handler([ 0, 0, 0, 0 ]);
  //       // handler([ 90, 64, 129, 64 ]);
  //       // handler([ 90, 64, 129, 0 ]);
  //       // handler([ 89, 192, 129, 0 ]);
  //       // handler([ 90, 64, 128, 192 ]);
  //       // handler([ 89, 192, 129, 0 ]);
  //       // handler([ 90, 64, 129, 0 ]);
  //     }

  //     // if (spies.data.called && spies.change.called) {
  //     //   clearInterval(interval);
  //     //   test.equal(digits.fractional(this.thermometer.C), 0);
  //     //   test.done();
  //     // }
  //     clearInterval(interval);
  //     test.done();
  //   }.bind(this), 1);
  // }
};

exports["Thermometer -- SI7020"] = {

  setUp(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.thermometer = new Thermometer({
      controller: "SI7020",
      board: this.board,
      freq: 10
    });

    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "SI7020",
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

  enforceExplicitReadDelay(test) {
    test.expect(1);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "SI7020",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(forwarded.delay, 50000);
    test.done();
  },

  data(test) {
    test.expect(9);

    test.equal(this.i2cRead.callCount, 2);
    // address
    test.equal(this.i2cRead.firstCall.args[0], 0x40);
    // register
    test.equal(this.i2cRead.firstCall.args[1], 0xE0);
    // byte count
    test.equal(this.i2cRead.firstCall.args[2], 2);

    const spy = this.sandbox.spy();
    const read = this.i2cRead.firstCall.args[3];

    this.thermometer.on("data", spy);

    read([103, 4, 63]);

    this.clock.tick(10);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.getCall(0).args[0].celsius), 24);
    test.equals(Math.round(spy.getCall(0).args[0].fahrenheit), 75);
    test.equals(Math.round(spy.getCall(0).args[0].kelvin), 297);

    test.equal(digits.fractional(this.thermometer.C), 1);

    test.done();
  }
};

exports["Thermometer -- SHT31D"] = {

  setUp(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.thermometer = new Thermometer({
      controller: "SHT31D",
      board: this.board,
      freq: 10
    });

    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "SHT31D",
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

  oneHundredDegreesCelsius(test) {
    test.expect(5);
    let readOnce;
    const spy = this.sandbox.spy();

    this.thermometer.on("data", spy);

    this.clock.tick(20);

    test.equal(this.i2cReadOnce.callCount, 1);
    test.equal(this.i2cReadOnce.lastCall.args[0], 0x44);
    test.equal(this.i2cReadOnce.lastCall.args[1], 6);

    readOnce = this.i2cReadOnce.lastCall.args[2];
    readOnce([
      0xd4, 0x1d, // temperature (100 degrees celsius)
      0, // crc
      0, 0, // humidity
      0 // crc
    ]);
    this.clock.tick(10);

    test.equal(spy.callCount, 1);
    test.equal(Math.round(this.thermometer.C), 100);
    test.done();
  }
};

exports["Thermometer -- HTU21D"] = {

  setUp(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.thermometer = new Thermometer({
      controller: "HTU21D",
      board: this.board,
      freq: 10
    });

    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "HTU21D",
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

  enforceExplicitReadDelay(test) {
    test.expect(1);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "HTU21D",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(forwarded.delay, 50000);
    test.done();
  },

  data(test) {
    test.expect(8);
    let readOnce;
    const spy = this.sandbox.spy();

    this.thermometer.on("data", spy);

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
    readOnce([ 100, 76 ]);
    this.clock.tick(10);

    readOnce = this.i2cReadOnce.lastCall.args[3];
    readOnce([ 94, 6 ]);
    this.clock.tick(10);

    test.equal(spy.callCount, 2);
    test.equal(Math.round(this.thermometer.C), 22);
    test.done();
  },

  change(test) {
    test.expect(5);

    let readOnce;
    const spy = this.sandbox.spy();

    this.thermometer.on("change", spy);

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
    test.equal(Math.round(this.thermometer.C), 22);

    test.done();
  },

  oneHundredDegreesCelsius(test) {
    test.expect(8);
    let readOnce;
    const spy = this.sandbox.spy();

    this.thermometer.on("data", spy);

    test.equal(this.i2cReadOnce.callCount, 1);
    test.equal(this.i2cReadOnce.lastCall.args[0], 0x40);
    test.equal(this.i2cReadOnce.lastCall.args[1], 0xE3);

    // The two numbers in the array passed to readOnce represent the two bytes
    // of unsigned 16 bit integer which should convert to approximately 100
    // degrees celsius.
    // See https://github.com/rwaldron/johnny-five/issues/1278
    readOnce = this.i2cReadOnce.lastCall.args[3];
    readOnce([ 0xd5, 0xf0 ]);
    this.clock.tick(10);

    test.equal(this.i2cReadOnce.callCount, 2);
    test.equal(this.i2cReadOnce.lastCall.args[0], 0x40);
    test.equal(this.i2cReadOnce.lastCall.args[1], 0xE5);

    readOnce = this.i2cReadOnce.lastCall.args[3];
    readOnce([ 100, 76 ]);
    this.clock.tick(10);

    test.equal(spy.callCount, 1);
    test.equal(Math.round(this.thermometer.C), 100);
    test.done();
  }
};

exports["Thermometer -- HIH6130"] = {

  setUp(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");

    this.thermometer = new Thermometer({
      controller: "HIH6130",
      board: this.board,
      freq: 10
    });

    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "HIH6130",
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

  data(test) {
    test.expect(12);
    let readOnce;
    const spy = this.sandbox.spy();

    this.thermometer.on("data", spy);

    this.clock.tick(40);

    test.equal(this.i2cWrite.callCount, 2);
    test.equal(this.i2cWrite.lastCall.args[1], 0x80);
    test.equal(this.i2cWrite.lastCall.args[2][0], 0x00);
    test.equal(this.i2cWrite.lastCall.args[2][1], 0x00);

    test.equal(this.i2cReadOnce.callCount, 1);
    test.equal(this.i2cReadOnce.lastCall.args[0], 0x27);
    test.equal(this.i2cReadOnce.lastCall.args[1], 4);

    readOnce = this.i2cReadOnce.lastCall.args[2];
    readOnce([ 38, 81, 96, 40 ]);
    this.clock.tick(40);

    test.equal(this.i2cReadOnce.callCount, 2);
    test.equal(this.i2cReadOnce.lastCall.args[0], 0x27);
    test.equal(this.i2cReadOnce.lastCall.args[1], 4);

    readOnce = this.i2cReadOnce.lastCall.args[2];
    readOnce([ 102, 81, 96, 53 ]);
    this.clock.tick(40);

    readOnce = this.i2cReadOnce.lastCall.args[2];
    readOnce([ 38, 81, 96, 12 ]);
    this.clock.tick(40);

    test.equal(spy.callCount, 12);
    test.equal(Math.round(this.thermometer.C), 25);
    test.done();
  },

  change(test) {
    test.expect(6);

    let readOnce;
    const spy = this.sandbox.spy();

    this.thermometer.on("change", spy);

    this.clock.tick(40);

    test.equal(this.i2cReadOnce.callCount, 1);
    test.equal(this.i2cReadOnce.lastCall.args[0], 0x27);
    test.equal(this.i2cReadOnce.lastCall.args[1], 4);

    readOnce = this.i2cReadOnce.lastCall.args[2];
    readOnce([ 38, 81, 96, 12 ]);
    this.clock.tick(40);

    readOnce = this.i2cReadOnce.lastCall.args[2];
    readOnce([ 102, 81, 96, 21 ]);
    this.clock.tick(40);

    test.equal(Math.round(this.thermometer.C), 25);

    readOnce = this.i2cReadOnce.lastCall.args[2];
    readOnce([ 38, 81, 102, 48 ]);
    this.clock.tick(40);

    readOnce = this.i2cReadOnce.lastCall.args[2];
    readOnce([ 102, 81, 102, 53 ]);
    this.clock.tick(40);

    test.equal(spy.callCount, 2);
    test.equal(Math.round(this.thermometer.C), 26);

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

  let read = this.i2cReadOnce.lastCall.args[3];
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

  setUp(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.thermometer = new Thermometer({
      controller: "MPL3115A2",
      board: this.board,
      freq: 10
    });

    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Thermometer({
      controller: "MPL3115A2",
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

  data(test) {
    test.expect(20);

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

    const spy = this.sandbox.spy();
    this.thermometer.on("data", spy);

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

    test.equal(digits.fractional(this.thermometer.C), 0);
    test.done();
  },

  change(test) {
    test.expect(39);

    const spy = this.sandbox.spy();
    this.thermometer.on("change", spy);

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

exports["Thermometer -- TMP102"] = {

  setUp(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.thermometer = new Thermometer({
      controller: "TMP102",
      freq: this.freq,
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

    new Thermometer({
      controller: "TMP102",
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


  value(test) {
    const raw = this.i2cRead.args[0][3];
    test.expect(2);

    raw([100, 102]);

    test.equals(this.thermometer.celsius, 100.4);
    test.equal(digits.fractional(this.thermometer.C), 1);

    test.done();
  },

  negative(test) {
    const raw = this.i2cRead.args[0][3];
    test.expect(2);

    raw([0xFF, 0x00]);
    test.equals(this.thermometer.celsius, -1);

    raw([0xE2, 0x44]);
    test.equals(this.thermometer.celsius, -29.8);

    test.done();
  },

  change(test) {
    const changeHandler = this.sandbox.spy();
    const raw = this.i2cRead.args[0][3];

    test.expect(1);
    this.thermometer.on("change", changeHandler);

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
};

exports["Thermometer -- MCP9808"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.thermometer = new Thermometer({
      controller: "MCP9808",
      freq: this.freq,
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

    new Thermometer({
      controller: "MCP9808",
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


  value(test) {
    const raw = this.i2cRead.args[0][3];
    test.expect(2);

    raw([193, 119]);

    test.equals(this.thermometer.celsius, 23.44);
    test.equal(digits.fractional(this.thermometer.C), 2);

    test.done();
  },

  change(test) {
    const changeHandler = this.sandbox.spy();
    const raw = this.i2cRead.args[0][3];

    test.expect(1);
    this.thermometer.on("change", changeHandler);

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
};

Object.keys(Thermometer.Controllers).forEach(name => {
  exports[`Thermometer - Controller, ${name}`] = addControllerTest(Thermometer, Thermometer.Controllers[name], {
    controller: name
  });
});


// TODO:
// SHT31D
// BMP085
// BMP180
// BMP280
// DHT11
// DHT21
// DHT22
// TH02
// MS5611
//
