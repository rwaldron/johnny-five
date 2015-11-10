var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata,
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board;

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

var defaultController = {
  requirements: {
    value: {
      options: {
        thing: {
          throws: false,
          message: "message",
          typeof: "number"
        }
      }
    }
  }
};

exports["Board.Controller"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.odp = this.sandbox.spy(Object, "defineProperties");
    this.warn = this.sandbox.stub(Board.prototype, "warn");
    this.board = newBoard();

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  noRequirements: function(test) {
    test.expect(1);

    var context = {};
    var controller = {};
    var options = {};

    this.odp.reset();

    Board.Controller.call(context, controller, options);

    test.equal(this.odp.callCount, 1);

    test.done();
  },

  requirementsPresent: function(test) {
    test.expect(2);

    var context = {
      board: this.board
    };
    var controller = Object.assign({}, defaultController);
    var options = { thing: 1 };

    this.odp.reset();

    Board.Controller.call(context, controller, options);

    test.equal(this.warn.callCount, 0);
    test.equal(this.odp.callCount, 1);

    test.done();
  },

  requirementsMissingWarning: function(test) {
    test.expect(4);

    var context = {
      board: this.board
    };
    var controller = Object.assign({}, defaultController);
    var options = {};

    this.odp.reset();

    Board.Controller.call(context, controller, options);

    test.equal(this.warn.getCall(0).args[0], "Object");
    test.equal(this.warn.getCall(0).args[1], "message");
    test.equal(this.warn.callCount, 1);
    test.equal(this.odp.callCount, 1);

    test.done();
  },

  requirementsMissingThrows: function(test) {
    test.expect(3);

    var context = {
      board: this.board
    };
    var controller = Object.assign({}, defaultController);
    var options = {};

    this.odp.reset();

    controller.requirements.value.options.thing.throws = true;

    test.throws(function() {
      Board.Controller.call(context, controller, options);
    });


    test.equal(this.warn.callCount, 0);
    test.equal(this.odp.callCount, 0);

    test.done();
  },


};
