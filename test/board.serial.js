require("./common/bootstrap");

exports["Serial"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    this.responses = {
      error: null,
      list: [],
    };

    this.sandbox.stub(SerialPort, "list", () => {
      return this.responses.error ?
        Promise.reject(this.responses.error) :
        Promise.resolve(this.responses.list);
    });

    this.sandbox.stub(Firmata, "Board", (port, callback) => {
      // Necessary to preserve callback invocation order
      process.nextTick(callback);
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  detect(test) {
    test.expect(1);

    // This will get skipped
    Serial.used.push("/dev/usb");

    this.responses.list.push(
      { path: "/dev/usb" },
      // This will get skipped
      { path: "/dev/cu.Bluetooth-Incoming-Port" },
      // This is the one to expect
      { path: "/dev/acm" },
      { path: "COM4" }
    );

    Serial.detect.call(this.board, port => {
      test.equal(port, "/dev/acm");
      test.done();
    });
  },

  connect(test) {
    test.expect(6);

    const spy = this.sandbox.spy(() => {
      if (spy.callCount === 2) {
        test.equal(spy.firstCall.args[0], null);
        test.equal(spy.firstCall.args[1], "connect");
        test.deepEqual(spy.firstCall.args[2], { name: "Firmata", defaultLed: 13, port: "/dev/acm" });

        test.equal(spy.lastCall.args[0], null);
        test.equal(spy.lastCall.args[1], "ready");
        test.deepEqual(spy.lastCall.args[2], { name: "Firmata", defaultLed: 13, port: "/dev/acm" });

        test.done();
      }
    });

    Serial.connect.call(this.board, "/dev/acm", spy);
  },

  connectError(test) {
    // test.expect(6);

    Firmata.Board.restore();

    const error = new Error("Busted");

    this.sandbox.stub(Firmata, "Board", (port, callback) => {
      // Necessary to preserve callback invocation order
      process.nextTick(() => {
        callback(error);
      });
    });


    const spy = this.sandbox.spy(() => {
      if (spy.callCount === 2) {
        test.equal(spy.firstCall.args[0], null);
        test.equal(spy.firstCall.args[1], "connect");
        test.deepEqual(spy.firstCall.args[2], { name: "Firmata", defaultLed: 13, port: "/dev/acm" });

        test.equal(spy.lastCall.args[0], error);
        test.equal(spy.lastCall.args[1], "error");
        test.deepEqual(spy.lastCall.args[2], { name: "Firmata", defaultLed: 13, port: "/dev/acm" });

        test.done();
      }
    });

    Serial.connect.call(this.board, "/dev/acm", spy);
  },

  ioThrows(test) {
    test.expect(2);

    Firmata.Board.restore();

    const error = new Error("Busted");

    this.sandbox.stub(Firmata, "Board", () => {
      throw error;
    });

    const spy = this.sandbox.spy(() => {
      test.equal(spy.lastCall.args[0], "Busted");
      test.equal(spy.lastCall.args[1], "error");
      test.done();
    });

    Serial.connect.call(this.board, "/dev/acm", spy);
  },

  ioThrowsNoMessage(test) {
    test.expect(2);

    Firmata.Board.restore();

    const error = "Busted";

    this.sandbox.stub(Firmata, "Board", () => {
      throw error;
    });

    const spy = this.sandbox.spy(() => {
      test.equal(spy.lastCall.args[0], "Busted");
      test.equal(spy.lastCall.args[1], "error");
      test.done();
    });

    Serial.connect.call(this.board, "/dev/acm", spy);
  },

};
