/* Possibly-slow piezo tests */
var five = require("../../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("../util/mock-firmata"),
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

  toneStopsAfterTime: function(test) {
    test.expect(2);

    this.piezo.tone(1915, 10);
    var timerSpy = sinon.spy(this.piezo.timer, "clearInterval");

    setTimeout(function() {
      test.ok(timerSpy.called);
      test.equal(this.piezo.timer, undefined);

      test.done();
    }.bind(this), 30);
  },

  playSingleNoteTune: function(test) {
    var tempo = 10000;
    test.expect(2);
    var freqSpy = sinon.spy(this.piezo, "frequency");
    this.piezo.play({
      song: "c4",
      tempo: tempo // Make it real fast
    });
    setTimeout(function() {
      test.ok(freqSpy.calledOnce);
      test.ok(freqSpy.calledWith(Piezo.Notes["c4"], 60000 / tempo));
      test.done();
    }.bind(this), 10);
  },

  playSingleNoteTuneNoOctave: function(test) {
    var tempo = 10000;
    test.expect(2);
    var freqSpy = sinon.spy(this.piezo, "frequency");
    this.piezo.play({
      song: "c#",
      tempo: tempo // Make it real fast
    });
    setTimeout(function() {
      test.ok(freqSpy.calledOnce);
      test.ok(freqSpy.calledWith(Piezo.Notes["c#4"], 60000 / tempo));
      test.done();
    }.bind(this), 10);
  },

  playSongWithCallback: function(test) {
    var tempo = 10000,
      myCallback = sinon.spy(),
      tune = {
        song: ["c4"],
        tempo: tempo
      };
    test.expect(2);

    this.piezo.play(tune, myCallback);
    setTimeout(function() {
      test.ok(myCallback.calledOnce);
      test.ok(myCallback.calledWith(tune));
      test.done();
    }.bind(this), 10);
  },

  /**
   * This is a slow test by necessity because the default tempo (which can"t
   * be overridden if `play` is invoked with a non-object arg) is 250.
   */

  playSingleNote: function(test) {
    test.expect(2);
    var freqSpy = sinon.spy(this.piezo, "frequency");
    this.piezo.play("c4");
    setTimeout(function() {
      test.ok(freqSpy.calledOnce);
      test.ok(freqSpy.calledWith(Piezo.Notes["c4"], (60000 / 250)));
      test.done();
    }.bind(this), 260);
  }

};
