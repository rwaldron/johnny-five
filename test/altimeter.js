var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata,
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Altimeter = five.Altimeter;

function newBoard() {
  var io = new MockFirmata();
  var board = new Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("connect");
  io.emit("ready");
  return board;
}

// Global suite setUp
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
  this.clock = sinon.useFakeTimers();
  this.freq = 100;

  done();
};

exports.tearDown = function(done) {
  Board.purge();
  this.sandbox.restore();
  this.clock.restore();
  done();
};

function testShape(test) {
  test.expect(this.proto.length + this.instance.length);

  this.proto.forEach(function testProtoMethods(method) {
    test.equal(typeof this.altimeter[method.name], "function", method.name);
  }, this);

  this.instance.forEach(function testInstanceProperties(property) {
    test.notEqual(typeof this.altimeter[property.name], "undefined", property.name);
  }, this);

  test.done();
}

// function mpl3115aDataLoop(test, initialCount, data) {
//   test.equal(this.i2cReadOnce.callCount, initialCount + 1);
//   test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, 3), [
//     0x60, // address
//     0x00, // status register
//     1,    // data length
//   ]);

//   var read = this.i2cReadOnce.lastCall.args[3];
//   read([0x04]); // write status bit

//   test.equal(this.i2cReadOnce.callCount, initialCount + 2);
//   test.deepEqual(this.i2cReadOnce.lastCall.args.slice(0, 3), [
//     0x60, // address
//     0x01, // altitude register
//     6,    // data length (pressure + temp)
//   ]);

//   read = this.i2cReadOnce.lastCall.args[3];
//   read(data);
// }

exports["Altimeter -- MPL3115A2"] = {

  setUp: function(done) {
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cWriteReg = this.sandbox.spy(MockFirmata.prototype, "i2cWriteReg");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");
    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");
    this.warn = this.sandbox.stub(this.board, "warn");

    this.altimeter = new Altimeter({
      elevation: 10,
      controller: "MPL3115A2",
      board: this.board,
      freq: 10
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  testShape: testShape,

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Altimeter({
      elevation: 10,
      controller: "MPL3115A2",
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

  missingRequirements: function(test) {
    test.expect(3);

    new Altimeter({
      controller: "MPL3115A2",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    test.equal(this.warn.callCount, 1);
    test.equal(this.warn.getCall(0).args[0], "Altimeter");

    test.equal(this.warn.getCall(0).args[1], "Missing `elevation` option. Without a specified base `elevation`, the altitude measurement will be inaccurate. Use the meters value shown on whatismyelevation.com");

    test.done();
  },

  data: function(test) {
    // test.expect(16);
    test.expect(8);

    test.equal(this.i2cWrite.callCount, 2);
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
      0x26, // control register
      0x3B, // config value
    ]);

    test.deepEqual(this.i2cWrite.lastCall.args.slice(0, 3), [
      0x60, // address
      0x26, // control register
      0x39, // config value
    ]);

    // var spy = sinon.spy();
    // this.altimeter.on("data", spy);

    // this.clock.tick(2600);

    // // Altitude Loop
    // mpl3115aDataLoop.call(this, test, 0, [
    //   0x00,             // status
    //   0x02, 0xBB, 0xCC, // altitude
    //   0x00, 0x00        // temperature
    // ]);


    // // Pressure Loop
    // mpl3115aDataLoop.call(this, test, 2, [
    //   0x00,             // status
    //   0x00, 0x00, 0x00, // pressure
    //   0x00, 0x00        // temperature
    // ]);

    // this.clock.tick(10);

    // test.ok(spy.calledOnce);
    // test.equals(Math.round(spy.args[0][0].m), 700);
    // test.equals(Math.round(spy.args[0][0].ft), 2296);

    test.done();
  },

  // change: function(test) {
  //   test.expect(37);

  //   var spy = sinon.spy();
  //   this.altimeter.on("change", spy);

  //   // First Pass -- initial
  //   mpl3115aDataLoop.call(this, test, 0, [
  //     0x00,             // status
  //     0x02, 0xBB, 0xCC, // altitude
  //     0x00, 0x00        // temperature
  //   ]);
  //   mpl3115aDataLoop.call(this, test, 2, [
  //     0x00,             // status
  //     0x00, 0x00, 0x00, // pressure
  //     0x00, 0x00        // temperature
  //   ]);
  //   this.clock.tick(10);

  //   // Second Pass -- same
  //   mpl3115aDataLoop.call(this, test, 4, [
  //     0x00,             // status
  //     0x02, 0xBB, 0xCC, // altitude
  //     0x00, 0x00        // temperature
  //   ]);
  //   mpl3115aDataLoop.call(this, test, 6, [
  //     0x00,             // status
  //     0x00, 0x00, 0x00, // pressure
  //     0x00, 0x00        // temperature
  //   ]);
  //   this.clock.tick(10);

  //   // Third Pass -- change
  //   mpl3115aDataLoop.call(this, test, 8, [
  //     0x00,             // status
  //     0x01, 0xBB, 0xCC, // altitude
  //     0x00, 0x00        // temperature
  //   ]);
  //   mpl3115aDataLoop.call(this, test, 10, [
  //     0x00,             // status
  //     0x00, 0x00, 0x00, // pressure
  //     0x00, 0x00        // temperature
  //   ]);
  //   this.clock.tick(10);

  //   // Fourth Pass -- same
  //   mpl3115aDataLoop.call(this, test, 12, [
  //     0x00,             // status
  //     0x01, 0xBB, 0xCC, // altitude
  //     0x00, 0x00        // temperature
  //   ]);
  //   mpl3115aDataLoop.call(this, test, 14, [
  //     0x00,             // status
  //     0x00, 0x00, 0x00, // pressure
  //     0x00, 0x00        // temperature
  //   ]);
  //   this.clock.tick(10);

  //   test.ok(spy.calledTwice);
  //   test.equals(Math.round(spy.args[0][0].m), 700);
  //   test.equals(Math.round(spy.args[0][0].ft), 2296);
  //   test.equals(Math.round(spy.args[1][0].m), 444);
  //   test.equals(Math.round(spy.args[1][0].ft), 1456);

  //   test.done();
  // }
};


