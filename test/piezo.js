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

    this.spy = sinon.spy(this.board.io, "digitalWrite");

    this.piezo = new Piezo({
      pin: 3,
      board: this.board,
      timer: this.timer
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
    done();
  },

  notes: function(test) {
    test.expect(25);

    var notes = {
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
      "c6": 1047
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

  toneStopsAfterTime: function(test) {
    test.expect(2);

    this.piezo.tone(1915, 10);
    var timerSpy = sinon.spy(this.piezo.timer, "clearInterval");

    setTimeout(function() {
      test.ok(timerSpy.called);
      test.equal(this.piezo.timer, undefined);

      test.done();
    }.bind(this), 20);
  },

  toneWhileNewToneIsPlayingCancelsExisting: function(test) {
    test.expect(1);

    this.piezo.tone(1915, 100);
    var timerSpy = sinon.spy(this.piezo.timer, "clearInterval");
    this.piezo.tone(1915, 100);

    test.ok(timerSpy.called);

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
    test.ok(this.spy.calledWith(3, 0));
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
  },

  playTune: function(test) {
    var tempo = 10000; // Make it really fast
    test.expect(6);
    var freqSpy = sinon.spy(this.piezo, "frequency");
    var returned = this.piezo.play({
      song: [
        ["c4", 1],
        ["d4", 2],
        [null, 1],
        672,
        "e4",
        null
      ],
      tempo: tempo // Make it real fast
    });
    setTimeout(function() {
      // frequency should get called 4x; not for the null notes
      test.ok(freqSpy.callCount === 4);
      test.ok(freqSpy.neverCalledWith(null));
      // First call should have been with frequency for 'c4'
      test.ok(freqSpy.args[0][0] === Piezo.Notes["c4"]);
      // Default duration === tempo if not provided
      test.ok(freqSpy.calledWith(Piezo.Notes["e4"], 60000 / tempo));
      // Duration should change if different beat value given
      test.ok(freqSpy.calledWith(Piezo.Notes["d4"], (60000 / tempo) * 2));
      // OK to pass frequency directly...
      test.ok(freqSpy.calledWith(672, 60000 / tempo));
      test.done();
    }.bind(this), 40);
  },

  playSingleNoteTune: function(test) {
    var tempo = 10000;
    test.expect(2);
    var freqSpy = sinon.spy(this.piezo, "frequency");
    var returned = this.piezo.play({
      song: "c4",
      tempo: tempo // Make it real fast
    });
    setTimeout(function() {
      test.ok(freqSpy.calledOnce);
      test.ok(freqSpy.calledWith(Piezo.Notes["c4"], 60000 / tempo));
      test.done();
    }.bind(this), 10);
  },

  playSongWithCallback: function(test) {
    var tempo = 10000,
        myCallback = sinon.spy(),
        tune       = { 
          song: ['c4'],
          tempo: tempo
        };
    test.expect(2);

    var returned = this.piezo.play(tune, myCallback);
    setTimeout(function() {
      test.ok(myCallback.calledOnce);
      test.ok(myCallback.calledWith(tune));
      test.done();
    }.bind(this), 10);
  }
/**
 * This is a slow test by necessity because the default tempo (which can't 
 * be overridden if `play` is invoked with a non-object arg) is 250.
 * It does pass.
 */
 /*
  playSingleNote: function(test) {
    test.expect(2);
    var freqSpy = sinon.spy(this.piezo, "frequency");
    var returned = this.piezo.play("c4");
    setTimeout(function() {
      test.ok(freqSpy.calledOnce);
      test.ok(freqSpy.calledWith(Piezo.Notes["c4"], (60000 / 250)));
      test.done();
    }.bind(this), 260);
  }
  */
};
