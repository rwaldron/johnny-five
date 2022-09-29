require("./common/bootstrap");

exports["Switch - NO"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalRead = this.sandbox.spy(MockFirmata.prototype, "digitalRead");
    this.debounce = this.sandbox.stub(Fn, "debounce", fn => fn);
    this.switch = new Switch({
      pin: 8,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "isClosed"
    }, {
      name: "isOpen"
    }, {
      name: "value"
    }, {
      name: "closeValue"
    }, {
      name: "openValue"
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

    this.proto.forEach(function({name}) {
      test.equal(typeof this.switch[name], "function");
    }, this);

    this.instance.forEach(function({name}) {
      test.notEqual(typeof this.switch[name], "undefined");
    }, this);

    test.done();
  },

  close(test) {

    const callback = this.digitalRead.args[0][1];
    test.expect(1);

    this.switch.on("close", () => {

      test.ok(true);
      test.done();
    });
    // Set initial state
    callback(this.switch.openValue);
    // Trigger a change of state
    callback(this.switch.closeValue);
  },

  open(test) {

    const callback = this.digitalRead.args[0][1];
    test.expect(1);

    this.switch.on("open", () => {
      test.ok(true);
      test.done();
    });
    callback(this.switch.closeValue);
    callback(this.switch.openValue);
  },

  defaultsToNO(test) {
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.switch = new Switch(7);
    test.ok(this.digitalWrite.calledWith(this.switch.pin, this.switch.io.HIGH));
    test.done();
  },

  setToNC(test) {
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.switch = new Switch({pin: 7, type: "NC"});
    test.ok(this.digitalWrite.notCalled);
    test.done();
  }

};



exports["Switch -- Value Inversion"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", fn => fn);
    this.digitalRead = this.sandbox.spy(MockFirmata.prototype, "digitalRead");
    this.switch = new Switch({
      pin: 8,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  defaultInversion(test) {
    test.expect(14);

    test.equal(this.switch.closeValue, 0);
    test.equal(this.switch.openValue, 1);

    this.switch.openValue = 0;

    test.equal(this.switch.closeValue, 1);
    test.equal(this.switch.openValue, 0);

    this.switch.openValue = 1;

    test.equal(this.switch.closeValue, 0);
    test.equal(this.switch.openValue, 1);

    this.switch.closeValue = 1;

    test.equal(this.switch.closeValue, 1);
    test.equal(this.switch.openValue, 0);

    this.switch.closeValue = 0;

    test.equal(this.switch.closeValue, 0);
    test.equal(this.switch.openValue, 1);

    this.switch.invert = true;

    // No change from default!
    test.equal(this.switch.closeValue, 0);
    test.equal(this.switch.openValue, 1);

    this.switch.invert = false;

    test.equal(this.switch.closeValue, 1);
    test.equal(this.switch.openValue, 0);

    test.done();
  },

  initialInversion(test) {
    test.expect(6);

    this.switch = new Switch({
      pin: 8,
      invert: true,
      board: this.board
    });

    test.equal(this.switch.closeValue, 0);
    test.equal(this.switch.openValue, 1);

    this.switch.closeValue = 1;

    test.equal(this.switch.closeValue, 1);
    test.equal(this.switch.openValue, 0);

    this.switch.openValue = 1;

    test.equal(this.switch.closeValue, 0);
    test.equal(this.switch.openValue, 1);

    test.done();
  },

  ncInversion(test) {
    test.expect(6);

    this.switch = new Switch({
      pin: 8,
      type: "NC",
      board: this.board
    });

    test.equal(this.switch.closeValue, 1);
    test.equal(this.switch.openValue, 0);

    this.switch.closeValue = 0;

    test.equal(this.switch.closeValue, 0);
    test.equal(this.switch.openValue, 1);

    this.switch.openValue = 0;

    test.equal(this.switch.closeValue, 1);
    test.equal(this.switch.openValue, 0);

    test.done();
  },
};
