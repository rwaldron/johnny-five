var MockFirmata = require("./util/mock-firmata"),
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

function restore(target) {
  for (var prop in target) {

    if (Array.isArray(target[prop])) {
      continue;
    }

    if (target[prop] != null && typeof target[prop].restore === "function") {
      target[prop].restore();
    }

    if (typeof target[prop] === "object") {
      restore(target[prop]);
    }
  }
}


exports["Relay"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");

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
    restore(this);
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
