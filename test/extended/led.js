require("../common/bootstrap");

exports["Led - PWM"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");

    this.led = new Led({
      pin: 11,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    if (this.led && this.led.animation) {
      this.led.animation.stop();
    }
    Board.purge();
    Led.purge();
    this.sandbox.restore();
    done();
  },


  pulse(test) {
    const renderSpy = this.sandbox.spy(this.led, "@@render");
    test.expect(2);

    this.count = 0;
    this.led.pulse({
      duration: 100,
      onloop: () => {
        this.count++;
      }
    });

    setTimeout(() => {
      test.ok(Math.abs(renderSpy.callCount - 61) <= 1);
      test.ok(Math.abs(this.count - 8) <= 1);
      this.led.animation.stop();
      test.done();
    }, 1000);

  },

  pulseCallback(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.led.pulse(100, spy);

    setTimeout(() => {
      test.equal(spy.callCount, 8);
      this.led.animation.stop();
      test.done();
    }, 1000);

  },

  fade(test) {
    const renderSpy = this.sandbox.spy(this.led, "@@render");
    test.expect(2);

    this.led.fade(50, 500);

    setTimeout(() => {
      test.equal(renderSpy.callCount, 31);
      test.ok(Math.abs(this.led.value - 50) < 1);
      this.led.animation.stop();
      test.done();
    }, 500);

  },

  fadeIn(test) {
    test.expect(7);

    test.equal(this.led.value, null);
    test.equal(this.led.isOn, false);
    test.equal(this.led.isRunning, false);

    this.led.fadeIn(100);

    setTimeout(() => {
      test.equal(this.led.isRunning, true);
    }, 50);

    setTimeout(() => {
      test.ok(Math.abs(this.led.value - 255) < 1);
      test.equal(this.led.isOn, true);
      test.equal(this.led.isRunning, false);
      test.done();
    }, 120);

  },

  fadeOut(test) {
    test.expect(7);

    test.equal(this.led.value, null);
    test.equal(this.led.isOn, false);
    test.equal(this.led.isRunning, false);

    this.led.brightness(255);
    this.led.fadeOut(100);

    setTimeout(() => {
      test.equal(this.led.isRunning, true);
    }, 50);

    setTimeout(() => {
      test.ok(Math.abs(this.led.value) < 1);
      test.equal(this.led.isOn, false);
      test.equal(this.led.isRunning, false);
      test.done();
    }, 120);

  },

  fadeCallback(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.led.fade(0, 100, spy);
    setTimeout(() => {
      test.equal(spy.calledOnce, true);
      test.done();
    }, 120);

  },

  fadeInCallback(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.led.fadeIn(100, spy);
    setTimeout(() => {
      test.equal(spy.calledOnce, true);
      test.done();
    }, 120);

  },

  fadeOutCallback(test) {
    test.expect(1);

    const spy = this.sandbox.spy();

    this.led.fadeOut(100, spy);
    setTimeout(() => {
      test.equal(spy.calledOnce, true);
      test.done();
    }, 120);

  },

  isOnTrue(test) {
    // https://github.com/rwaldron/johnny-five/issues/351
    test.expect(3);

    // Start in "off" state
    this.led.off();
    this.led.fade(255, 500);
    setTimeout(() => {
      this.led.stop();

      // After one cycle, the led is on,
      // but stopped so not running
      // and the value left behind is 255
      test.equal(this.led.isOn, true);
      test.equal(this.led.isRunning, false);
      test.ok(Math.abs(this.led.value - 255) < 1);

      test.done();

    }, 500);
  },

  isOnFalse(test) {
    // https://github.com/rwaldron/johnny-five/issues/351
    test.expect(3);

    // Start in "off" state
    this.led.on();
    this.led.fade(0, 500);
    setTimeout(() => {
      this.led.stop();

      // After one cycle, the led is on,
      // but stopped so not running
      // and the value left behind is 255
      test.equal(this.led.isOn, false);
      test.equal(this.led.isRunning, false);
      test.ok(this.led.value === 0);

      test.done();

    }, 520);
  },

  autoMode(test) {
    test.expect(3);

    this.led.mode = 1;
    this.led.brightness(255);
    test.equal(this.led.mode, 3);

    this.led.mode = 1;
    this.led.pulse();
    test.equal(this.led.mode, 3);

    this.led.mode = 1;
    this.led.fade();
    test.equal(this.led.mode, 3);

    test.done();
  }

};
