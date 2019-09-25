require("./common/bootstrap");

exports["ShiftRegister - Common Cathode (default)"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.shiftOut = this.sandbox.spy(Board.prototype, "shiftOut");
    this.send = this.sandbox.spy(ShiftRegister.prototype, "send");

    this.shiftRegister = new ShiftRegister({
      pins: {
        data: 2,
        clock: 3,
        latch: 4
      },
      board: this.board
    });

    this.proto = [{
      name: "send"
    }];

    this.instance = [{
      name: "pins"
    }];

    this.pins = [{
      name: "data"
    }, {
      name: "clock"
    }, {
      name: "latch"
    }, {
      name: "reset"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length + this.pins.length);

    this.proto.forEach(function({name}) {
      test.equal(typeof this.shiftRegister[name], "function");
    }, this);

    this.instance.forEach(function({name}) {
      test.notEqual(typeof this.shiftRegister[name], "undefined");
    }, this);

    this.pins.forEach(function({name}) {
      test.notEqual(typeof this.shiftRegister.pins[name], "undefined");
    }, this);

    test.done();
  },

  shorthandOptsPinsInitializations(test) {
    test.expect(7);

    this.shiftRegister = new ShiftRegister({
      pins: [2, 3, 4],
      board: this.board
    });

    test.equal(this.shiftRegister.pins.data, 2);
    test.equal(this.shiftRegister.pins.clock, 3);
    test.equal(this.shiftRegister.pins.latch, 4);

    this.shiftRegister = new ShiftRegister({
      pins: [6, 7, 8, 9],
      board: this.board
    });

    test.equal(this.shiftRegister.pins.data, 6);
    test.equal(this.shiftRegister.pins.clock, 7);
    test.equal(this.shiftRegister.pins.latch, 8);
    test.equal(this.shiftRegister.pins.reset, 9);

    test.done();
  },

  shorthandPinsInitializations(test) {
    test.expect(7);

    this.shiftRegister = new ShiftRegister([2, 3, 4]);

    test.equal(this.shiftRegister.pins.data, 2);
    test.equal(this.shiftRegister.pins.clock, 3);
    test.equal(this.shiftRegister.pins.latch, 4);

    this.shiftRegister = new ShiftRegister([6, 7, 8, 9]);

    test.equal(this.shiftRegister.pins.data, 6);
    test.equal(this.shiftRegister.pins.clock, 7);
    test.equal(this.shiftRegister.pins.latch, 8);
    test.equal(this.shiftRegister.pins.reset, 9);

    test.done();
  },

  reset(test) {
    test.expect(5);

    this.shiftRegister = new ShiftRegister({
      isAnode: true,
      pins: [6, 7, 8, 9],
      board: this.board
    });

    this.shiftRegister.reset();

    test.equal(this.digitalWrite.callCount, 4);

    test.deepEqual(this.digitalWrite.getCall(0).args, [7, 0]);
    test.deepEqual(this.digitalWrite.getCall(1).args, [9, 0]);
    test.deepEqual(this.digitalWrite.getCall(2).args, [7, 1]);
    test.deepEqual(this.digitalWrite.getCall(3).args, [9, 1]);

    test.done();
  },

  resetFail(test) {
    test.expect(1);

    this.shiftRegister = new ShiftRegister({
      isAnode: true,
      pins: [6, 7, 8],
      board: this.board
    });

    test.throws(() => {
      this.shiftRegister.reset();
    });

    test.done();
  },

  send(test) {
    test.expect(8);

    this.shiftRegister.send(0x01);
    test.ok(this.digitalWrite.getCall(0).calledWith(4, 0)); // latch, low
    test.ok(this.shiftOut.calledWith(2, 3, true, 1));
    test.ok(this.digitalWrite.getCall(25).calledWith(4, 1)); // latch, high
    test.equal(this.shiftRegister.value, 1);

    this.shiftRegister.send(0x10);
    test.ok(this.digitalWrite.getCall(26).calledWith(4, 0)); // latch, low
    test.ok(this.shiftOut.calledWith(2, 3, true, 16));
    test.ok(this.digitalWrite.getCall(51).calledWith(4, 1)); // latch, high
    test.equal(this.shiftRegister.value, 16);

    test.done();
  },

  display(test) {
    test.expect(30);

    const encoded = [63, 6, 91, 79, 102, 109, 125, 7, 127, 103];

    Array.from({
      length: 10
    }, function(_, index) {
      // As numbers...
      this.shiftRegister.display(index);
      test.deepEqual(
        this.shiftOut.lastCall.args, [2, 3, true, encoded[index] | (1 << 7)] // The decimal is removed
      );

      // As strings...
      this.shiftRegister.display(String(index));
      test.deepEqual(
        this.shiftOut.lastCall.args, [2, 3, true, encoded[index] | (1 << 7)] // The decimal is removed
      );

      // As strings with decimal point
      this.shiftRegister.display(`${index}.`);
      test.deepEqual(
        this.shiftOut.lastCall.args, [2, 3, true, encoded[index]]
      );
    }, this);

    test.done();
  },

  displayAcrossChain(test) {
    test.expect(70);

    this.shiftRegister = new ShiftRegister({
      size: 2,
      pins: {
        data: 2,
        clock: 3,
        latch: 4
      },
      board: this.board
    });

    const encoded = [63, 6, 91, 79, 102, 109, 125, 7, 127, 103];

    Array.from({
      length: 10
    }, function(_, index) {
      this.shiftOut.reset();
      this.shiftRegister.display(`${index}.0`);

      test.equal(this.shiftOut.callCount, 2);
      test.deepEqual(
        this.shiftOut.firstCall.args,
        // The first number is "1."
        [2, 3, true, encoded[index]]
      );

      test.deepEqual(
        this.shiftOut.lastCall.args,
        // The second number is "0", so find its
        // encoded character. There will be no decimal
        // for this number
        [2, 3, true, encoded[0] | (1 << 7)]
      );

      this.shiftOut.reset();
      this.shiftRegister.display(`${index}.0.0`);

      test.equal(this.shiftOut.callCount, 3);
      test.deepEqual(
        this.shiftOut.firstCall.args,
        // The first number is "1."
        [2, 3, true, encoded[index]]
      );

      test.deepEqual(
        this.shiftOut.secondCall.args,
        // The second number is "0."
        [2, 3, true, encoded[0]]
      );

      test.deepEqual(
        this.shiftOut.lastCall.args,
        // The second number is "0", so find its
        // encoded character. There will be no decimal
        // for this number
        [2, 3, true, encoded[0] | (1 << 7)]
      );
    }, this);

    test.done();
  },

  sendMany(test) {
    test.expect(4);

    this.shiftRegister.send(0x01, 0x01);

    test.ok(this.digitalWrite.getCall(0).calledWith(4, 0));
    test.ok(this.shiftOut.calledWith(2, 3, true, 1));
    test.ok(this.digitalWrite.getCall(49).calledWith(4, 1));
    test.deepEqual(this.shiftRegister.value, [1, 1]);

    test.done();
  },

  clear(test) {
    test.expect(8);

    this.shiftRegister.clear();
    test.equal(this.send.callCount, 1);
    test.deepEqual(this.shiftRegister.value, [0]);

    this.shiftRegister.send(0x01);
    this.shiftRegister.clear();
    test.equal(this.send.callCount, 3);
    test.ok(this.send.getCall(2).calledWith([0]));
    test.deepEqual(this.shiftRegister.value, [0]);

    this.shiftRegister.send(0x01, 0x01);
    this.shiftRegister.clear();
    test.equal(this.send.callCount, 5);
    test.deepEqual(this.send.getCall(4).args[0], [0]);
    test.deepEqual(this.shiftRegister.value, [0]);

    test.done();
  }
};


exports["ShiftRegister - Common Anode"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.shiftOut = this.sandbox.spy(Board.prototype, "shiftOut");
    this.send = this.sandbox.spy(ShiftRegister.prototype, "send");

    this.shiftRegister = new ShiftRegister({
      isAnode: true,
      pins: {
        data: 2,
        clock: 3,
        latch: 4
      },
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shorthandOptsPinsInitializations(test) {
    test.expect(7);

    this.shiftRegister = new ShiftRegister({
      isAnode: true,
      pins: [2, 3, 4],
      board: this.board
    });

    test.equal(this.shiftRegister.pins.data, 2);
    test.equal(this.shiftRegister.pins.clock, 3);
    test.equal(this.shiftRegister.pins.latch, 4);

    this.shiftRegister = new ShiftRegister({
      isAnode: true,
      pins: [6, 7, 8, 9],
      board: this.board
    });

    test.equal(this.shiftRegister.pins.data, 6);
    test.equal(this.shiftRegister.pins.clock, 7);
    test.equal(this.shiftRegister.pins.latch, 8);
    test.equal(this.shiftRegister.pins.reset, 9);

    test.done();
  },

  reset(test) {
    test.expect(5);

    this.shiftRegister = new ShiftRegister({
      isAnode: true,
      pins: [6, 7, 8, 9],
      board: this.board
    });

    this.shiftRegister.reset();

    test.equal(this.digitalWrite.callCount, 4);

    test.deepEqual(this.digitalWrite.getCall(0).args, [7, 0]);
    test.deepEqual(this.digitalWrite.getCall(1).args, [9, 0]);
    test.deepEqual(this.digitalWrite.getCall(2).args, [7, 1]);
    test.deepEqual(this.digitalWrite.getCall(3).args, [9, 1]);

    test.done();
  },

  resetFail(test) {
    test.expect(1);

    this.shiftRegister = new ShiftRegister({
      isAnode: true,
      pins: [6, 7, 8],
      board: this.board
    });

    test.throws(() => {
      this.shiftRegister.reset();
    });

    test.done();
  },

  send(test) {
    test.expect(8);

    this.shiftRegister.send(0x01);
    test.ok(this.digitalWrite.getCall(0).calledWith(4, 0)); // latch, low
    test.ok(this.shiftOut.calledWith(2, 3, true, 1));
    test.ok(this.digitalWrite.getCall(25).calledWith(4, 1)); // latch, high
    test.equal(this.shiftRegister.value, 1);

    this.shiftRegister.send(0x10);
    test.ok(this.digitalWrite.getCall(26).calledWith(4, 0)); // latch, low
    test.ok(this.shiftOut.calledWith(2, 3, true, 16));
    test.ok(this.digitalWrite.getCall(51).calledWith(4, 1)); // latch, high
    test.equal(this.shiftRegister.value, 16);

    test.done();
  },

  display(test) {
    test.expect(70);

    const encoded = [64, 121, 36, 48, 25, 18, 2, 120, 0, 24];

    Array.from({
      length: 10
    }, function(_, index) {
      // As numbers...
      this.shiftRegister.display(index);
      test.deepEqual(
        this.shiftOut.lastCall.args, [2, 3, true, encoded[index] | (1 << 7)] // The decimal is removed
      );

      // As strings...
      this.shiftRegister.display(String(index));
      test.deepEqual(
        this.shiftOut.lastCall.args, [2, 3, true, encoded[index] | (1 << 7)] // The decimal is removed
      );

      // As strings with decimal point
      this.shiftRegister.display(`${index}.`);
      test.deepEqual(
        this.shiftOut.lastCall.args, [2, 3, true, encoded[index]]
      );

      this.shiftOut.reset();
      this.shiftRegister.display(`${index}.0.0`);

      test.equal(this.shiftOut.callCount, 3);
      test.deepEqual(
        this.shiftOut.firstCall.args,
        // The first number is "1."
        [2, 3, true, encoded[index]]
      );

      test.deepEqual(
        this.shiftOut.secondCall.args,
        // The second number is "0."
        [2, 3, true, encoded[0]]
      );

      test.deepEqual(
        this.shiftOut.lastCall.args,
        // The second number is "0", so find its
        // encoded character. There will be no decimal
        // for this number
        [2, 3, true, encoded[0] | (1 << 7)]
      );
    }, this);

    test.done();
  },

  displayAcrossChain(test) {
    test.expect(30);

    this.shiftRegister = new ShiftRegister({
      isAnode: true,
      size: 2,
      pins: {
        data: 2,
        clock: 3,
        latch: 4
      },
      board: this.board
    });

    const encoded = [64, 121, 36, 48, 25, 18, 2, 120, 0, 24];

    Array.from({
      length: 10
    }, function(_, index) {
      this.shiftOut.reset();
      this.shiftRegister.display(`${index}.0`);

      test.equal(this.shiftOut.callCount, 2);
      test.deepEqual(
        this.shiftOut.firstCall.args,
        // The first number is "1."
        [2, 3, true, encoded[index]]
      );

      test.deepEqual(
        this.shiftOut.lastCall.args,
        // The second number is "0", so find its
        // encoded character. There will be no decimal
        // for this number
        [2, 3, true, encoded[0] | (1 << 7)]
      );
    }, this);

    test.done();
  },

  sendMany(test) {
    test.expect(4);

    this.shiftRegister.send(0x01, 0x01);

    test.ok(this.digitalWrite.getCall(0).calledWith(4, 0));
    test.ok(this.shiftOut.calledWith(2, 3, true, 1));
    test.ok(this.digitalWrite.getCall(49).calledWith(4, 1));
    test.deepEqual(this.shiftRegister.value, [1, 1]);

    test.done();
  },

  clear(test) {
    test.expect(8);

    this.shiftRegister.clear();
    test.equal(this.send.callCount, 1);
    test.deepEqual(this.shiftRegister.value, [255]);

    this.shiftRegister.send(0x01);
    this.shiftRegister.clear();
    test.equal(this.send.callCount, 3);
    test.ok(this.send.getCall(2).calledWith([255]));
    test.deepEqual(this.shiftRegister.value, [255]);

    this.shiftRegister.send(0x01, 0x01);
    this.shiftRegister.clear();
    test.equal(this.send.callCount, 5);
    test.deepEqual(this.send.getCall(4).args[0], [255]);
    test.deepEqual(this.shiftRegister.value, [255]);

    test.done();
  }
};
