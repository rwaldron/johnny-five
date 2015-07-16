var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  ShiftRegister = five.ShiftRegister;

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

exports["ShiftRegister"] = {

  setUp: function(done) {
    this.board = newBoard();
    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");
    this.shiftOut = sinon.spy(Board.prototype, "shiftOut");
    this.send = sinon.spy(ShiftRegister.prototype, "send");

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
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length + this.pins.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.shiftRegister[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.shiftRegister[property.name], "undefined");
    }, this);

    this.pins.forEach(function(property) {
      test.notEqual(typeof this.shiftRegister.pins[property.name], "undefined");
    }, this);

    test.done();
  },

  send: function(test) {
    test.expect(8);

    this.shiftRegister.send(0x01);
    test.ok(this.digitalWrite.getCall(0).calledWith(4, 0)); // latch, low
    test.ok(this.shiftOut.calledWith(2, 3, true, 1));
    test.ok(this.digitalWrite.getCall(25).calledWith(4, 1)); // latch, high
    test.equals(this.shiftRegister.value, 1);

    this.shiftRegister.send(0x10);
    test.ok(this.digitalWrite.getCall(26).calledWith(4, 0)); // latch, low
    test.ok(this.shiftOut.calledWith(2, 3, true, 16));
    test.ok(this.digitalWrite.getCall(51).calledWith(4, 1)); // latch, high
    test.equals(this.shiftRegister.value, 16);

    test.done();
  },

  sendMany: function(test) {
    test.expect(4);

    this.shiftRegister.send(0x01, 0x01);

    test.ok(this.digitalWrite.getCall(0).calledWith(4, 0));
    test.ok(this.shiftOut.calledWith(2, 3, true, 1));
    test.ok(this.digitalWrite.getCall(49).calledWith(4, 1));
    test.deepEqual(this.shiftRegister.value, [1, 1]);

    test.done();
  },

  clear: function(test) {
    test.expect(8);

    this.shiftRegister.clear();
    test.equals(this.send.callCount, 1);
    test.equals(this.shiftRegister.value, 0);

    this.shiftRegister.send(0x01);
    this.shiftRegister.clear();
    test.equals(this.send.callCount, 3);
    test.ok(this.send.getCall(2).calledWith(0));
    test.equals(this.shiftRegister.value, 0);

    this.shiftRegister.send(0x01, 0x01);
    this.shiftRegister.clear();
    test.equals(this.send.callCount, 5);
    test.ok(this.send.getCall(4).calledWith(0, 0));
    test.deepEqual(this.shiftRegister.value, [0, 0]);

    test.done();
  }
};
