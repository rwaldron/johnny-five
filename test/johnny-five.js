require("./common/bootstrap");

exports["Alias: Analog"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.Sensor = this.sandbox.stub(five, "Sensor");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  callWithPinNumber: function(test) {
    test.expect(2);

    new Analog(1);

    test.equal(this.Sensor.callCount, 1);
    test.equal(this.Sensor.lastCall.args[0], 1);
    test.done();
  },

  callWithOptions: function(test) {
    test.expect(2);
    var options = { pin: "A1" };

    new Analog(options);

    test.equal(this.Sensor.callCount, 1);
    test.equal(this.Sensor.lastCall.args[0], options);
    test.done();
  },
};

exports["Alias: Digital"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.Sensor = this.sandbox.stub(five, "Sensor");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  callWithPinNumber: function(test) {
    test.expect(4);

    new Digital(1);

    test.equal(this.Sensor.callCount, 1);
    test.deepEqual(this.Sensor.lastCall.args[0], { type: "digital", pin: 1 });

    new Digital("1");

    test.equal(this.Sensor.callCount, 2);
    test.deepEqual(this.Sensor.lastCall.args[0], { type: "digital", pin: "1" });
    test.done();
  },

  callWithOptions: function(test) {
    test.expect(2);
    var options = { pin: "A1" };

    new Digital(options);

    test.equal(this.Sensor.callCount, 1);
    test.equal(this.Sensor.lastCall.args[0], options);
    test.done();
  },
};

exports["Alias: Luxmeter"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.Light = this.sandbox.stub(five, "Light");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  callWithOptions: function(test) {
    test.expect(2);
    var options = { pin: "A1" };

    new Luxmeter(options);

    test.equal(this.Light.callCount, 1);
    test.equal(this.Light.lastCall.args[0], options);
    test.done();
  },
};

exports["Alias: Magnetometer"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.Compass = this.sandbox.stub(five, "Compass");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  callWithOptions: function(test) {
    test.expect(2);
    var options = { pin: "A1" };

    new Magnetometer(options);

    test.equal(this.Compass.callCount, 1);
    test.equal(this.Compass.lastCall.args[0], options);
    test.done();
  },
};


exports["Deprecated"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    done();
  },

  tearDown: function(done) {
    this.sandbox.restore();
    done();
  },

  IR: function(test) {
    test.expect(1);
    test.throws(function() {
      new five.IR();
    });
    test.done();
  },
  "IR.Distance": function(test) {
    test.expect(1);
    test.throws(function() {
      new five.IR.Distance();
    });
    test.done();
  },
  "IR.Proximity": function(test) {
    test.expect(1);
    test.throws(function() {
      new five.IR.Proximity();
    });
    test.done();
  },
  "IR.Motion": function(test) {
    test.expect(1);
    test.throws(function() {
      new five.IR.Motion();
    });
    test.done();
  },
};
