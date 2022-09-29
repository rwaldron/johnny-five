require("./common/bootstrap");

exports["Alias: Analog"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.Sensor = this.sandbox.stub(five, "Sensor");
    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  exists(test) {
    test.expect(1);
    test.equal(Analog, Sensor);
    test.done();
  },
};

exports["Alias: Digital"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.Sensor = this.sandbox.stub(five, "Sensor");
    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  callWithPinNumber(test) {
    test.expect(4);

    new Digital(1);

    test.equal(this.Sensor.callCount, 1);
    test.deepEqual(this.Sensor.lastCall.args[0], { type: "digital", pin: 1 });

    new Digital("1");

    test.equal(this.Sensor.callCount, 2);
    test.deepEqual(this.Sensor.lastCall.args[0], { type: "digital", pin: "1" });
    test.done();
  },

  callWithOptions(test) {
    test.expect(2);
    const options = { pin: "A1" };

    new Digital(options);

    test.equal(this.Sensor.callCount, 1);
    test.equal(this.Sensor.lastCall.args[0], options);
    test.done();
  },
};

exports["Alias: Luxmeter"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.Light = this.sandbox.stub(five, "Light");
    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  exists(test) {
    test.expect(1);
    test.equal(Luxmeter, Light);
    test.done();
  },
};

exports["Alias: Magnetometer"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.Compass = this.sandbox.stub(five, "Compass");
    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  exists(test) {
    test.expect(1);
    test.equal(Magnetometer, Compass);
    test.done();
  },
};


exports["Deprecated"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    done();
  },

  tearDown(done) {
    this.sandbox.restore();
    done();
  },

  IR(test) {
    test.expect(1);
    test.throws(() => {
      new five.IR();
    });
    test.done();
  },
  "IR.Distance": function(test) {
    test.expect(1);
    test.throws(() => {
      new five.IR.Distance();
    });
    test.done();
  },
  "IR.Proximity": function(test) {
    test.expect(1);
    test.throws(() => {
      new five.IR.Proximity();
    });
    test.done();
  },
  "IR.Motion": function(test) {
    test.expect(1);
    test.throws(() => {
      new five.IR.Motion();
    });
    test.done();
  },
};
