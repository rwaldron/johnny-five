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
      name: "play"
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
    test.expect(25);

    var notes = {
      "c4": 1911,
      "c#4": 1803,
      "d4": 1702,
      "d#4": 1607,
      "e4": 1516,
      "f4": 1431,
      "f#4": 1352,
      "g4": 1275,
      "g#4": 1203,
      "a4": 1136,
      "a#4": 1072,
      "b4": 1012,
      "c5": 955,
      "c#5": 901,
      "d5": 851,
      "d#5": 803,
      "e5": 768,
      "f5": 715,
      "f#5": 675,
      "g5": 647,
      "g#5": 601,
      "a5": 568,
      "a#5": 541,
      "b5": 506,
      "c6": 477
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

  play: function(test) {
    test.expect(3);

    var returned = this.piezo.play({
      song: [
        [] // No tone

      ],
      tempo: 150
    });
    test.ok(this.spy.calledWith(3, 0));
    test.equal(returned, this.piezo);


    this.piezo.play({
      song: [
        [] // No tone
      ],
      tempo: 150
    });
    test.ok(this.spy.calledWith(3, 0));

    test.done();
  }
};
