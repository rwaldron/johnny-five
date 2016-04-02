var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata,
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Relay = five.Relay;

function newBoard() {
  var io = new MockFirmata();
  var board = new Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("connect");
  io.emit("ready");

  return board;
}


exports["Relay"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    this.relay = new Relay({
      pin: 10,
      board: this.board
    });

    this.proto = [{
      name: "on"
    }, {
      name: "off"
    }, {
      name: "close"
    }, {
      name: "open"
    }, {
      name: "toggle"
    }];

    this.instance = [{
      name: "isOn"
    }, {
      name: "type"
    }, {
      name: "value"
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
      test.equal(typeof this.relay[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.relay[property.name], "undefined");
    }, this);

    test.done();
  },

  NC: function(test) {
    test.expect(2);

    // NC should send inverted values
    this.relay = new Relay({
      pin: 10,
      type: "NC",
      board: this.board
    });

    this.relay.on();
    test.ok(this.digitalWrite.calledWith(10, 0));

    this.relay.off();
    test.ok(this.digitalWrite.calledWith(10, 1));

    test.done();
  },

  on: function(test) {
    test.expect(1);

    this.relay.on();
    test.ok(this.digitalWrite.calledWith(10, 1));

    test.done();
  },

  off: function(test) {
    test.expect(1);

    this.relay.off();
    test.ok(this.digitalWrite.calledWith(10, 0));

    test.done();
  },

  close: function(test) {
    test.expect(1);

    test.equal(Relay.prototype.close, Relay.prototype.on);

    test.done();
  },

  open: function(test) {
    test.expect(1);

    test.equal(Relay.prototype.open, Relay.prototype.off);

    test.done();
  },

  toggle: function(test) {
    test.expect(2);

    this.relay.off();
    this.relay.toggle();

    test.ok(this.digitalWrite.calledWith(10, 1));

    this.relay.toggle();
    test.ok(this.digitalWrite.calledWith(10, 0));

    test.done();
  },
};


exports["Relay.Collection"] = {
  setUp: function(done) {
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
      "on", "off", "toggle"
    ].forEach(function(method) {
      this[method] = this.sandbox.spy(Relay.prototype, method);
    }.bind(this));

    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  initFromRelayNumbers: function(test) {
    test.expect(1);

    var relays = new Relay.Collection([3, 6, 9]);

    test.equal(relays.length, 3);
    test.done();
  },

  initFromRelays: function(test) {
    test.expect(1);

    var relays = new Relay.Collection([
      this.a, this.b, this.c
    ]);

    test.equal(relays.length, 3);
    test.done();
  },

  callForwarding: function(test) {
    test.expect(2);

    var relays = new Relay.Collection([3, 6, 9]);

    relays.off();
    test.equal(this.off.callCount, relays.length);

    relays.on();
    test.equal(this.on.callCount, relays.length);

    test.done();
  },

  on: function(test) {
    test.expect(4);

    this.relays = new Relay.Collection([{
      pin: 9,
      board: this.board,
    }, {
      pin: 11,
      board: this.board,
    }]);

    this.relays.off();

    test.ok(this.digitalWrite.calledWith(9, 0));
    test.ok(this.digitalWrite.calledWith(11, 0));

    this.relays.on();

    test.ok(this.digitalWrite.calledWith(9, 1));
    test.ok(this.digitalWrite.calledWith(11, 1));

    test.done();
  },

  collectionFromArray: function(test) {
    test.expect(6);

    var relays = new Relay.Collection([this.a, this.b]);
    var collectionFromArray = new Relay.Collection([relays, this.c]);

    collectionFromArray.on();

    test.equal(this.on.callCount, 3);
    test.equal(collectionFromArray.length, 2);
    test.equal(collectionFromArray[0][0], this.a);
    test.equal(collectionFromArray[0][1], this.b);
    test.equal(collectionFromArray[1], this.c);

    collectionFromArray.off();

    test.equal(this.off.callCount, 3);

    test.done();
  }

};
