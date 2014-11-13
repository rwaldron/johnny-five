var MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  __ = require("../lib/fn.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  ReflectanceArray = five.IR.Reflect.Array,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["ReflectanceArray"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.analogWrite = sinon.spy(board.io, "analogWrite");
    this.eyes = new ReflectanceArray({
      pins: ["A0", "A1", "A2"],
      emitter: 11,
      freq: 25,
      board: board
    });

    this.sendAnalogValue = function(index, value) {
      this.analogRead.args[index][1](value);
    }.bind(this);

    this.proto = [{
      name: "enable"
    }, {
      name: "disable"
    }, {
      name: "calibrate"
    }, {
      name: "calibrateUntil"
    }, {
      name: "loadCalibration"
    }];

    this.instance = [{
      name: "id"
    }, {
      name: "pins"
    }, {
      name: "freq"
    }, {
      name: "isOn"
    }, {
      name: "isCalibrated"
    }, {
      name: "isOnLine"
    }, {
      name: "sensors"
    }, {
      name: "calibration"
    }, {
      name: "raw"
    }, {
      name: "values"
    }, {
      name: "line"
    }];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.analogRead.restore();
    this.analogWrite.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.eyes[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.eyes[property.name], "undefined");
    }, this);

    test.done();
  },

  enable: function(test) {
    test.expect(4);

    this.eyes.enable();
    test.ok(this.analogWrite.calledWith(11, 255));
    test.equal(this.eyes.isOn, true);

    this.eyes.disable();
    test.ok(this.analogWrite.calledWith(11, 0));
    test.equal(this.eyes.isOn, false);

    test.done();
  },

  data: function(test) {
    var dataSpy = sinon.spy();

    test.expect(1);

    this.eyes.on("data", dataSpy);
    
    this.sendAnalogValue(0, 55);
    this.sendAnalogValue(1, 66);
    this.sendAnalogValue(2, 77);
    this.clock.tick(25);
    
    test.deepEqual(dataSpy.getCall(0).args[1], [55, 66, 77]);
    
    test.done();
  },

  calibrateOnce: function(test) {
    var calibratedSpy = sinon.spy();

    test.expect(7);

    this.eyes.on("calibrated", calibratedSpy);

    test.deepEqual(this.eyes.calibration.min, []);
    test.deepEqual(this.eyes.calibration.max, []);
    test.equal(this.eyes.isCalibrated, false);

    this.eyes.calibrate();

    this.sendAnalogValue(0, 55);
    this.sendAnalogValue(1, 66);
    this.sendAnalogValue(2, 77);
    this.clock.tick(25);

    test.deepEqual(this.eyes.calibration.min, [55, 66, 77]);
    test.deepEqual(this.eyes.calibration.max, [55, 66, 77]);
    test.ok(calibratedSpy.calledOnce);
    test.equal(this.eyes.isCalibrated, true);

    test.done();
  },

  calibrateTwice: function(test) {
    test.expect(2);

    this.eyes.calibrate();
    this.sendAnalogValue(0, 55);
    this.sendAnalogValue(1, 66);
    this.sendAnalogValue(2, 77);
    this.clock.tick(25);

    this.eyes.calibrate();
    this.sendAnalogValue(0, 44);
    this.sendAnalogValue(1, 88);
    this.sendAnalogValue(2, 77);
    this.clock.tick(25);

    test.deepEqual(this.eyes.calibration.min, [44, 66, 77]);
    test.deepEqual(this.eyes.calibration.max, [55, 88, 77]);

    test.done();
  },

  loadCalibration: function(test) {
    test.expect(4);

    test.deepEqual(this.eyes.calibration.min, []);
    test.deepEqual(this.eyes.calibration.max, []);

    this.eyes.loadCalibration({
      min: [1, 2, 3],
      max: [5, 6, 7]
    });

    test.deepEqual(this.eyes.calibration.min, [1, 2, 3]);
    test.deepEqual(this.eyes.calibration.max, [5, 6, 7]);

    test.done();
  },

  calibrateUntil: function(test) {
    var count = 0;

    test.expect(2);

    this.eyes.calibrateUntil(function() {
      return ++count === 2;
    });

    this.sendAnalogValue(0, 55);
    this.sendAnalogValue(1, 66);
    this.sendAnalogValue(2, 77);
    this.clock.tick(25);

    this.sendAnalogValue(0, 44);
    this.sendAnalogValue(1, 88);
    this.sendAnalogValue(2, 77);
    this.clock.tick(25);

    // Expect these values to not have been read.  Only calibrate twice
    this.sendAnalogValue(0, 500);
    this.sendAnalogValue(1, 500);
    this.sendAnalogValue(2, 500);
    this.clock.tick(25);

    test.deepEqual(this.eyes.calibration.min, [44, 66, 77]);
    test.deepEqual(this.eyes.calibration.max, [55, 88, 77]);

    test.done();
  },

  calibratedData: function(test) {
    var dataSpy = sinon.spy();

    var testValues = [
      {min: 100, max: 200, raw: 150, expected: 500},
      {min: 100, max: 200, raw: 50,  expected: 0},
      {min: 100, max: 200, raw: 300, expected: 1000}
    ];

    test.expect(1);
    this.eyes.loadCalibration({
      min: __.pluck(testValues, "min"),
      max: __.pluck(testValues, "max")
    });

    this.eyes.on("calibratedData", dataSpy);
    
    this.sendAnalogValue(0, testValues[0].raw);
    this.sendAnalogValue(1, testValues[1].raw);
    this.sendAnalogValue(2, testValues[2].raw);
    this.clock.tick(25);
    
    test.deepEqual(dataSpy.getCall(0).args[1], __.pluck(testValues, "expected"));
    
    test.done();
  },

  solidLine: function(test) {
    var dataSpy = sinon.spy();

    test.expect(2);
    this.eyes.loadCalibration({
      min: [30, 30, 30],
      max: [600, 600, 600]
    });

    this.eyes.on("line", dataSpy);
    
    this.sendAnalogValue(0, 50);
    this.sendAnalogValue(1, 300);
    this.sendAnalogValue(2, 50);
    this.clock.tick(25);
    
    test.deepEqual(dataSpy.getCall(0).args[1], 1000);
    test.equal(this.eyes.isOnLine, true);
    
    test.done();
  },

  partialLine: function(test) {
    var dataSpy = sinon.spy();

    test.expect(2);
    this.eyes.loadCalibration({
      min: [30, 30, 30],
      max: [600, 600, 600]
    });

    this.eyes.on("line", dataSpy);
    
    this.sendAnalogValue(0, 50);
    this.sendAnalogValue(1, 300);
    this.sendAnalogValue(2, 435);
    this.clock.tick(25);
    
    test.deepEqual(dataSpy.getCall(0).args[1], 1600);
    test.equal(this.eyes.isOnLine, true);
    
    test.done();
  },

  isOnLine: function(test) {
    test.expect(1);
    
    this.eyes.loadCalibration({
      min: [30, 30, 30],
      max: [600, 600, 600]
    });

    this.sendAnalogValue(0, 50);
    this.sendAnalogValue(1, 50);
    this.sendAnalogValue(2, 50);
    this.clock.tick(25);
    
    test.equal(this.eyes.isOnLine, false);
    
    test.done();
  }
};
