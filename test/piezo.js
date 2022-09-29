require("./common/bootstrap");

const notes = {
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
  fromNumber(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput(7902), 7902);
    test.done();
  },
  fromStringNoModifier(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput("c"), 262);
    test.done();
  },
  fromString(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput("b8"), 7902);
    test.done();
  },
  fromStringWithOutOctave(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput("a#8"), 7459);
    test.done();
  },
  fromStringWithOctave(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput("a#8"), 7459);
    test.done();
  },
  fromFirstEntryInArray(test) {
    test.expect(2);
    test.equal(Piezo.Parsers.hzFromInput([7902]), 7902);
    test.equal(Piezo.Parsers.hzFromInput(["b8"]), 7902);
    test.done();
  },
  returnsNullForInvalid(test) {
    test.expect(1);
    test.equal(Piezo.Parsers.hzFromInput("garbage"), null);
    test.done();
  },
};

exports["Piezo.ToFrequency(tone)"] = {
  conversion(test) {
    test.expect(1);
    test.equal(Piezo.ToFrequency(1136), 440);
    test.done();
  },
};

exports["Piezo.ToTone(frequency)"] = {
  conversion(test) {
    test.expect(1);
    test.equal(Piezo.ToTone(440), 1136);
    test.done();
  },
};

exports["Piezo.Notes"] = {
  builtin(test) {
    test.expect(108);

    Object.keys(notes).forEach(note => {
      test.equal(Piezo.Notes[note], notes[note]);
    });

    test.done();
  },
};

exports["Piezo.defaultOctave"] = {
  tearDown(done) {
    Piezo.defaultOctave(4);
    done();
  },
  getDefault(test) {
    test.expect(1);
    test.equal(Piezo.defaultOctave(), 4);
    test.done();
  },
  setNewDefault(test) {
    test.expect(1);
    Piezo.defaultOctave(8);
    test.equal(Piezo.defaultOctave(), 8);
    test.done();
  },
  cannotBreakDefaultOctave(test) {
    test.expect(1);
    Piezo.defaultOctave(undefined);
    test.equal(Piezo.defaultOctave(), 4);
    test.done();
  },
};

exports["Piezo"] = {

  setUp(done) {
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

  tearDown(done) {
    Board.purge();
    Piezo.defaultOctave(4);
    this.sandbox.restore();
    done();
  },

  instanceof(test) {
    test.expect(1);
    test.equal(new Piezo({}) instanceof Piezo, true);
    test.done();
  },

  controller(test) {
    test.expect(1);

    this.pinMode.reset();
    this.piezo = new Piezo({
      controller: "default",
    });

    test.equal(this.pinMode.callCount, 1);
    test.done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.piezo[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.piezo[name], 0));

    test.done();
  },

  note(test) {
    test.expect(10);

    // note delegates to frequency, which delegates to tone;
    const toneSpy = this.sandbox.spy(this.piezo, "tone");
    const frequencySpy = this.sandbox.spy(this.piezo, "frequency");

    // Accepts an octave number as part of the note name (the "4" in "a4")
    // A4 = 440Hz = 1136μs duty cycle (half-period)
    const returnValue = this.piezo.note("a4", 100);
    test.deepEqual(frequencySpy.getCall(0).args, [440, 100]);
    test.deepEqual(toneSpy.getCall(0).args, [1136, 100]);
    test.equal(returnValue, this.piezo);

    // Changing the note letter plays a different note
    // C4 = 262Hz = 1908μs duty
    this.piezo.note("c4", 100);
    test.deepEqual(frequencySpy.getCall(1).args, [262, 100]);
    test.deepEqual(toneSpy.getCall(1).args, [1908, 100]);

    // Changing the octave number also plays a different note
    // C2 = 65Hz = 7692μs duty
    this.piezo.note("c2", 100);
    test.deepEqual(frequencySpy.getCall(2).args, [65, 100]);
    test.deepEqual(toneSpy.getCall(2).args, [7692, 100]);

    // If no octave number is provided, the default octave will be
    // assumed - and by default, the default octave is 4.
    // A4 = 440Hz = 1136μs duty
    this.piezo.note("a", 100);
    test.equal(Piezo.defaultOctave(), 4);
    test.deepEqual(frequencySpy.getCall(3).args, [440, 100]);
    test.deepEqual(toneSpy.getCall(3).args, [1136, 100]);

    test.done();
  },

  noteIsCaseInsensitive(test) {
    const noteNames = Object.keys(Piezo.Notes);
    test.expect(2 * noteNames.length);

    const frequencySpy = this.sandbox.spy(this.piezo, "frequency");

    // Test every supported note in lowercase (a4) and uppercase (A4)
    noteNames.forEach(note => {
      const expectedFrequency = Piezo.Notes[note];

      this.piezo.note(note.toLowerCase(), 100);
      test.equal(frequencySpy.getCall(frequencySpy.callCount-1).args[0], expectedFrequency);

      this.piezo.note(note.toUpperCase(), 100);
      test.equal(frequencySpy.getCall(frequencySpy.callCount-1).args[0], expectedFrequency);
    });

    test.done();
  },

  tone(test) {
    test.expect(2);

    const returned = this.piezo.tone(1915, 1000);

    this.clock.tick(100);

    test.ok(this.digitalWrite.called);
    test.equal(returned, this.piezo);

    test.done();
  },

  toneWhileNewToneIsPlayingCancelsExisting(test) {
    test.expect(1);

    this.piezo.tone(1915, 100);
    const timerSpy = this.sandbox.spy(this.piezo.timer, "clearInterval");
    this.piezo.tone(1915, 100);

    test.ok(timerSpy.called);

    test.done();
  },

  toneRejectsWonkyToneValues(test) {
    const lameValues = [
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

  toneLovesHappyValues(test) {
    test.expect(1);
    const happy = this.piezo.tone(350, 500);
    test.equal(happy, this.piezo); // tone returns piezo obj when happy
    test.done();
  },

  frequency(test) {
    test.expect(6);
    const toneSpy = this.sandbox.spy(this.piezo, "tone");

    // C4 = 262Hz = 1908μs duty cycle (half-period)
    let returned = this.piezo.frequency(262, 100);
    test.deepEqual(toneSpy.getCall(0).args, [1908, 100]);
    test.equal(returned, this.piezo);

    // A4 = 440Hz = 1136μs duty
    returned = this.piezo.frequency(440, 100);
    test.deepEqual(toneSpy.getCall(1).args, [1136, 100]);
    test.equal(returned, this.piezo);

    // C2 = 65Hz = 7692μs duty
    returned = this.piezo.frequency(65, 100);
    test.deepEqual(toneSpy.getCall(2).args, [7692, 100]);
    test.equal(returned, this.piezo);

    test.done();
  },


  noTone(test) {
    test.expect(2);

    const returned = this.piezo.noTone();
    test.ok(this.digitalWrite.calledWith(3, 0));
    test.equal(returned, this.piezo);

    test.done();
  },

  noToneStopsExistingTone(test) {
    test.expect(2);

    this.piezo.tone(500, 1000);
    const timerSpy = this.sandbox.spy(this.piezo.timer, "clearInterval");

    this.piezo.noTone();
    test.ok(timerSpy.called);
    test.equal(this.piezo.timer, undefined);

    test.done();
  },

  play(test) {
    test.expect(3);

    const returned = this.piezo.play({
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

  playTune(test) {
    test.expect(7);
    const tempo = 10000; // Make it really fast
    const song = [
      ["c", 1],
      ["d", 2],
      [null, 1],
      672,
      "e4",
      null
    ];

    this.frequency = this.sandbox.spy(this.piezo, "frequency");
    this.piezo.play({
      song,
      tempo // Make it real fast
    }, () => {
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
    });

    this.clock.tick(100);
  },

  playTuneWithStringSongAndBeat(test) {
    const tempo = 10000; // Make it really fast
    test.expect(6);
    this.frequency = this.sandbox.spy(this.piezo, "frequency");
    const beats = 0.125;
    this.piezo.play({
      song: "c d d - 672 e4 -",
      beats,
      tempo // Make it real fast
    }, () => {
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
    });

    this.clock.tick(100);
  },

  playCanDealWithWonkyValues(test) {
    const tempo = 10000;

    const tune = {
      song: [
        ["c4"],
        ["drunk"],
        ["d4", 0]
      ],
      tempo
    };

    test.expect(1);

    this.piezo.play(tune, () => {
      test.ok(1); // We made it this far, no choking on bad values
      test.done();
    });

    this.clock.tick(100);
  },

  playNormalizesSongNoteFromHz(test) {
    test.expect(2);
    this.frequency = this.sandbox.spy(this.piezo, "frequency");
    this.piezo.play({
      song: 262,
    }, () => {
      test.equal(this.frequency.callCount, 1);
      test.equal(this.frequency.lastCall.args[0], 262);
      test.done();
    });

    this.clock.tick(250);
  },

  playWithoutCallback(test) {
    test.expect(2);

    const tempo = 10000; // Make it really fast
    const beats = 0.125;

    this.clock.restore();

    this.frequency = this.sandbox.spy(this.piezo, "frequency");
    this.piezo.play({
      song: "c",
      beats,
      tempo // Make it real fast
    });


    const isPlaying = () => {
      if (this.piezo.isPlaying) {
        setTimeout(isPlaying, 10);
      } else {
        test.equal(this.frequency.callCount, 1);
        test.equal(this.piezo.isPlaying, false);
        test.done();
      }
    };

    isPlaying();

  },

  playTuneSongMissing(test) {
    test.expect(2);

    this.clock.restore();
    this.noTone = this.sandbox.spy(this.piezo, "noTone");
    this.frequency = this.sandbox.spy(this.piezo, "frequency");

    this.piezo.play({
      song: null
    }, () => {
      test.equal(this.noTone.callCount, 0);
      test.equal(this.frequency.callCount, 0);
      test.done();
    });
  },

  playTuneSongHasFrequenciesNotNotes(test) {
    test.expect(3);

    this.clock.restore();
    this.noTone = this.sandbox.spy(this.piezo, "noTone");
    this.frequency = this.sandbox.spy(this.piezo, "frequency");

    this.piezo.play({
      song: [
        262
      ]
    }, () => {
      test.equal(this.noTone.callCount, 0);
      test.equal(this.frequency.callCount, 1);
      test.equal(this.frequency.lastCall.args[0], 262);
      test.done();
    });
  },

  playANote(test) {
    test.expect(3);

    this.clock.restore();
    this.noTone = this.sandbox.spy(this.piezo, "noTone");
    this.frequency = this.sandbox.spy(this.piezo, "frequency");

    this.piezo.play("c", () => {
      test.equal(this.noTone.callCount, 0);
      test.equal(this.frequency.callCount, 1);
      test.equal(this.frequency.lastCall.args[0], 262);
      test.done();
    });
  },


  stop(test) {
    test.expect(2);

    const tempo = 10000;
    this.clearTimeout = this.sandbox.stub(global, "clearTimeout");

    const tune = {
      song: [
        ["c4"],
      ],
      tempo
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

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  canRedefineFrequencyWithController(test) {
    test.expect(4);

    const TestController = {
      frequency: {
        writable: true,
        value(frequency, duration) {
          test.equal(frequency, 440);
          test.equal(duration, 1000);
        }
      }
    };
    const piezo = new Piezo({
      pin: 3,
      controller: TestController,
      board: this.board
    });
    piezo.frequency(440, 1000);
    piezo.tone(1136, 1000);

    test.done();
  },

  canRedefineToneWithController(test) {
    test.expect(4);

    const TestController = {
      tone: {
        writable: true,
        value(tone, duration) {
          test.equal(tone, 1136);
          test.equal(duration, 1000);
        }
      }
    };
    const piezo = new Piezo({
      pin: 3,
      controller: TestController,
      board: this.board
    });
    piezo.frequency(440, 1000);
    piezo.tone(1136, 1000);

    test.done();
  },

  throwsIfNeitherToneNorFrequency(test) {
    test.expect(2);

    const piezo = new Piezo({
      pin: 3,
      controller: {},
      board: this.board
    });

    test.throws(() => {
      piezo.frequency(440, 1000);
    });

    test.throws(() => {
      piezo.tone(1136, 1000);
    });

    test.done();
  },

  canRedefineNoTone(test) {
    test.expect(2);

    const piezo = new Piezo({
      pin: 3,
      controller: {
        noTone: {
          value() {
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

  setUp(done) {

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

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Piezo({
      controller: "I2C_BACKPACK",
      address: 0xff,
      bus: "i2c-1",
      pin: 2,
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  defaultI2CAddress(test) {
    test.expect(2);

    this.i2cConfig.reset();

    new Piezo({
      controller: "I2C_BACKPACK",
      pin: 2,
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0x0A);

    test.done();
  },

  tone(test) {
    test.expect(3);

    // C4 = 262Hz = 1908μs duty cycle (half-period)
    this.piezo.tone(1908, 1000);
    test.equal(this.i2cWrite.callCount, 1);
    test.equal(this.i2cWrite.lastCall.args[0], 0xFF);
    test.deepEqual(this.i2cWrite.lastCall.args[1], [ 1, 3, 7, 116, 0, 0, 3, 232 ]);

    // ...
    test.done();
  },

  toneMissingToneAndDuration(test) {
    test.expect(1);

    test.throws(() => {
      this.piezo.tone();
    });

    test.done();
  },

  noTone(test) {
    test.expect(3);

    this.piezo.noTone();
    test.equal(this.i2cWrite.callCount, 1);
    test.equal(this.i2cWrite.lastCall.args[0], 0xFF);
    test.deepEqual(this.i2cWrite.lastCall.args[1], [ 0, 3 ]);

    test.done();
  },
};
