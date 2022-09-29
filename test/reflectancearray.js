require("./common/bootstrap");

function getEyes(options) {

  const { autoCalibrate = false, board } = options;
  return new ReflectanceArray({
    pins: ["A0", "A1", "A2"],
    emitter: 11,
    freq: 25,
    autoCalibrate,
    board
  });
}

exports["ReflectanceArray"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.analogRead = this.sandbox.stub(MockFirmata.prototype, "analogRead", (pin, callback) => {
      this.analogRead[pin] = callback;
    });
    this.sendAnalogValue = (pin, value) => {
      this.analogRead[pin](value);
    };

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

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.eyes = getEyes({
      board: this.board
    });

    this.proto.forEach(({name}) => test.equal(typeof this.eyes[name], "function", name));
    this.instance.forEach(({name}) => test.notEqual(typeof this.eyes[name], "undefined", name));

    test.done();
  },

  enable(test) {
    this.eyes = getEyes({
      board: this.board
    });
    test.expect(4);

    this.eyes.enable();
    test.ok(this.analogWrite.calledWith(11, 255));
    test.equal(this.eyes.isOn, true);

    this.eyes.disable();
    test.ok(this.analogWrite.calledWith(11, 0));
    test.equal(this.eyes.isOn, false);

    test.done();
  },

  data(test) {
    test.expect(1);

    this.eyes = getEyes({
      board: this.board
    });
    const spy = this.sandbox.spy();

    this.eyes.on("data", spy);

    this.sendAnalogValue(0, 55);
    this.sendAnalogValue(1, 66);
    this.sendAnalogValue(2, 77);

    this.clock.tick(25);

    test.deepEqual(spy.getCall(0).args[0], [55, 66, 77]);

    test.done();
  },

  calibrateOnce(test) {
    this.eyes = getEyes({
      board: this.board
    });
    const calibratedSpy = this.sandbox.spy();

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

  calibrateTwice(test) {
    this.eyes = getEyes({
      board: this.board
    });
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

  loadCalibration(test) {
    this.eyes = getEyes({
      board: this.board
    });
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

  calibrateUntil(test) {
    this.eyes = getEyes({
      board: this.board
    });
    let count = 0;

    test.expect(2);

    this.eyes.calibrateUntil(() => ++count === 2);

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

  autoCalibrate(test) {
    this.eyes = getEyes({
      board: this.board,
      autoCalibrate: true
    });

    this.sendAnalogValue(0, 55);
    this.sendAnalogValue(1, 66);
    this.sendAnalogValue(2, 77);
    this.clock.tick(25);

    this.sendAnalogValue(0, 44);
    this.sendAnalogValue(1, 88);
    this.sendAnalogValue(2, 77);
    this.clock.tick(25);

    this.sendAnalogValue(0, 50);
    this.sendAnalogValue(1, 99);
    this.sendAnalogValue(2, 77);
    this.clock.tick(25);

    test.deepEqual(this.eyes.calibration.min, [44, 66, 77]);
    test.deepEqual(this.eyes.calibration.max, [55, 99, 77]);

    test.done();
  },

  calibratedData(test) {
    this.eyes = getEyes({
      board: this.board
    });
    const spy = this.sandbox.spy();

    const testValues = [{
      min: 100,
      max: 200,
      raw: 150,
      expected: 500
    }, {
      min: 100,
      max: 200,
      raw: 50,
      expected: 0
    }, {
      min: 100,
      max: 200,
      raw: 300,
      expected: 1000
    }];

    test.expect(1);
    this.eyes.loadCalibration({
      min: testValues.map(({min}) => min),
      max: testValues.map(({max}) => max),
    });

    this.eyes.on("calibratedData", spy);

    this.sendAnalogValue(0, testValues[0].raw);
    this.sendAnalogValue(1, testValues[1].raw);
    this.sendAnalogValue(2, testValues[2].raw);
    this.clock.tick(25);

    test.deepEqual(spy.getCall(0).args[0], testValues.map(({expected}) => expected));

    test.done();
  },

  solidLine(test) {
    this.eyes = getEyes({
      board: this.board
    });
    const spy = this.sandbox.spy();

    test.expect(2);
    this.eyes.loadCalibration({
      min: [30, 30, 30],
      max: [600, 600, 600]
    });

    this.eyes.on("line", spy);

    this.sendAnalogValue(0, 50);
    this.sendAnalogValue(1, 300);
    this.sendAnalogValue(2, 50);
    this.clock.tick(25);

    test.deepEqual(spy.getCall(0).args[0], 1000);
    test.equal(this.eyes.isOnLine, true);

    test.done();
  },

  partialLine(test) {
    test.expect(2);

    this.eyes = getEyes({
      board: this.board
    });
    const spy = this.sandbox.spy();

    this.eyes.loadCalibration({
      min: [30, 30, 30],
      max: [600, 600, 600]
    });

    this.eyes.on("line", spy);

    this.sendAnalogValue(0, 50);
    this.sendAnalogValue(1, 300);
    this.sendAnalogValue(2, 435);
    this.clock.tick(25);

    test.deepEqual(spy.getCall(0).args[0], 1600);
    test.equal(this.eyes.isOnLine, true);

    test.done();
  },

  isOnLine(test) {
    this.eyes = getEyes({
      board: this.board
    });
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

exports["10-Bit ReflectanceArray"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.board.RESOLUTION.PWM = 1023;
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");

    this.sendAnalogValue = (index, value) => {
      this.analogRead.args[index][1](value);
    };

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },


  enable(test) {
    this.eyes = getEyes({
      board: this.board
    });
    test.expect(4);

    this.eyes.enable();
    test.ok(this.analogWrite.calledWith(11, 1023));
    test.equal(this.eyes.isOn, true);

    this.eyes.disable();
    test.ok(this.analogWrite.calledWith(11, 0));
    test.equal(this.eyes.isOn, false);

    test.done();
  },

};
