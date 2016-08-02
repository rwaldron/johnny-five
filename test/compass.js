require("./common/bootstrap");

var expecteds = {
  data: [25, 79],
  changes: [
    [25, 0],
    [45, 0]
  ],
  bearings: [{
    name: "North",
    abbr: "N",
    low: 0,
    high: 5.62,
    heading: 0
  }, {
    name: "North",
    abbr: "N",
    low: 0,
    high: 5.62,
    heading: 0
  }, ]
};

["HMC6352", "HMC5883L"].forEach(function(controller, index) {

  exports[controller] = {
    setUp: function(done) {
      this.sandbox = sinon.sandbox.create();
      this.clock = this.sandbox.useFakeTimers();
      this.board = newBoard();
      this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
      this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

      this.compass = new Compass({
        board: this.board,
        controller: controller,
      });

      this.clock.tick(500);

      this.properties = [{
        name: "bearing"
      }, {
        name: "heading"
      }];

      done();
    },

    tearDown: function(done) {
      Board.purge();
      this.sandbox.restore();
      done();
    },

    shape: function(test) {
      test.expect(this.properties.length);

      this.properties.forEach(function(property) {
        test.notEqual(typeof this.compass[property.name], "undefined");
      }, this);
      test.done();
    },

    fwdOptionsToi2cConfig: function(test) {
      test.expect(3);

      this.i2cConfig.reset();

      new Compass({
        controller: controller,
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
      test.expect(2);

      var handler = this.i2cRead.getCall(0).args[3];
      var spy = sinon.spy();

      this.compass.on("data", spy);

      handler([1, 2, 3, 4, 5, 6]);
      this.clock.tick(25);

      test.equal(spy.callCount, 1);
      test.equal(Math.round(spy.args[0][0].heading), expecteds.data[index]);

      test.done();
    },

    change: function(test) {
      test.expect(4);

      var handler = this.i2cRead.getCall(0).args[3];
      var spy = sinon.spy();

      this.compass.on("change", spy);

      handler([0, 255, 0, 255, 0, 255]);
      this.clock.tick(100);

      handler([0, 0, 0, 0, 0, 0]);
      this.clock.tick(100);

      test.equal(spy.callCount, 2);

      test.equal(spy.args[0][0].heading, expecteds.changes[index][0]);
      test.equal(spy.args[1][0].heading, expecteds.changes[index][1]);
      test.deepEqual(this.compass.bearing, expecteds.bearings[index]);

      test.done();
    },
  };
});


exports["Compass - MAG3110"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.board = newBoard();

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.compass = new Compass({
      board: this.board,
      controller: "MAG3110",
      offsets: {
        x: [-819, -335],
        y: [702, 1182],
        z: [-293, -13],
      },
    });

    this.properties = [{
      name: "bearing"
    }, {
      name: "heading"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.properties.length);

    this.properties.forEach(function(property) {
      test.notEqual(typeof this.compass[property.name], "undefined");
    }, this);
    test.done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Compass({
      controller: "MAG3110",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    // Controller will overrule an explicit address
    test.equal(forwarded.address, 0x0E);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  data: function(test) {
    test.expect(3);

    var status = this.i2cReadOnce.getCall(0).args[3];
    var spy = sinon.spy();

    this.compass.on("data", spy);

    status([15]);

    this.clock.tick(25);

    var handler = this.i2cReadOnce.getCall(1).args[3];

    // Taken from actual output
    handler([ 0, 153, 255, 247, 0, 102 ]);

    this.clock.tick(25);

    test.equal(spy.callCount, 1);
    test.equal(spy.lastCall.args[0].heading, 3);
    test.equal(this.compass.heading, 3);

    test.done();
  },

  change: function(test) {
    test.expect(7);


    var status = this.i2cReadOnce.getCall(0).args[3];
    var spy = sinon.spy();

    this.compass.on("change", spy);

    status([15]);

    var handler = this.i2cReadOnce.getCall(1).args[3];


    handler([0, 153, 255, 247, 0, 102]);
    this.clock.tick(100);

    handler([0, 155, 255, 242, 0, 93]);
    this.clock.tick(100);

    test.equal(spy.callCount, 2);
    test.equal(spy.firstCall.args[0].heading, 3);
    test.equal(spy.lastCall.args[0].heading, 5);
    test.equal(this.compass.bearing.name, Compass.Points[1].name);
    test.equal(this.compass.bearing.abbr, Compass.Points[1].abbr);
    test.equal(this.compass.bearing.low, Compass.Points[1].low);
    test.equal(this.compass.bearing.high, Compass.Points[1].high);

    test.done();
  },
};

exports["Invalid or missing controller"] = {
  missing: function(test) {
    test.expect(1);
    test.throws(function() {
      new Compass({
        board: newBoard()
      });
    });

    test.done();
  },
  invalid: function(test) {
    test.expect(1);
    test.throws(function() {
      new Compass({
        board: newBoard(),
        controller: 1
      });
    });

    test.done();
  },
};
