var MockFirmata = require("./mock-firmata"),
  sinon = require("sinon"),
  pins = require("./mock-pins"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  Board = five.Board,
  Button = five.Button,
  board = new five.Board({
    debug: false,
    repl: false,
    io: new MockFirmata()
  });

exports["Button"] = {
  setUp: function(done) {
    this.digitalRead = sinon.spy(board.io, "digitalRead");
    this.button = new Button({
      pin: 8,
      freq: 5,
      board: board
    });

    this.proto = [];

    this.instance = [{
      name: "isPullup"
    }, {
      name: "invert"
    }, {
      name: "downValue"
    }, {
      name: "upValue"
    }, {
      name: "holdtime"
    }, {
      name: "isDown"
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
      test.equal(typeof this.button[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.button[property.name], "undefined");
    }, this);

    test.done();
  },

  down: function(test) {

    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("down", function() {

      test.ok(true);
      test.done();
    });

    callback(this.button.downValue);
  },

  up: function(test) {

    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("up", function() {

      test.ok(true);
      test.done();
    });
    callback(this.button.downValue);
    callback(this.button.upValue);
  },

  release: function(test) {

    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("release", function() {

      test.ok(true);
      test.done();
    });
    callback(this.button.downValue);
    callback(this.button.upValue);
  }

};
