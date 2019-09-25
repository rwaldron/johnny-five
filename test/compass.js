require("./common/bootstrap");

const expecteds = {
  data: [25, 79],
  changes: [
    [25, 0],
    [45, 0]
  ],
  x: [25, 258],
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

["HMC6352", "HMC5883L"].forEach((controller, index) => {

  exports[controller] = {
    setUp(done) {
      this.sandbox = sinon.sandbox.create();
      this.clock = this.sandbox.useFakeTimers();
      this.board = newBoard();
      this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
      this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

      this.compass = new Compass({
        board: this.board,
        controller,
      });

      this.clock.tick(500);

      this.properties = [{
        name: "bearing"
      }, {
        name: "heading"
      }, {
        name: "raw"
      }];

      done();
    },

    tearDown(done) {
      Board.purge();
      this.sandbox.restore();
      done();
    },

    shape(test) {
      test.expect(this.properties.length);

      this.properties.forEach(function({name}) {
        test.notEqual(typeof this.compass[name], "undefined");
      }, this);
      test.done();
    },

    fwdOptionsToi2cConfig(test) {
      test.expect(3);

      this.i2cConfig.reset();

      new Compass({
        controller,
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
      test.expect(3);

      const handler = this.i2cRead.getCall(0).args[3];
      const spy = sinon.spy();

      this.compass.on("data", spy);

      handler([1, 2, 3, 4, 5, 6]);
      this.clock.tick(25);

      test.equal(spy.callCount, 1);
      test.equal(Math.round(spy.args[0][0].heading), expecteds.data[index]);
      test.equal(this.compass.raw.x, expecteds.x[index]);

      test.done();
    },

    change(test) {
      test.expect(4);

      const handler = this.i2cRead.getCall(0).args[3];
      const spy = sinon.spy();

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
  setUp(done) {
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
    }, {
      name: "raw"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    Compass.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.properties.length);

    this.properties.forEach(function({name}) {
      test.notEqual(typeof this.compass[name], "undefined");
    }, this);
    test.done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Compass({
      controller: "MAG3110",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    // Controller will overrule an explicit address
    test.equal(forwarded.address, 0x0E);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  data(test) {
    test.expect(4);

    const status = this.i2cReadOnce.getCall(0).args[3];
    const spy = sinon.spy();

    this.compass.on("data", spy);

    status([15]);

    this.clock.tick(25);

    const handler = this.i2cReadOnce.getCall(1).args[3];

    // Taken from actual output
    handler([ 0, 153, 255, 247, 0, 102 ]);

    this.clock.tick(25);

    test.equal(spy.callCount, 1);
    test.equal(spy.lastCall.args[0].heading, 3);
    test.equal(this.compass.heading, 3);
    test.deepEqual(this.compass.raw, { x: 153, y: -9, z: 102 });

    test.done();
  },

  change(test) {
    test.expect(8);


    const status = this.i2cReadOnce.getCall(0).args[3];
    const spy = sinon.spy();

    this.compass.on("change", spy);

    status([15]);

    const handler = this.i2cReadOnce.getCall(1).args[3];


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
    test.deepEqual(this.compass.raw, { x: 155, y: -14, z: 93 });

    test.done();
  },
};

exports["Compass - BNO055"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.board = newBoard();

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.compass = new Compass({
      board: this.board,
      controller: "BNO055",
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
    }, {
      name: "raw"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    Compass.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.properties.length);

    this.properties.forEach(function({name}) {
      test.notEqual(typeof this.compass[name], "undefined");
    }, this);
    test.done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Compass({
      controller: "BNO055",
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

  dataAndChange(test) {
    test.expect(5);

    const driver = IMU.Drivers.get(this.board, "BNO055");
    const data = this.sandbox.spy();
    const change = this.sandbox.spy();

    this.compass.on("data", data);
    this.compass.on("change", change);

    driver.emit("data", {
      magnetometer: {
        x: -52,
        y: -417,
        z: -200,
      },
    });
    this.clock.tick(20);

    driver.emit("data", {
      magnetometer: {
        x: -52,
        y: -0,
        z: -200,
      },
    });
    this.clock.tick(20);

    test.equal(data.callCount, 1);
    test.equal(change.callCount, 1);

    test.equal(this.compass.heading, 180);
    test.deepEqual(this.compass.bearing, {
      name: "South",
      abbr: "S",
      low: 174.38,
      high: 185.62,
      heading: 180,
    });
    test.deepEqual(this.compass.raw, { x: -52, y: -0, z: -200 });
    test.done();
  },

};


exports["Missing controller"] = {
  setUp(done) {
    this.board = newBoard();
    done();
  },
  tearDown(done) {
    Board.purge();
    done();
  },
  missing(test) {
    test.expect(1);
    test.throws(() => {
      new Compass({
        board: this.board
      });
    });

    test.done();
  },
};

exports["Compass.Scale"] = {
  expectedRegistersAndScales(test) {
    const expects = [{
      gauss: 0.88,
      register: 0x00 << 5,
      scale: 0.73,
    }, {
      gauss: 1.3,
      register: 0x01 << 5,
      scale: 0.92,
    }, {
      gauss: 1.9,
      register: 0x02 << 5,
      scale: 1.22,
    }, {
      gauss: 2.5,
      register: 0x03 << 5,
      scale: 1.52,
    }, {
      gauss: 4.0,
      register: 0x04 << 5,
      scale: 2.27,
    }, {
      gauss: 4.7,
      register: 0x05 << 5,
      scale: 2.56,
    }, {
      gauss: 5.6,
      register: 0x06 << 5,
      scale: 3.03,
    }, {
      gauss: 8.1,
      register: 0x07 << 5,
      scale: 4.35,
    }, {
      gauss: undefined,
      register: 0x00 << 5,
      scale: 1,
    }];

    test.expect(expects.length * 2);

    expects.forEach(({gauss, register, scale}) => {
      const cs = new Compass.Scale(gauss);

      test.equal(cs.register, register);
      test.equal(cs.scale, scale);
    });
    test.done();
  }
};


exports["Compass.Points"] = {
  setUp(done) {
    this.board = newBoard();
    done();
  },
  tearDown(done) {
    Board.purge();
    done();
  },
  bearingWithCardinalPointAndHeading(test) {
    test.expect(1);
    let raw = 0;
    // 36001 gives us a final heading of 360
    const degrees = Array.from({ length: 36001 }, (empty, index) => +(index * 0.01).toFixed(2));
    const compass = new Compass({
      board: this.board,
      controller: {
        initialize: {
          value() {
            Object.assign(this, new Compass.Scale(null));
          }
        },
        toScaledHeading: {
          value() {
            return raw;
          }
        }
      }
    });

    let pass = true;
    let message = "";

    failure: for (let degree of degrees) {
      raw = degree;
      let index = CardinalPointsToIndex[degree];
      if (compass.bearing.name !== Compass.Points[index].name) {
        pass = false;
        message = `compass.bearing.name: ${compass.bearing.name} !== ${Compass.Points[index].name}`;
        break failure;
      }

      if (compass.bearing.abbr !== Compass.Points[index].abbr) {
        pass = false;
        message = `compass.bearing.abbr: ${compass.bearing.abbr} !== ${Compass.Points[index].abbr}`;
        break failure;
      }

      if (compass.bearing.low !== Compass.Points[index].low) {
        pass = false;
        message = `compass.bearing.low: ${compass.bearing.low} !== ${Compass.Points[index].low}`;
        break failure;
      }

      if (compass.bearing.high !== Compass.Points[index].high) {
        pass = false;
        message = `compass.bearing.high: ${compass.bearing.high} !== ${Compass.Points[index].high}`;
        break failure;
      }
    }

    test.ok(pass, message);
    test.done();
  }
};

Object.keys(Compass.Controllers).forEach(controller => {
  exports[`Compass - Controller, ${controller}`] = addControllerTest(Compass, Compass.Controllers[controller], {
    controller,
  });
});
