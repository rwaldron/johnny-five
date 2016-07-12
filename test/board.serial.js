exports["Serial"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    this.responses = {
      error: null,
      list: [],
    };

    this.sandbox.stub(SerialPort, "list", function(callback) {
      callback(this.responses.error, this.responses.list);
    }.bind(this));


    this.sandbox.stub(Firmata, "Board", function(port, callback) {
      // Necessary to preserve callback invocation order
      process.nextTick(callback);
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  detect: function(test) {
    test.expect(1);

    // This will get skipped
    Serial.used.push("/dev/usb");

    this.responses.list.push(
      { comName: "/dev/usb" },
      // This will get skipped
      { comName: "/dev/cu.Bluetooth-Incoming-Port" },
      // This is the one to expect
      { comName: "/dev/acm" },
      { comName: "COM4" }
    );

    Serial.detect.call(this.board, function(port) {
      test.equal(port, "/dev/acm");
      test.done();
    });
  },

  connect: function(test) {
    test.expect(6);

    var spy = this.sandbox.spy(function() {
      if (spy.callCount === 2) {
        test.equal(spy.firstCall.args[0], null);
        test.equal(spy.firstCall.args[1], "connect");
        test.deepEqual(spy.firstCall.args[2], { name: "Firmata", defaultLed: 13, port: "/dev/acm" });

        test.equal(spy.lastCall.args[0], null);
        test.equal(spy.lastCall.args[1], "ready");
        test.deepEqual(spy.lastCall.args[2], { name: "Firmata", defaultLed: 13, port: "/dev/acm" });

        test.done();
      }
    }.bind(this));

    Serial.connect.call(this.board, "/dev/acm", spy);
  },

  connectError: function(test) {
    // test.expect(6);

    Firmata.Board.restore();

    var error = new Error("Busted");

    this.sandbox.stub(Firmata, "Board", function(port, callback) {
      // Necessary to preserve callback invocation order
      process.nextTick(function() {
        callback(error);
      });
    });


    var spy = this.sandbox.spy(function() {
      if (spy.callCount === 2) {
        test.equal(spy.firstCall.args[0], null);
        test.equal(spy.firstCall.args[1], "connect");
        test.deepEqual(spy.firstCall.args[2], { name: "Firmata", defaultLed: 13, port: "/dev/acm" });

        test.equal(spy.lastCall.args[0], error);
        test.equal(spy.lastCall.args[1], "error");
        test.deepEqual(spy.lastCall.args[2], { name: "Firmata", defaultLed: 13, port: "/dev/acm" });

        test.done();
      }
    }.bind(this));

    Serial.connect.call(this.board, "/dev/acm", spy);
  },

  ioThrows: function(test) {
    test.expect(2);

    Firmata.Board.restore();

    var error = new Error("Busted");

    this.sandbox.stub(Firmata, "Board", function(port, callback) {
      throw error;
    });

    var spy = this.sandbox.spy(function() {
      test.equal(spy.lastCall.args[0], "Busted");
      test.equal(spy.lastCall.args[1], "error");
      test.done();
    }.bind(this));

    Serial.connect.call(this.board, "/dev/acm", spy);
  },

  ioThrowsNoMessage: function(test) {
    test.expect(2);

    Firmata.Board.restore();

    var error = "Busted";

    this.sandbox.stub(Firmata, "Board", function(port, callback) {
      throw error;
    });

    var spy = this.sandbox.spy(function() {
      test.equal(spy.lastCall.args[0], "Busted");
      test.equal(spy.lastCall.args[1], "error");
      test.done();
    }.bind(this));

    Serial.connect.call(this.board, "/dev/acm", spy);
  },

};
