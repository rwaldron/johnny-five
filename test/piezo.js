var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./util/mock-firmata"),
  Board = five.Board,
  Piezo = five.Piezo;

exports["Piezo"] = {

  setUp: function(done) {
    this.board = new Board({
      io: new MockFirmata(),
      debug: false,
      repl: false
    });

    this.spy = sinon.spy(this.board.io, "digitalWrite");

    this.piezo = new Piezo({
      pin: 3,
      board: this.board,
      timer: this.timer
    });

    this.proto = [{
      name: "playFrequency",
    }, {
      name: "playNote"
    }, {
      name: "stop"
    }];

    this.instance = [{
      name: "isPlaying"
    }];

    done();
  },

  tearDown: function(done) {
    done();
  },

  notes: function(test) {
    test.expect(108);

    var notes = {
      "c0": 16,
      "c#0": 17,
      "d0": 18,
      "d#0": 19,
      "e0": 21,
      "f0": 22,
      "f#0": 23,
      "g0": 25,
      "g#0": 26,
      "a0": 28,
      "a#0": 29,
      "b0": 31,
      "c1": 33,
      "c#1": 35,
      "d1": 37,
      "d#1": 39,
      "e1": 41,
      "f1": 44,
      "f#1": 47,
      "g1": 49,
      "g#1": 52,
      "a1": 55,
      "a#1": 58,
      "b1": 62,
      "c2": 65,
      "c#2": 69,
      "d2": 73,
      "d#2": 78,
      "e2": 82,
      "f2": 87,
      "f#2": 93,
      "g2": 98,
      "g#2": 104,
      "a2": 110,
      "a#2": 117,
      "b2": 124,
      "c3": 131,
      "c#3": 139,
      "d3": 147,
      "d#3": 156,
      "e3": 165,
      "f3": 175,
      "f#3": 185,
      "g3": 196,
      "g#3": 208,
      "a3": 220,
      "a#3": 233,
      "b3": 247,
      "c4": 262,
      "c#4": 277,
      "d4": 294,
      "d#4": 311,
      "e4": 330,
      "f4": 349,
      "f#4": 370,
      "g4": 392,
      "g#4": 415,
      "a4": 440,
      "a#4": 466,
      "b4": 494,
      "c5": 523,
      "c#5": 554,
      "d5": 587,
      "d#5": 622,
      "e5": 659,
      "f5": 698,
      "f#5": 740,
      "g5": 784,
      "g#5": 831,
      "a5": 880,
      "a#5": 932,
      "b5": 988,
      "c6": 1047,
      "c#6": 1109,
      "d6": 1175,
      "d#6": 1245,
      "e6": 1319,
      "f6": 1397,
      "f#6": 1480,
      "g6": 1568,
      "g#6": 1661,
      "a6": 1760,
      "a#6": 1865,
      "b6": 1976,
      "c7": 2093,
      "c#7": 2217,
      "d7": 2349,
      "d#7": 2489,
      "e7": 2637,
      "f7": 2794,
      "f#7": 2960,
      "g7": 3136,
      "g#7": 3322,
      "a7": 3520,
      "a#7": 3729,
      "b7": 3951,
      "c8": 4186,
      "c#8": 4435,
      "d8": 4699,
      "d#8": 4978,
      "e8": 5274,
      "f8": 5588,
      "f#8": 5920,
      "g8": 6272,
      "g#8": 6645,
      "a8": 7040,
      "a#8": 7459,
      "b8": 7902
    };

    Object.keys(notes).forEach(function(note) {
      test.equal(notes[note], Piezo.Notes[note]);
    });

    test.done();
  },

  beats: function(test) {
    test.expect(4);

    var beats = {
      "2": 2,
      "4": 1,
      "8": 1 / 2,
      "16": 1 / 4
    };

    Object.keys(beats).forEach(function(beat) {
      test.equal(beats[beat], Piezo.Beats[beat]);
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

  pulsePin: function(test) {
    test.expect(2);

    var returned = this.piezo.pulsePin(440, 100);
    test.ok(this.spy.called);
    test.equal(returned, this.piezo);
    test.done();
  },

  playFrequency: function(test) {
    test.expect(2);
    var pulsePin = sinon.spy(this.piezo, "pulsePin");

    var returned = this.piezo.playFrequency(440, 100);
    test.ok(pulsePin.calledWith(1136, 100));
    test.equal(returned, this.piezo);
    test.done();
  },

  playNote: function(test) {
    test.expect(2);
    var pulsePin = sinon.spy(this.piezo, "pulsePin");

    var returned = this.piezo.playNote("a4", 100);
    test.ok(pulsePin.calledWith(1136, 100));
    test.equal(returned, this.piezo);
    test.done();
  },

  playMelody: function(test) {
    test.expect(2);

    var playNoteSpy = sinon.spy(this.piezo, "playNote");

    this.piezo.playMelody("d=8 o=4 b=1000: a a4 8a 8a4", function(err) {
      test.ifError(err);
      test.ok(playNoteSpy.callCount === 4);

      test.done();
    });
  },

  stop: function(test) {
    test.expect(1);

    var returned = this.piezo.stop();
    test.equal(returned, this.piezo);

    test.done();
  },

  off: function(test) {
    test.expect(2);

    var returned = this.piezo.off();

    test.ok(this.spy.calledWith(3, 0));
    test.equal(returned, this.piezo);

    test.done();
  }
};
