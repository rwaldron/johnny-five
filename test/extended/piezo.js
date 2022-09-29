require("../common/bootstrap");

exports["Piezo"] = {

  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

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

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },
  toneStopsAfterTime(test) {
    test.expect(2);

    this.piezo.tone(1915, 10);
    const timerSpy = this.sandbox.spy(this.piezo.timer, "clearInterval");

    setTimeout(() => {
      test.ok(timerSpy.called);
      test.equal(this.piezo.timer, undefined);

      test.done();
    }, 30);
  },

  playSingleNoteTune(test) {
    const tempo = 10000;
    test.expect(2);
    const freqSpy = this.sandbox.spy(this.piezo, "frequency");
    this.piezo.play({
      song: "c4",
      tempo // Make it real fast
    });
    setTimeout(() => {
      test.ok(freqSpy.calledOnce);
      test.ok(freqSpy.calledWith(Piezo.Notes["c4"], 60000 / tempo));
      test.done();
    }, 10);
  },

  playSingleNoteTuneNoOctave(test) {
    const tempo = 10000;
    test.expect(2);
    const freqSpy = this.sandbox.spy(this.piezo, "frequency");
    this.piezo.play({
      song: "c#",
      tempo // Make it real fast
    });
    setTimeout(() => {
      test.ok(freqSpy.calledOnce);
      test.ok(freqSpy.calledWith(Piezo.Notes["c#4"], 60000 / tempo));
      test.done();
    }, 10);
  },

  playSongWithCallback(test) {
    const tempo = 10000;
    const myCallback = this.sandbox.spy();

    const tune = {
      song: ["c4"],
      tempo
    };

    test.expect(2);

    this.piezo.play(tune, myCallback);
    setTimeout(() => {
      test.ok(myCallback.calledOnce);
      test.ok(myCallback.calledWith(tune));
      test.done();
    }, 10);
  },

  /**
   * This is a slow test by necessity because the default tempo (which can"t
   * be overridden if `play` is invoked with a non-object arg) is 250.
   */

  playSingleNote(test) {
    test.expect(2);
    const freqSpy = this.sandbox.spy(this.piezo, "frequency");
    this.piezo.play("c4");
    setTimeout(() => {
      test.ok(freqSpy.calledOnce);
      test.ok(freqSpy.calledWith(Piezo.Notes["c4"], (60000 / 250)));
      test.done();
    }, 260);
  }

};
