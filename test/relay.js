require("./common/bootstrap");

exports["Relay"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    this.relay = new Relay({
      pin: 10,
      board: this.board
    });

    this.proto = [{
      name: "close"
    }, {
      name: "open"
    }, {
      name: "toggle"
    }];

    this.instance = [{
      name: "isClosed"
    }, {
      name: "type"
    }, {
      name: "value"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.relay[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.relay[name], "undefined"));

    test.done();
  },

  NC(test) {
    test.expect(2);

    // NC should send inverted values
    this.relay = new Relay({
      pin: 10,
      type: "NC",
      board: this.board
    });

    this.relay.close();
    test.ok(this.digitalWrite.calledWith(10, 0));

    this.relay.open();
    test.ok(this.digitalWrite.calledWith(10, 1));

    test.done();
  },

  close(test) {
    test.expect(1);

    this.relay.close();
    test.ok(this.digitalWrite.calledWith(10, 1));

    test.done();
  },

  open(test) {
    test.expect(1);

    this.relay.open();
    test.ok(this.digitalWrite.calledWith(10, 0));

    test.done();
  },

  toggle(test) {
    test.expect(2);

    this.relay.open();
    this.relay.toggle();

    test.ok(this.digitalWrite.calledWith(10, 1));

    this.relay.toggle();
    test.ok(this.digitalWrite.calledWith(10, 0));

    test.done();
  },
};

exports["Relay: Digital Writing to Analog Pin"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");

    this.relay = new Relay({
      pin: "A2",
      board: this.board
    });

    this.proto = [{
      name: "close"
    }, {
      name: "open"
    }, {
      name: "toggle"
    }];

    this.instance = [{
      name: "isClosed"
    }, {
      name: "type"
    }, {
      name: "value"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.relay[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.relay[name], "undefined"));

    test.done();
  },

  callsPinMode(test) {
    test.expect(1);
    test.equal(this.pinMode.callCount, 1);

    test.done();
  },

  NC(test) {
    test.expect(2);

    // NC should send inverted values
    this.relay = new Relay({
      pin: "A2",
      type: "NC",
      board: this.board
    });

    this.relay.close();
    test.ok(this.digitalWrite.calledWith(16, 0));

    this.relay.open();
    test.ok(this.digitalWrite.calledWith(16, 1));

    test.done();
  },

  close(test) {
    test.expect(1);

    this.relay.close();
    test.ok(this.digitalWrite.calledWith(16, 1));

    test.done();
  },

  open(test) {
    test.expect(1);

    this.relay.open();
    test.ok(this.digitalWrite.calledWith(16, 0));

    test.done();
  },

  toggle(test) {
    test.expect(2);

    this.relay.open();
    this.relay.toggle();

    test.ok(this.digitalWrite.calledWith(16, 1));

    this.relay.toggle();
    test.ok(this.digitalWrite.calledWith(16, 0));

    test.done();
  },
};

exports["Relay.Collection"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    Relay.purge();

    this.a = new Relay({
      pin: 3,
      board: this.board
    });

    this.b = new Relay({
      pin: 6,
      board: this.board
    });

    this.c = new Relay({
      pin: 9,
      board: this.board
    });

    [
      "open", "close", "toggle"
    ].forEach(method => {
      this[method] = this.sandbox.spy(Relay.prototype, method);
    });

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  initFromPinNumbers(test) {
    test.expect(1);

    const relays = new Relay.Collection([3, 6, 9]);

    test.equal(relays.length, 3);
    test.done();
  },

  initFromRelays(test) {
    test.expect(1);

    const relays = new Relay.Collection([
      this.a, this.b, this.c
    ]);

    test.equal(relays.length, 3);
    test.done();
  },

  callForwarding(test) {
    test.expect(2);

    const relays = new Relay.Collection([3, 6, 9]);

    relays.open();
    test.equal(this.open.callCount, relays.length);

    relays.close();
    test.equal(this.close.callCount, relays.length);

    test.done();
  },

  close(test) {
    test.expect(4);

    this.relays = new Relay.Collection([{
      pin: 9,
      board: this.board,
    }, {
      pin: 11,
      board: this.board,
    }]);

    this.relays.open();

    test.ok(this.digitalWrite.calledWith(9, 0));
    test.ok(this.digitalWrite.calledWith(11, 0));

    this.relays.close();

    test.ok(this.digitalWrite.calledWith(9, 1));
    test.ok(this.digitalWrite.calledWith(11, 1));

    test.done();
  },

  nested(test) {
    test.expect(6);

    const nested = new Relay.Collection([new Relay.Collection([this.a, this.b]), this.c]);

    nested.close();

    test.equal(this.close.callCount, 3);
    test.equal(nested.length, 3);
    test.equal(nested[0], this.a);
    test.equal(nested[1], this.b);
    test.equal(nested[2], this.c);

    nested.open();

    test.equal(this.open.callCount, 3);

    test.done();
  }

};
