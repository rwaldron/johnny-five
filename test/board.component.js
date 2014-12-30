require("es6-shim");

global.IS_TEST_MODE = true;

var MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board;


exports["Board.Component"] = {
  setUp: function(done) {

    this.io = new MockFirmata();
    this.board = new Board({
      io: this.io,
      debug: false,
      repl: false
    });
    done();
  },

  tearDown: function(done) {
    Board.purge();
    done();
  },

  callThroughs: function(test) {
    test.expect(5);

    var a = sinon.spy(Board, "mount");
    var b = sinon.spy(Board.Pins, "normalize");
    var opts = {};

    Board.purge();

    var board = new Board({
      io: this.io,
      debug: false,
      repl: false
    });

    Board.Component.call({}, opts);

    test.equal(a.calledOnce, true);
    test.equal(a.getCall(0).args[0], opts);

    test.equal(b.calledOnce, true);
    test.equal(b.getCall(0).args[0], opts);
    test.equal(b.getCall(0).args[1].id, board.id);


    a.restore();
    b.restore();

    test.done();
  },

  emptyOptsInitialization: function(test) {
    test.expect(3);

    var component = new Board.Component();

    test.equal(component.id, null);
    test.equal(component.board, this.board);
    test.equal(component.io, this.io);

    test.done();
  },

  callEmptyOptsInitialization: function(test) {
    test.expect(3);

    var component = {};

    Board.Component.call(component);

    test.equal(component.id, null);
    test.equal(component.board, this.board);
    test.equal(component.io, this.io);

    test.done();
  },

  explicitIdInitialization: function(test) {
    test.expect(1);

    var component = new Board.Component({
      id: "foo"
    });

    test.equal(component.id, "foo");

    test.done();
  },

  callExplicitIdInitialization: function(test) {
    test.expect(1);

    var component = {};

    Board.Component.call(component, {
      id: "foo"
    });

    test.equal(component.id, "foo");

    test.done();
  },

  singlePinInitialization: function(test) {
    test.expect(1);

    var component = new Board.Component({
      pin: 1
    });

    test.equal(component.pin, 1);

    test.done();
  },

  multiPinInitialization: function(test) {
    test.expect(1);

    var component = new Board.Component({
      pins: [1, 2, 3]
    });

    test.deepEqual(component.pins, [1, 2, 3]);

    test.done();
  },

  explicitPinNormalized: function(test) {
    test.expect(1);

    this.board.io.name = "Foo";
    this.board.io.normalize = function(pin) {
      return Math.pow(pin, 2);
    };

    var component = new Board.Component({
      pin: 2
    });

    test.equal(component.pin, 4);

    test.done();
  },

  componentRegistered: function(test) {
    test.expect(2);

    test.equal(this.board.register.length, 0);

    var component = new Board.Component({
      pin: 2
    });

    test.equal(this.board.register.length, 1);

    test.done();
  },

  componentOccupiedWarning: function(test) {
    test.expect(6);

    var spy = sinon.spy(this.board, "warn");

    test.equal(this.board.occupied.length, 0);

    new Board.Component({
      pin: 2
    });

    test.equal(this.board.occupied.length, 1);
    test.deepEqual(this.board.occupied[0], {
      value: 2, type: "pin"
    });

    new Board.Component({
      pin: 2
    });

    test.equal(spy.calledOnce, true);
    test.deepEqual(spy.getCall(0).args, [ "%s %s already in use", "pin", 2 ]);
    test.equal(this.board.occupied.length, 1);

    test.done();
  },

};
