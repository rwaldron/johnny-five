var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./util/mock-firmata"),
  Board = five.Board,
  Piezo = five.Piezo;

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

exports["Piezo"] = {

  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();

    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");

    this.piezo = new Piezo({
      pin: 3,
      board: this.board
    });

    this.proto = [{
      name: "frequency",
    }, {
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
    Board.purge();
    this.piezo.defaultOctave(4);
    restore(this);
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

  defaultOctave: function(test) {
    test.expect(6);

    // 4 is the default.
    test.equal(4, this.piezo.defaultOctave());

    // Changes are returned as well as stored.
    test.equal(5, this.piezo.defaultOctave(5));

    // 0 - 9 only, remembers last good value.
    test.equal(5, this.piezo.defaultOctave(-1));
    test.equal(5, this.piezo.defaultOctave(9));
    test.equal(5, this.piezo.defaultOctave("foo"));
    test.equal(5, this.piezo.defaultOctave(null));

    test.done();
  },

  note: function(test) {
    test.expect(4);

    // note delegates to tone;
    var toneSpy = sinon.spy(this.piezo, "tone");

    // accepts octave.
    test.equal(this.piezo.note("c4", 100), this.piezo);
    test.ok(toneSpy.calledWith(262, 100));

    // or not.
    test.equal(this.piezo.note("c#", 100), this.piezo);
    test.ok(toneSpy.calledWith(277, 100));

    test.done();
  },

  tone: function(test) {
    test.expect(2);

    var returned = this.piezo.tone(1915, 1000);

    this.clock.tick(100);

    test.ok(this.digitalWrite.called);
    test.equal(returned, this.piezo);

    test.done();
  },

  toneWhileNewToneIsPlayingCancelsExisting: function(test) {
    test.expect(1);

    this.piezo.tone(1915, 100);
    var timerSpy = sinon.spy(this.piezo.timer, "clearInterval");
    this.piezo.tone(1915, 100);

    test.ok(timerSpy.called);

    test.done();
  },

  toneRejectsWonkyToneValues: function(test) {
    var lameValues = [
      ["florp", 5],
      ["ding", "dong"],
      ["c4", "zimple"],
      ["?", "foof"]
      //  ["C4", 1][null, 1/2] // Original bad value; jshint won't allow
    ];
    test.expect(lameValues.length);
    lameValues.forEach(function(element) {
      try {
        if (element && element.length) {
          this.piezo.tone(element[0], element[1]);
        } else {
          this.piezo.tone(element);
        }
      } catch (e) {
        test.equal(e.message, "Piezo.tone: invalid tone or duration");
      }
    }, this);
    test.done();
  },

  toneLovesHappyValues: function(test) {
    test.expect(1);
    var happy = this.piezo.tone(350, 500);
    test.equal(happy, this.piezo); // tone returns piezo obj when happy
    test.done();
  },

  frequency: function(test) {
    test.expect(2);
    var toneSpy = sinon.spy(this.piezo, "tone");

    var returned = this.piezo.frequency(440, 100);
    test.ok(toneSpy.calledWith(1136, 100));
    test.equal(returned, this.piezo);
    test.done();
  },

  noTone: function(test) {
    test.expect(2);

    var returned = this.piezo.noTone();
    test.ok(this.digitalWrite.calledWith(3, 0));
    test.equal(returned, this.piezo);

    test.done();
  },

  noToneStopsExistingTone: function(test) {
    test.expect(2);

    this.piezo.tone(500, 1000);
    var timerSpy = sinon.spy(this.piezo.timer, "clearInterval");

    this.piezo.noTone();
    test.ok(timerSpy.called);
    test.equal(this.piezo.timer, undefined);

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
    test.ok(this.digitalWrite.calledWith(3, 0));
    test.equal(returned, this.piezo);


    this.piezo.play({
      song: [
        [] // No tone
      ],
      tempo: 150
    });
    test.ok(this.digitalWrite.calledWith(3, 0));

    test.done();
  },

  playTune: function(test) {
    var tempo = 10000; // Make it really fast
    test.expect(6);
    var freqSpy = sinon.spy(this.piezo, "frequency");
    this.piezo.play({
      song: [
        ["c", 1],
        ["d", 2],
        [null, 1],
        672,
        "e4",
        null
      ],
      tempo: tempo // Make it real fast
    }, function() {
      // frequency should get called 4x; not for the null notes
      test.ok(freqSpy.callCount === 4);
      test.ok(freqSpy.neverCalledWith(null));
      // First call should have been with frequency for "c4"
      test.ok(freqSpy.args[0][0] === Piezo.Notes["c4"]);
      // Default duration === tempo if not provided
      test.ok(freqSpy.calledWith(Piezo.Notes["e4"], 60000 / tempo));
      // Duration should change if different beat value given
      test.ok(freqSpy.calledWith(Piezo.Notes["d4"], (60000 / tempo) * 2));
      // OK to pass frequency directly...
      test.ok(freqSpy.calledWith(672, 60000 / tempo));
      test.done();
    });

    this.clock.tick(100);
  },

  playTuneWithStringSongAndBeat: function(test) {
    var tempo = 10000; // Make it really fast
    test.expect(6);
    var freqSpy = sinon.spy(this.piezo, "frequency");
    var beats = 0.125;
    this.piezo.play({
      song: "c d d - 672 e4 -",
      beats: beats,
      tempo: tempo // Make it real fast
    }, function() {
      // frequency should get called 4x; not for the null notes
      test.ok(freqSpy.callCount === 4);
      test.ok(freqSpy.neverCalledWith(null));
      // First call should have been with frequency for "c4"
      test.ok(freqSpy.args[0][0] === Piezo.Notes["c4"]);
      // Default duration === tempo if not provided
      test.ok(freqSpy.calledWith(Piezo.Notes["e4"], 60000 * beats / tempo));
      // Duration should change if different beat value given
      test.ok(freqSpy.calledWith(Piezo.Notes["d4"], (60000 * beats / tempo) * 2));
      // OK to pass frequency directly...
      test.ok(freqSpy.calledWith(672, 60000 * beats / tempo));
      test.done();
    });

    this.clock.tick(100);
  },

  playCanDealWithWonkyValues: function(test) {
    var tempo = 10000,
      tune = {
        song: [
          ["c4"],
          ["drunk"],
          ["d4", 0]
        ],
        tempo: tempo
      };
    test.expect(1);

    this.piezo.play(tune, function() {
      test.ok(1); // We made it this far, no choking on bad values
      test.done();
    }.bind(this));

    this.clock.tick(100);
  },
};
