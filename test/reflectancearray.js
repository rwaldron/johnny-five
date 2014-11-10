var MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
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

    this.proto = [{
      name: "enable"
    }, {
      name: "disable"
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
    var dataSpy = sinon.spy(),
      sendValue = function(index, value) {
        this.analogRead.args[index][1](value);
      }.bind(this);

    test.expect(1);

    this.eyes.on("data", dataSpy);
    
    sendValue(0, 55);
    sendValue(1, 66);
    sendValue(2, 77);
    this.clock.tick(25);
    
    test.deepEqual(dataSpy.getCall(0).args[1], [55, 66, 77]);
    
    test.done();
  },

  calibrateOnce: function(test) {
    var calibratedSpy = sinon.spy(),
      sendValue = function(index, value) {
      this.analogRead.args[index][1](value);
    }.bind(this);

    test.expect(5);

    this.eyes.on("calibrated", calibratedSpy);

    test.deepEqual(this.eyes.calibration.min, []);
    test.deepEqual(this.eyes.calibration.max, []);

    this.eyes.calibrate();

    sendValue(0, 55);
    sendValue(1, 66);
    sendValue(2, 77);
    this.clock.tick(25);

    test.deepEqual(this.eyes.calibration.min, [55, 66, 77]);
    test.deepEqual(this.eyes.calibration.max, [55, 66, 77]);
    test.ok(calibratedSpy.calledOnce);

    test.done();
  },

  calibrateTwice: function(test) {
    var sendValue = function(index, value) {
      this.analogRead.args[index][1](value);
    }.bind(this);

    test.expect(2);

    this.eyes.calibrate();
    sendValue(0, 55);
    sendValue(1, 66);
    sendValue(2, 77);
    this.clock.tick(25);

    this.eyes.calibrate();
    sendValue(0, 44);
    sendValue(1, 88);
    sendValue(2, 77);
    this.clock.tick(25);

    test.deepEqual(this.eyes.calibration.min, [44, 66, 77]);
    test.deepEqual(this.eyes.calibration.max, [55, 88, 77]);

    test.done();
  },

};
