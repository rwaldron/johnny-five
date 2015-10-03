var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  ShiftRegister = five.ShiftRegister,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["ShiftRegister"] = {

  setUp: function(done) {

    this.shiftRegister = new ShiftRegister({
      pins: {
        data: 2,
        clock: 3,
        latch: 4
      },
      board: board
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
    var spy = sinon.spy(board.io, "digitalWrite");
    var shiftOutSpy = sinon.spy(board, "shiftOut");
    test.expect(8);

    this.shiftRegister.send(0x01);
    test.ok(spy.getCall(0).calledWith(4, 0)); // latch, low
    test.ok(shiftOutSpy.calledWith(2, 3, true, 1));
    test.ok(spy.getCall(25).calledWith(4, 1)); // latch, high
    test.equals(this.shiftRegister.value, 1);

    this.shiftRegister.send(0x10);
    test.ok(spy.getCall(26).calledWith(4, 0)); // latch, low
    test.ok(shiftOutSpy.calledWith(2, 3, true, 16));
    test.ok(spy.getCall(51).calledWith(4, 1)); // latch, high
    test.equals(this.shiftRegister.value, 16);

    shiftOutSpy.restore();
    spy.restore();
    test.done();
  },

  sendMany: function(test) {
    var spy = sinon.spy(board.io, "digitalWrite");
    var shiftOutSpy = sinon.spy(board, "shiftOut");

    this.shiftRegister.send(0x01, 0x01);
    test.ok(spy.getCall(0).calledWith(4, 0));
    test.ok(shiftOutSpy.calledWith(2, 3, true, 1));
    test.ok(spy.getCall(49).calledWith(4, 1));
    test.deepEqual(this.shiftRegister.value, [1, 1]);

    shiftOutSpy.restore();
    spy.restore();
    test.done();
  },

  clear: function(test) {
    var spy = sinon.spy(this.shiftRegister, "send");

    this.shiftRegister.clear();
    test.equals(spy.callCount, 1);
    test.equals(this.shiftRegister.value, 0);

    this.shiftRegister.send(0x01);
    this.shiftRegister.clear();
    test.equals(spy.callCount, 3);
    test.ok(spy.getCall(2).calledWith(0));
    test.equals(this.shiftRegister.value, 0);

    this.shiftRegister.send(0x01, 0x01);
    this.shiftRegister.clear();
    test.equals(spy.callCount, 5);
    test.ok(spy.getCall(4).calledWith(0, 0));
    test.deepEqual(this.shiftRegister.value, [0, 0]);

    spy.restore();
    test.done();
  }

};
