require("./common/bootstrap");

exports["Board.Collection"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.replInit = this.sandbox.stub(Repl.prototype, "initialize", callback => {
      callback();
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    this.sandbox.restore();
    done();
  },

  exists(test) {
    test.expect(1);
    test.equal(Boards, Board.Collection);
    test.done();
  },

  instanceof(test) {
    test.expect(1);
    test.equal(new Boards([newBoard(), newBoard()]) instanceof Boards, true);
    test.done();
  },

  invalidArgsThrows(test) {
    test.expect(1);
    test.throws(() => {
      new Boards();
    });
    test.done();
  },

  noDebug(test) {
    test.expect(1);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards([{
      id: "A",
      repl: true,
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    test.equal(boards.debug, false);
    test.done();
  },

  onfail(test) {
    test.expect(1);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards([{
      id: "A",
      repl: true,
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    const expected = 1;
    boards.on("fail", actual => {
      test.equal(actual, expected);
      test.done();
    });
    boards[0].emit("fail", expected);
  },

  portString(test) {
    test.expect(3);

    this.sandbox.stub(Serial, "connect");
    this.sandbox.stub(Serial, "detect");
    new Boards(["/dev/ttyacm0"]);

    test.equal(Serial.detect.callCount, 0);
    test.equal(Serial.connect.callCount, 1);
    test.equal(Serial.connect.lastCall.args[0], "/dev/ttyacm0");
    test.done();
  },

  idString(test) {
    test.expect(2);

    this.sandbox.stub(Serial, "connect");
    this.sandbox.stub(Serial, "detect", callback => {
      callback("/foo/bar");
    });
    const boards = new Boards(["a"]);
    test.equal(boards[0].id, "a");
    test.equal(boards.byId("a"), boards[0]);
    test.done();
  },

  methods(test) {
    test.expect(8);

    test.ok(Boards.prototype.log);
    test.ok(Boards.prototype.info);
    test.ok(Boards.prototype.warn);
    test.ok(Boards.prototype.error);
    test.ok(Boards.prototype.fail);
    test.ok(Boards.prototype.each);
    test.ok(Boards.prototype.add);
    test.ok(Boards.prototype.byId);

    test.done();
  },

  connectReadyAfter(test) {
    test.expect(2);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards([{
      id: "A",
      repl: false,
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    test.equals(2, boards.length);

    boards.on("ready", () => {
      test.ok(true);
      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  connectReadyBefore(test) {
    test.expect(2);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");

    const boards = new Boards([{
      id: "A",
      repl: false,
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    test.equals(2, boards.length);

    boards.on("ready", () => {
      test.ok(true);
      test.done();
    });
  },

  readyInitReplArray(test) {
    test.expect(1);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards([{
      id: "A",
      debug: false,
      io: ioA
    }, {
      id: "B",
      debug: false,
      io: ioB
    }]);

    boards.on("ready", () => {
      test.equal(this.replInit.callCount, 1);
      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  readyInitReplObject(test) {
    test.expect(1);


    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards({
      repl: true,
      debug: false,
      ports: [{
        id: "A",
        debug: false,
        io: ioA
      }, {
        id: "B",
        debug: false,
        io: ioB
      }]
    });

    boards.on("ready", () => {
      test.equal(this.replInit.called, true);
      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  readyNoReplArray1(test) {
    test.expect(1);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards([{
      id: "A",
      repl: false,
      debug: false,
      io: ioA
    }, {
      id: "B",
      debug: false,
      io: ioB
    }]);

    boards.on("ready", () => {
      // Repl.prototype.initialize IS NOT CALLED
      test.equal(this.replInit.called, false);
      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  readyNoReplArray2(test) {
    test.expect(1);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards([{
      id: "A",
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    boards.on("ready", () => {
      // Repl.prototype.initialize IS NOT CALLED
      test.equal(this.replInit.called, false);
      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  readyNoReplObject(test) {
    test.expect(1);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards({
      repl: false,
      ports: [{
        id: "A",
        debug: false,
        io: ioA
      }, {
        id: "B",
        debug: false,
        io: ioB
      }]
    });

    boards.on("ready", () => {
      // Repl.prototype.initialize IS NOT CALLED
      test.equal(this.replInit.called, false);
      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  readyNoReplNoDebugObject(test) {
    test.expect(2);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards({
      repl: false,
      debug: false,
      ports: [{
        id: "A",
        debug: false,
        io: ioA
      }, {
        id: "B",
        debug: false,
        io: ioB
      }]
    });

    const clog = this.sandbox.spy(console, "log");

    boards.on("ready", () => {
      // Repl.prototype.initialize IS NOT CALLED
      test.equal(this.replInit.called, false);
      test.equal(clog.called, false);
      clog.restore();
      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  errorBubbling(test) {
    test.expect(1);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards({
      repl: false,
      debug: false,
      ports: [{
        id: "A",
        debug: false,
        io: ioA
      }, {
        id: "B",
        debug: false,
        io: ioB
      }]
    });

    const spy = this.sandbox.spy();

    boards.on("error", spy);

    boards.on("ready", function() {
      this[0].emit("error");
      this[1].emit("error");

      test.equal(spy.callCount, 2);

      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },

  byId(test) {
    test.expect(3);

    const ioA = new MockFirmata();
    const ioB = new MockFirmata();

    const boards = new Boards([{
      id: "A",
      repl: false,
      debug: false,
      io: ioA
    }, {
      id: "B",
      repl: false,
      debug: false,
      io: ioB
    }]);

    boards.on("ready", function() {
      test.equal(this.byId("A"), boards[0]);
      test.equal(this.byId("B"), boards[1]);
      test.equal(this.byId("C"), null);
      test.done();
    });

    ioA.emit("connect");
    ioB.emit("connect");

    ioA.emit("ready");
    ioB.emit("ready");
  },
};

