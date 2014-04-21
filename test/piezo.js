var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./mock-firmata"),
  Board = five.Board,
  Piezo = five.Piezo;

exports["Piezo"] = {

  setUp: function(done) {
    this.board = new Board({
      io: new MockFirmata(),
      debug: false,
      repl: false
    });

    this.clock = sinon.useFakeTimers();
    this.spy = sinon.spy(this.board.io, "digitalWrite");

    this.piezo = new Piezo({
      pin: 3,
      board: this.board
    });

    this.proto = [{
      name: "tone"
    }, {
      name: "noTone"
    }, {
      name: "off"
    }, {
      name: "song"
    }];

    this.instance = [{
      name: "isPlaying"
    }];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();

    done();
  },

  notes: function(test) {
    test.expect(8);

    var notes = {
      "c": 1915,
      "d": 1700,
      "e": 1519,
      "f": 1432,
      "g": 1275,
      "a": 1136,
      "b": 1014,
      "C": 956
    };

    Object.keys(notes).forEach(function(note) {
      test.equal(notes[note], Piezo.Notes[note]);
    });

    test.done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.piezo[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.piezo[property.name], "undefined");
    }, this);

    test.done();
  },

  tone: function(test) {
    test.expect(2);

    var returned = this.piezo.tone(1915, 1000);
    test.ok(this.spy.called);
    test.equal(returned, this.piezo);

    test.done();
  },

  noTone: function(test) {
    test.expect(2);

    var returned = this.piezo.noTone();
    test.ok(this.spy.calledWith(3, 0));
    test.equal(returned, this.piezo);

    test.done();
  },

  song: function(test) {
    test.expect(3);

    var returned = this.piezo.song(" ", "1");
    test.ok(this.spy.calledWith(3, 0));
    test.equal(returned, this.piezo);


    this.piezo.song(" ", [1]);
    test.ok(this.spy.calledWith(3, 0));

    test.done();
  }
};
