require("./common/bootstrap");

exports["Board Connection"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.connect = this.sandbox.spy(Board.Serial, "connect");
    this.detect = this.sandbox.spy(Board.Serial, "detect");
    this.MockFirmata = this.sandbox.stub(Firmata, "Board");
    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    Board.Serial.attempts.length = 0;
    done();
  },

  lateConnection(test) {
    test.expect(6);

    Board.Serial.used.length = 0;

    let calls = 0;
    const attempts = Board.Serial.attempts;

    this.list = this.sandbox.stub(SerialPort, "list", () => {
      calls++;
      return Promise.resolve(calls === 2 ? [{
        path: "/dev/usb"
      }] : []);
    });

    const board = new Board({
      debug: false,
      repl: false
    });

    board.on("connect", () => {
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
    });
  },

  maxOutAttempts(test) {
    test.expect(2);

    let calls = 0;
    Board.Serial.used.length = 0;
    Board.Serial.attempts[0] = 11;

    this.list = this.sandbox.stub(SerialPort, "list", () => {
      calls++;
      return Promise.resolve(calls === 2 ? [{
        path: "/dev/usb"
      }] : []);
    });

    this.fail = this.sandbox.stub(Board.prototype, "fail", (klass, message) => {
      test.equal(klass, "Board");
      test.equal(message, "No connected device found");
      test.done();
    });

    new Board({
      debug: false,
      repl: false
    });
  },

  inUse(test) {
    test.expect(3);
    let calls = 0;
    Board.Serial.used.push("/dev/ttyUSB0");

    this.list = this.sandbox.stub(SerialPort, "list", () => {
      calls++;
      return Promise.resolve(calls === 2 ? [
        {path: "/dev/ttyUSB0"},
        {path: "/dev/ttyUSB1"},
        {path: "/dev/ttyUSB2"},
      ] : []);
    });

    this.info = this.sandbox.spy(Board.prototype, "info");

    const board = new Board({
      debug: false,
      repl: false
    });

    board.on("connect", () => {
      test.equal(this.info.getCall(1).args[1].includes("ttyUSB0"), false);
      test.equal(this.info.getCall(1).args[1].includes("ttyUSB1"), true);
      test.equal(this.info.getCall(1).args[1].includes("ttyUSB2"), true);
      test.done();
    });
  },
};
