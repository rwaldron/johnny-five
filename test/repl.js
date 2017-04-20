require("./common/bootstrap");

exports["Repl"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    done();
  },
  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },
  instanceof: function(test) {
    test.expect(1);
    test.equal(Repl({ board: this.board }) instanceof Repl, true);
    test.done();
  },
  repl: function(test) {
    var io = new MockFirmata();
    var board = new Board({
      io: io,
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
  fwdExitEvent: function(test) {
    test.expect(1);

    var io = new MockFirmata();
    var board = new Board({
      io: io,
      debug: false
    });

    // Extra-careful guard against calling test.done() twice here.
    // This was causing "Cannot read property 'setUp' of undefined" errors
    // See https://github.com/caolan/nodeunit/issues/234
    var calledTestDone = false;
    var reallyExit = this.sandbox.stub(process, "reallyExit", function() {
      reallyExit.restore();
      if (!calledTestDone) {
        calledTestDone = true;
        test.done();
      }
    });

    board.on("ready", function() {
      this.on("exit", function() {
        test.ok(true);
      });
      this.repl.close();
    });

    io.emit("connect");
    io.emit("ready");
  },

};
