var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  Board = five.Board,
  sinon = require("sinon"),
  Switch = five.Switch,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Switch"] = {
  setUp: function(done) {

    this.digitalRead = sinon.spy(board.io, "digitalRead");
    this.switch = new Switch({
      pin: 8,
      freq: 5,
      board: board
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
    this.digitalRead.restore();

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
