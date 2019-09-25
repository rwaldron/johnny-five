require("./common/bootstrap");

exports["Repl"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    done();
  },
  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },
  instanceof(test) {
    test.expect(1);
    test.equal(new Repl({ board: this.board }) instanceof Repl, true);
    test.done();
  },
  repl(test) {
    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false
    });

    test.expect(3);

    board.on("ready", function() {
      test.ok(this.repl === board.repl);
      test.ok(this.repl instanceof Repl);
      test.ok(this.repl.context);
      test.done();
    });

    io.emit("connect");
    io.emit("ready");
  },
  fwdExitEvent(test) {
    test.expect(1);

    const io = new MockFirmata();
    const board = new Board({
      io,
      debug: false
    });

    // Extra-careful guard against calling test.done() twice here.
    // This was causing "Cannot read property 'setUp' of undefined" errors
    // See https://github.com/caolan/nodeunit/issues/234
    let calledTestDone = false;
    const reallyExit = this.sandbox.stub(process, "reallyExit", () => {
      reallyExit.restore();
      if (!calledTestDone) {
        calledTestDone = true;
        test.done();
      }
    });

    board.on("ready", function() {
      this.on("exit", () => {
        test.ok(true);
      });
      this.repl.close();
    });

    io.emit("connect");
    io.emit("ready");
  },

};
