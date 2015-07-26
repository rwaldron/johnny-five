var sinon = require("sinon");
var Board = require("../lib/board.js");

var Serial = Board.__spy.Serial;

function restore(target) {
  for (var prop in target) {
    if (target[prop] != null && typeof target[prop].restore === "function") {
      target[prop].restore();
    }
    if (typeof target[prop] === "object") {
      restore(target[prop]);
    }
  }
}

exports["Board Connection"] = {
  setUp: function(done) {
    this.detect = sinon.spy(Serial, "detect");
    done();
  },

  tearDown: function(done) {
    restore(this);
    restore(Serial);
    done();
  },

  lateConnection: function(test) {
    test.expect(3);

    Serial.used.length = 0;

    var attempts = Serial.attempts;
    var connect = sinon.stub(Serial, "connect", function() {
      board.emit("connect");
    });

    var board = new Board({
      debug: false,
      repl: false
    });

    board.on("connect", function() {
      // Two calls to detect
      test.equal(this.detect.callCount, 2);

      // One attempt unsuccessful
      test.equal(attempts, 1);

      // One attempt successful
      test.equal(connect.callCount, 1);

      test.done();
    }.bind(this));
  }
};
