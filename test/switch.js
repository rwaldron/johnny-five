var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Switch = five.Switch;

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

exports["Switch"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.digitalRead = sinon.spy(MockFirmata.prototype, "digitalRead");
    this.switch = new Switch({
      pin: 8,
      freq: 5,
      board: this.board
    });

    this.proto = [];

    this.instance = [{
      name: "isClosed"
    }, {
      name: "isOpen"
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
      test.equal(typeof this.switch[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.switch[property.name], "undefined");
    }, this);

    test.done();
  },

  close: function(test) {
    test.expect(3);

    var callback = this.digitalRead.args[0][1];

    //fake timers dont play nice with __.debounce
    this.switch.on("close", function() {
      test.equal(this.isClosed, true);
      test.equal(this.isOpen, false);
      test.ok(true);
      test.done();
    });

    callback(1);
  },

  open: function(test) {
    test.expect(3);

    var callback = this.digitalRead.args[0][1];

    //fake timers dont play nice with __.debounce
    this.switch.on("open", function() {
      test.equal(this.isClosed, false);
      test.equal(this.isOpen, true);
      test.ok(true);
      test.done();
    });
    callback(1);
    callback(null);
  }

};
