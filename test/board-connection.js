var mocks = require("mock-firmata");
var MockSerialPort = mocks.SerialPort;
var sinon = require("sinon");
var five = require("../lib/johnny-five");
var Board = five.Board;

exports["Board Connection"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.detect = this.sandbox.spy(Board.Serial, "detect");
    done();
  },

  tearDown: function(done) {
    this.sandbox.restore();
    done();
  },

  lateConnection: function(test) {
    test.expect(4);

    Board.Serial.used.length = 0;
    var calls = 0;

    var attempts = Board.Serial.attempts;
    this.connect = this.sandbox.stub(Board.Serial, "connect", function() {
      board.emit("connect");
    });

    this.list = this.sandbox.stub(MockSerialPort, "list", function(callback) {
      calls++;
      process.nextTick(function() {
        callback(null, calls === 2 ? [{comName: "/dev/usb"}] : []);
      });
    });


    var board = new Board({
      debug: false,
      repl: false
    });

    board.on("connect", function() {
      // Two calls to detect
      test.equal(this.detect.callCount, 2);

      test.equal(this.list.callCount, 2);
      // One attempt unsuccessful
      test.equal(attempts, 1);

      // One attempt successful
      test.equal(this.connect.callCount, 1);

      test.done();
    }.bind(this));
  }
};
