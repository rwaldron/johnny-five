exports["Switch - NO"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalRead = this.sandbox.spy(MockFirmata.prototype, "digitalRead");
    this.debounce = this.sandbox.stub(Fn, "debounce", function(fn) {
      return fn;
    });
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

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.switch[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.switch[property.name], "undefined");
    }, this);

    test.done();
  },

  close: function(test) {

    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    this.switch.on("close", function() {

      test.ok(true);
      test.done();
    });
    // Set initial state
    callback(this.switch.openValue);
    // Trigger a change of state
    callback(this.switch.closeValue);
  },

  open: function(test) {

    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    this.switch.on("open", function() {
      test.ok(true);
      test.done();
    });
    callback(this.switch.closeValue);
    callback(this.switch.openValue);
  },

};



exports["Switch -- Value Inversion"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", function(fn) {
      return fn;
    });
    this.digitalRead = this.sandbox.spy(MockFirmata.prototype, "digitalRead");
    this.switch = new Switch({
      pin: 8,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  defaultInversion: function(test) {
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

  initialInversion: function(test) {
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

  ncInversion: function(test) {
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
