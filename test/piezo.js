require("./common/bootstrap");

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
  "b8": 7902,
};

exports["Piezo.Parsers.hzFromInput"] = {
  fromNumber: function(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput(7902), 7902);
    test.done();
  },
  fromStringNoModifier: function(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput("c"), 262);
    test.done();
  },
  fromString: function(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput("b8"), 7902);
    test.done();
  },
  fromStringWithOutOctave: function(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput("a#8"), 7459);
    test.done();
  },
  fromStringWithOctave: function(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput("a#8"), 7459);
    test.done();
  },
  fromFirstEntryInArray: function(test) {
    test.expect(2);
    test.equal(Piezo.Parsers.hzFromInput([7902]), 7902);
    test.equal(Piezo.Parsers.hzFromInput(["b8"]), 7902);
    test.done();
  },
  returnsNullForInvalid: function(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput("garbage"), null);
    test.done();
  },
};

exports["Piezo.ToFrequency(tone)"] = {
  conversion: function(test) {
    test.expect(1);
    test.equal(Piezo.ToFrequency(1136), 440);
    test.done();
  },
};

exports["Piezo.ToTone(frequency)"] = {
  conversion: function(test) {
    test.expect(1);
    test.equal(Piezo.ToTone(440), 1136);
    test.done();
  },
};

exports["Piezo.Notes"] = {
  builtin: function(test) {
    test.expect(108);

    Object.keys(notes).forEach(function(note) {
      test.equal(Piezo.Notes[note], notes[note]);
    });

    test.done();
  },
};

exports["Piezo.defaultOctave"] = {
  tearDown: function(done) {
    Piezo.defaultOctave(4);
    done();
  },
  getDefault: function(test) {
    test.expect(1);
    test.equal(Piezo.defaultOctave(), 4);
    test.done();
  },
  setNewDefault: function(test) {
    test.expect(1);
    Piezo.defaultOctave(8);
    test.equal(Piezo.defaultOctave(), 8);
    test.done();
  },
  cannotBreakDefaultOctave: function(test) {
    test.expect(1);
    Piezo.defaultOctave(undefined);
    test.equal(Piezo.defaultOctave(), 4);
    test.done();
  },
};

exports["Piezo"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

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
    Piezo.defaultOctave(4);
    this.sandbox.restore();
    done();
  },

  instanceof: function(test) {
    test.expect(1);
    test.equal(Piezo({}) instanceof Piezo, true);
    test.done();
  },

  controller: function(test) {
    test.expect(1);

    this.pinMode.reset();
    this.piezo = new Piezo({
      controller: "default",
    });

    test.equal(this.pinMode.callCount, 1);
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

  note: function(test) {
    test.expect(4);

    // note delegates to tone;
    var toneSpy = this.sandbox.spy(this.piezo, "tone");

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
    var timerSpy = this.sandbox.spy(this.piezo.timer, "clearInterval");
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
    var toneSpy = this.sandbox.spy(this.piezo, "tone");

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
    var timerSpy = this.sandbox.spy(this.piezo.timer, "clearInterval");

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
    test.expect(7);
    var tempo = 10000; // Make it really fast
    var song = [
      ["c", 1],
      ["d", 2],
      [null, 1],
      672,
      "e4",
      null
    ];

    this.frequency = this.sandbox.spy(this.piezo, "frequency");
    this.piezo.play({
      song: song,
      tempo: tempo // Make it real fast
    }, function() {
      // frequency should get called 4x; not for the null notes
      test.equal(this.frequency.callCount, 4);
      test.ok(this.frequency.neverCalledWith(null));
      // First call should have been with frequency for "c4"
      test.ok(this.frequency.args[0][0] === Piezo.Notes["c4"]);
      // Default duration === tempo if not provided
      test.ok(this.frequency.calledWith(Piezo.Notes["e4"], 60000 / tempo));
      // Duration should change if different beat value given
      test.ok(this.frequency.calledWith(Piezo.Notes["d4"], (60000 / tempo) * 2));
      // OK to pass frequency directly...
      test.ok(this.frequency.calledWith(672, 60000 / tempo));
      // Does not mutate input song array
      test.deepEqual(song, [["c", 1], ["d", 2], [null, 1], 672, "e4", null]);
      test.done();
    }.bind(this));

    this.clock.tick(100);
  },

  playTuneWithStringSongAndBeat: function(test) {
    var tempo = 10000; // Make it really fast
    test.expect(6);
    this.frequency = this.sandbox.spy(this.piezo, "frequency");
    var beats = 0.125;
    this.piezo.play({
      song: "c d d - 672 e4 -",
      beats: beats,
      tempo: tempo // Make it real fast
    }, function() {
      // frequency should get called 4x; not for the null notes
      test.ok(this.frequency.neverCalledWith(null));
      test.equal(this.frequency.callCount, 4);
      // First call should have been with frequency for "c4"
      test.equal(this.frequency.firstCall.args[0], Piezo.Notes["c4"]);
      // Default duration === tempo if not provided
      test.ok(this.frequency.calledWith(Piezo.Notes["e4"], 60000 * beats / tempo));
      // Duration should change if different beat value given
      test.ok(this.frequency.calledWith(Piezo.Notes["d4"], (60000 * beats / tempo) * 2));
      // OK to pass frequency directly...
      test.ok(this.frequency.calledWith(672, 60000 * beats / tempo));
      test.done();
    }.bind(this));

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

  playNormalizesSongNoteFromHz: function(test) {
    test.expect(2);
    this.frequency = this.sandbox.spy(this.piezo, "frequency");
    this.piezo.play({
      song: 262,
    }, function() {
      test.equal(this.frequency.callCount, 1);
      test.equal(this.frequency.lastCall.args[0], 262);
      test.done();
    }.bind(this));

    this.clock.tick(250);
  },

  playWithoutCallback: function(test) {
    test.expect(2);

    var tempo = 10000; // Make it really fast
    var beats = 0.125;

    this.clock.restore();

    this.frequency = this.sandbox.spy(this.piezo, "frequency");
    this.piezo.play({
      song: "c",
      beats: beats,
      tempo: tempo // Make it real fast
    });


    var isPlaying = function() {
      if (this.piezo.isPlaying) {
        setTimeout(isPlaying, 10);
      } else {
        test.equal(this.frequency.callCount, 1);
        test.equal(this.piezo.isPlaying, false);
        test.done();
      }
    }.bind(this);

    isPlaying();

  },

  playTuneSongMissing: function(test) {
    test.expect(2);

    this.clock.restore();
    this.noTone = this.sandbox.spy(this.piezo, "noTone");
    this.frequency = this.sandbox.spy(this.piezo, "frequency");

    this.piezo.play({
      song: null
    }, function() {
      test.equal(this.noTone.callCount, 0);
      test.equal(this.frequency.callCount, 0);
      test.done();
    }.bind(this));
  },

  playTuneSongHasFrequenciesNotNotes: function(test) {
    test.expect(3);

    this.clock.restore();
    this.noTone = this.sandbox.spy(this.piezo, "noTone");
    this.frequency = this.sandbox.spy(this.piezo, "frequency");

    this.piezo.play({
      song: [
        262
      ]
    }, function() {
      test.equal(this.noTone.callCount, 0);
      test.equal(this.frequency.callCount, 1);
      test.equal(this.frequency.lastCall.args[0], 262);
      test.done();
    }.bind(this));
  },

  playANote: function(test) {
    test.expect(3);

    this.clock.restore();
    this.noTone = this.sandbox.spy(this.piezo, "noTone");
    this.frequency = this.sandbox.spy(this.piezo, "frequency");

    this.piezo.play("c", function() {
      test.equal(this.noTone.callCount, 0);
      test.equal(this.frequency.callCount, 1);
      test.equal(this.frequency.lastCall.args[0], 262);
      test.done();
    }.bind(this));
  },


  stop: function(test) {
    test.expect(2);

    var tempo = 10000;
    this.clearTimeout = this.sandbox.stub(global, "clearTimeout");

    var tune = {
      song: [
        ["c4"],
      ],
      tempo: tempo
    };
    this.piezo.play(tune);
    this.piezo.stop();
    test.equal(this.clearTimeout.callCount, 1);

    this.piezo.stop();
    test.equal(this.clearTimeout.callCount, 1);

    test.done();
  },
};

exports["Piezo - Custom Controller"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  canRedefineFrequencyWithController: function(test) {
    test.expect(4);

    var TestController = {
      frequency: {
        writable: true,
        value: function(frequency, duration) {
          test.equal(frequency, 440);
          test.equal(duration, 1000);
        }
      }
    };
    var piezo = new Piezo({
      pin: 3,
      controller: TestController,
      board: this.board
    });
    piezo.frequency(440, 1000);
    piezo.tone(1136, 1000);

    test.done();
  },

  canRedefineToneWithController: function(test) {
    test.expect(4);

    var TestController = {
      tone: {
        writable: true,
        value: function(tone, duration) {
          test.equal(tone, 1136);
          test.equal(duration, 1000);
        }
      }
    };
    var piezo = new Piezo({
      pin: 3,
      controller: TestController,
      board: this.board
    });
    piezo.frequency(440, 1000);
    piezo.tone(1136, 1000);

    test.done();
  },

  throwsIfNeitherToneNorFrequency: function(test) {
    test.expect(2);

    var piezo = new Piezo({
      pin: 3,
      controller: {},
      board: this.board
    });

    test.throws(function() {
      piezo.frequency(440, 1000);
    }.bind(this));

    test.throws(function() {
      piezo.tone(1136, 1000);
    }.bind(this));

    test.done();
  },

  canRedefineNoTone: function(test) {
    test.expect(2);

    var piezo = new Piezo({
      pin: 3,
      controller: {
        noTone: {
          value: function() {
            test.ok(1);
          }
        }
      },
      board: this.board
    });

    piezo.off();
    piezo.noTone();

    test.done();
  },
};


exports["Piezo - I2C Backpack"] = {

  setUp: function(done) {

    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.i2cConfig = this.sandbox.stub(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.stub(MockFirmata.prototype, "i2cWrite");

    this.piezo = new Piezo({
      controller: "I2C_BACKPACK",
      address: 0xff,
      bus: "i2c-1",
      pin: 3,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Piezo({
      controller: "I2C_BACKPACK",
      address: 0xff,
      bus: "i2c-1",
      pin: 2,
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  defaultI2CAddress: function(test) {
    test.expect(2);

    this.i2cConfig.reset();

    new Piezo({
      controller: "I2C_BACKPACK",
      pin: 2,
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0x0A);

    test.done();
  },

  tone: function(test) {
    test.expect(3);

    this.piezo.tone(262, 1000);
    test.equal(this.i2cWrite.callCount, 1);
    test.equal(this.i2cWrite.lastCall.args[0], 0xFF);
    test.deepEqual(this.i2cWrite.lastCall.args[1], [ 1, 3, 1, 6, 0, 0, 3, 232 ]);

    // ...
    test.done();
  },

  hasCustomFrequencyMethody: function(test) {
    test.expect(1);
    // I hope this is enough
    test.notEqual(this.piezo.frequency, Piezo.prototype.frequency);

    test.done();
  },

  toneMissingToneAndDuration: function(test) {
    test.expect(1);

    test.throws(function() {
      this.piezo.tone();
    }.bind(this));

    test.done();
  },

  frequencyArgsPersistToTone: function(test) {
    test.expect(1);

    var tone = this.sandbox.stub(this.piezo, "tone");
    this.piezo.frequency(100, 100);
    test.deepEqual(tone.lastCall.args, [100, 100]);

    test.done();
  },

  noTone: function(test) {
    test.expect(3);

    this.piezo.noTone();
    test.equal(this.i2cWrite.callCount, 1);
    test.equal(this.i2cWrite.lastCall.args[0], 0xFF);
    test.deepEqual(this.i2cWrite.lastCall.args[1], [ 0, 3 ]);

    test.done();
  },
};
