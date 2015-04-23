var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Temperature = five.Temperature,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Temperature -- LM35"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.temperature = new Temperature({
      controller: "LM35",
      pins: ["A0"],
      freq: 100,
      board: board
    });

    this.proto = [];

    this.instance = [{
      name: "celsius"
    }, {
      name: "fahrenheit"
    }, {
      name: "kelvin"
    }];

    done();
  },

  tearDown: function(done) {
    this.analogRead.restore();
    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.temperature[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.temperature[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {

    var raw = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(4);
    this.temperature.on("data", spy);

    raw(100);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.args[0][1].celsius), 49);
    test.equals(Math.round(spy.args[0][1].fahrenheit), 120);
    test.equals(Math.round(spy.args[0][1].kelvin), 322);

    test.done();
  },

  change: function(test) {
    var raw = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(1);
    this.temperature.on("change", spy);

    raw(100);
    this.clock.tick(100);

    raw(100);
    this.clock.tick(100);

    raw(200);
    this.clock.tick(100);

    raw(100);
    this.clock.tick(100);

    raw(200);
    this.clock.tick(100);

    raw(200);
    this.clock.tick(100);

    test.equal(spy.callCount, 4);
    test.done();
  }
};

exports["Temperature -- TMP36"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.temperature = new Temperature({
      controller: "TMP36",
      pins: ["A0"],
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.analogRead.restore();
    this.clock.restore();
    done();
  },

  data: function(test) {

    var raw = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(4);
    this.temperature.on("data", spy);

    raw(150);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.args[0][1].celsius), 23);
    test.equals(Math.round(spy.args[0][1].fahrenheit), 74);
    test.equals(Math.round(spy.args[0][1].kelvin), 296);

    test.done();
  }
};

function createDS18B20(pin, address) {
  return new Temperature({
      controller: "DS18B20",
      pin: pin,
      address: address,
      freq: 100,
      board: board
    });
}

exports["Temperature -- DS18B20"] = {

  setUp: function(done) {

    this.pin = 2;
    this.clock = sinon.useFakeTimers();
    this.sendOneWireConfig = sinon.spy(board.io, "sendOneWireConfig");
    this.sendOneWireSearch = sinon.spy(board.io, "sendOneWireSearch");
    this.sendOneWireDelay = sinon.spy(board.io, "sendOneWireDelay");
    this.sendOneWireReset = sinon.spy(board.io, "sendOneWireReset");
    this.sendOneWireWrite = sinon.spy(board.io, "sendOneWireWrite");
    this.sendOneWireWriteAndRead = sinon.spy(board.io, "sendOneWireWriteAndRead");

    done();
  },

  tearDown: function(done) {
    this.sendOneWireConfig.restore();
    this.sendOneWireSearch.restore();
    this.sendOneWireDelay.restore();
    this.sendOneWireReset.restore();
    this.sendOneWireWrite.restore();
    this.sendOneWireWriteAndRead.restore();
    this.clock.restore();
    Temperature.Drivers.clear();
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
    var spy = sinon.spy();

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

    test.equals(Math.round(spy.args[0][1].celsius), 32);
    test.equals(Math.round(spy.args[0][1].fahrenheit), 90);
    test.equals(Math.round(spy.args[0][1].kelvin), 305);

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
    var spyA = sinon.spy();
    var spyB = sinon.spy();
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

    test.equals(Math.round(spyA.args[0][1].celsius), 32);
    test.equals(Math.round(spyB.args[0][1].celsius), 64);

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

exports["Temperature -- MPU6050"] = {

  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(board.io, "i2cConfig");
    this.i2cWrite = sinon.spy(board.io, "i2cWrite");
    this.i2cRead = sinon.spy(board.io, "i2cRead");
    this.temperature = new Temperature({
      controller: "MPU6050",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();
    this.clock.restore();
    done();
  },

  data: function(test) {
    var read, spy = sinon.spy();

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
    test.equals(Math.round(spy.args[0][1].celsius), 49);
    test.equals(Math.round(spy.args[0][1].fahrenheit), 121);
    test.equals(Math.round(spy.args[0][1].kelvin), 323);

    test.done();
  }
};

function createAnalog(toCelsius) {
  return new Temperature({
    pins: ["A0"],
    toCelsius: toCelsius,
    freq: 100,
    board: board
  });
}

exports["Temperature -- ANALOG"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");

    done();
  },

  tearDown: function(done) {
    this.analogRead.restore();
    this.clock.restore();
    done();
  },

  rawData: function(test) {
    var temperature = createAnalog();
    var raw = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(4);
    temperature.on("data", spy);

    raw(50);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.args[0][1].celsius), 50);
    test.equals(Math.round(spy.args[0][1].fahrenheit), 122);
    test.equals(Math.round(spy.args[0][1].kelvin), 323);

    test.done();
  },

  customData: function(test) {
    var toCelsius = function() { return 22; };
    var temperature = createAnalog(toCelsius);
    var raw = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(4);
    temperature.on("data", spy);

    raw(50);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.args[0][1].celsius), 22);
    test.equals(Math.round(spy.args[0][1].fahrenheit), 72);
    test.equals(Math.round(spy.args[0][1].kelvin), 295);

    test.done();
  }
};

exports["Temperature -- GROVE"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.temperature = new Temperature({
      controller: "GROVE",
      pin: "A0",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.analogRead.restore();
    this.clock.restore();
    done();
  },

  data: function(test) {

    var raw = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(4);
    this.temperature.on("data", spy);

    raw(659);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.args[0][1].celsius), 39);
    test.equals(Math.round(spy.args[0][1].fahrenheit), 102);
    test.equals(Math.round(spy.args[0][1].kelvin), 312);

    test.done();
  }
};

exports["Temperature -- TINKERKIT"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.temperature = new Temperature({
      controller: "TINKERKIT",
      pin: "A0",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.analogRead.restore();
    this.clock.restore();
    done();
  },

  data: function(test) {

    var raw = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(4);
    this.temperature.on("data", spy);

    raw(810);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.equals(Math.round(spy.args[0][1].celsius), 39);
    test.equals(Math.round(spy.args[0][1].fahrenheit), 102);
    test.equals(Math.round(spy.args[0][1].kelvin), 312);

    test.done();
  }
};
