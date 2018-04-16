require("./common/bootstrap");

exports.setUp = function(done) {
  // Base Shape for all Temperature tests
  this.proto = [];
  this.instance = [{
    name: "m"
  }, {
    name: "ft"
  }, {
    name: "meters"
  }, {
    name: "feet"
  }];

  this.board = newBoard();
  this.sandbox = sinon.sandbox.create();
  this.clock = this.sandbox.useFakeTimers();
  this.freq = 100;
  this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
  this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
  this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
  this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
  this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

  done();
};

exports.tearDown = function(done) {
  Board.purge();
  this.sandbox.restore();
  done();
};

var instance = [{
  name: "euler",
}, {
  name: "quarternion",
}];

exports["Orientation - BNO055"] = {

  setUp(done) {
    this.orientation = new Orientation({
      controller: "BNO055",
      board: this.board,
      freq: 10
    });

    done();
  },

  tearDown(done) {
    Orientation.purge();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Orientation({
      controller: "BNO055",
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

  noController: function(test) {
    test.expect(1);
    test.throws(function() {
      new Orientation({
        controller: null,
        board: this.board,
        freq: 10
      });
    }.bind(this));
    test.done();
  },

  sharedtoScaledQuarternion: function(test) {
    test.expect(2);
    var toScaledQuarternion = x => x;
    var orientation = new Orientation({
      controller: {},
      toScaledQuarternion,
      board: this.board,
      freq: 10
    });

    test.equal(orientation.toScaledQuarternion, toScaledQuarternion);
    test.equal(orientation.toScaledQuarternion(1), 1);
    test.done();
  },

  sharedtoScaledEuler: function(test) {
    test.expect(2);
    var toScaledEuler = x => x;
    var orientation = new Orientation({
      controller: {},
      toScaledEuler,
      board: this.board,
      freq: 10
    });

    test.equal(orientation.toScaledEuler, toScaledEuler);
    test.equal(orientation.toScaledEuler(1), 1);

    test.done();
  },

  defaulttoScaledQuarternion: function(test) {
    test.expect(2);
    var toScaledQuarternion = undefined;
    var orientation = new Orientation({
      controller: {},
      toScaledQuarternion,
      board: this.board,
      freq: 10
    });

    test.notEqual(orientation.toScaledQuarternion, toScaledQuarternion);
    test.equal(orientation.toScaledQuarternion(1), 1);
    test.done();
  },

  defaulttoScaledEuler: function(test) {
    test.expect(2);
    var toScaledEuler = undefined;
    var orientation = new Orientation({
      controller: {},
      toScaledEuler,
      board: this.board,
      freq: 10
    });

    test.notEqual(orientation.toScaledEuler, toScaledEuler);
    test.equal(orientation.toScaledEuler(1), 1);

    test.done();
  },

  isCalibrated(test) {
    test.expect(1);
    test.equal(this.orientation.isCalibrated, false);
    test.done();
  },

  dataAndChange(test) {
    test.expect(11);

    var driver = IMU.Drivers.get(this.board, "BNO055");
    var dataSpy = this.sandbox.spy();
    var changeSpy = this.sandbox.spy();


    test.equal(this.orientation.isCalibrated, false);
    this.clock.tick(10);


    this.orientation.on("data", dataSpy);
    this.orientation.on("change", changeSpy);

    var computed = {
      calibration: 0,
      orientation: {
        euler: {
          heading: 2090,
          roll: -3,
          pitch: 10
        },
        quarternion: {
          w: 6836,
          x: -12,
          y: 94,
          z: -14889
        }
      }
    };

    driver.emit("data", computed);
    this.clock.tick(10);

    test.equal(dataSpy.callCount, 1);
    test.equal(changeSpy.callCount, 1);

    test.equal(this.orientation.euler.heading, 130.625);
    test.equal(this.orientation.euler.pitch, 0.625);
    test.equal(this.orientation.euler.roll, -0.1875);
    test.equal(this.orientation.quarternion.w, 0.417236328125);
    test.equal(this.orientation.quarternion.x, -0.000732421875);
    test.equal(this.orientation.quarternion.y, 0.0057373046875);
    test.equal(this.orientation.quarternion.z, -0.90875244140625);

    computed.calibration = 0b11000000;

    driver.emit("data", computed);
    this.clock.tick(10);

    test.equal(this.orientation.isCalibrated, true);

    test.done();
  },

  resolution(test) {
    // TODO.
    test.done();
  },
};
