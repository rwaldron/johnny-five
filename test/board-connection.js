var mocks = require("mock-firmata");
var MockSerialPort = mocks.SerialPort;
var sinon = require("sinon");
var five = require("../lib/johnny-five");
var Board = five.Board;

exports["Board Connection"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.connect = this.sandbox.spy(Board.Serial, "connect");
    this.detect = this.sandbox.spy(Board.Serial, "detect");
    this.MockFirmata = this.sandbox.stub(mocks, "Firmata");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  lateConnection: function(test) {
    test.expect(6);

    Board.Serial.used.length = 0;

    var calls = 0;
    var attempts = Board.Serial.attempts;

    this.list = this.sandbox.stub(MockSerialPort, "list", function(callback) {
      calls++;
      process.nextTick(function() {
        callback(null, calls === 2 ? [{
          comName: "/dev/usb"
        }] : []);
      });
    });

    var board = new Board({
      debug: false,
      repl: false
    });

    board.on("connect", function() {
      // Serialport.list called twice
      test.equal(this.list.callCount, 2);
      // Two calls to detect
      test.equal(this.detect.callCount, 2);
      // One attempt unsuccessful
      test.equal(attempts, 1);
      // One attempt successful
      test.equal(this.connect.callCount, 1);

      // MockFirmata instantiated
      test.equal(this.MockFirmata.callCount, 1);
      test.equal(this.MockFirmata.lastCall.args[0], "/dev/usb");
      test.done();
    }.bind(this));
  }
};
