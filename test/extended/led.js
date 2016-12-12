require("../common/bootstrap");

exports["Led - PWM"] = {
  setUp: function(done) {
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

  tearDown: function(done) {
    if (this.led && this.led.animation) {
      this.led.animation.stop();
    }
    Board.purge();
    Led.purge();
    this.sandbox.restore();
    done();
  },


  pulse: function(test) {
    var renderSpy = this.sandbox.spy(this.led, "@@render");
    test.expect(2);

    this.count = 0;
    this.led.pulse({
      duration: 100,
      onloop: function() {
        this.count++;
      }.bind(this)
    });

    setTimeout(function() {
      test.ok(Math.abs(renderSpy.callCount - 61) <= 1);
      test.ok(Math.abs(this.count - 8) <= 1);
      this.led.animation.stop();
      test.done();
    }.bind(this), 1000);

  },

  pulseCallback: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.led.pulse(100, spy);

    setTimeout(function() {
      test.equal(spy.callCount, 8);
      this.led.animation.stop();
      test.done();
    }.bind(this), 1000);

  },

  fade: function(test) {
    var renderSpy = this.sandbox.spy(this.led, "@@render");
    test.expect(2);

    this.led.fade(50, 500);

    setTimeout(function() {
      test.equal(renderSpy.callCount, 31);
      test.ok(Math.abs(this.led.value - 50) < 1);
      this.led.animation.stop();
      test.done();
    }.bind(this), 500);

  },

  fadeIn: function(test) {
    test.expect(7);

    test.equal(this.led.value, null);
    test.equal(this.led.isOn, false);
    test.equal(this.led.isRunning, false);

    this.led.fadeIn(100);

    setTimeout(function() {
      test.equal(this.led.isRunning, true);
    }.bind(this), 50);

    setTimeout(function() {
      test.ok(Math.abs(this.led.value - 255) < 1);
      test.equal(this.led.isOn, true);
      test.equal(this.led.isRunning, false);
      test.done();
    }.bind(this), 120);

  },

  fadeOut: function(test) {
    test.expect(7);

    test.equal(this.led.value, null);
    test.equal(this.led.isOn, false);
    test.equal(this.led.isRunning, false);

    this.led.brightness(255);
    this.led.fadeOut(100);

    setTimeout(function() {
      test.equal(this.led.isRunning, true);
    }.bind(this), 50);

    setTimeout(function() {
      test.ok(Math.abs(this.led.value) < 1);
      test.equal(this.led.isOn, false);
      test.equal(this.led.isRunning, false);
      test.done();
    }.bind(this), 120);

  },

  fadeCallback: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.led.fade(0, 100, spy);
    setTimeout(function() {
      test.equal(spy.calledOnce, true);
      test.done();
    }.bind(this), 120);

  },

  fadeInCallback: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.led.fadeIn(100, spy);
    setTimeout(function() {
      test.equal(spy.calledOnce, true);
      test.done();
    }.bind(this), 120);

  },

  fadeOutCallback: function(test) {
    test.expect(1);

    var spy = this.sandbox.spy();

    this.led.fadeOut(100, spy);
    setTimeout(function() {
      test.equal(spy.calledOnce, true);
      test.done();
    }.bind(this), 120);

  },

  isOnTrue: function(test) {
    // https://github.com/rwaldron/johnny-five/issues/351
    test.expect(3);

    // Start in "off" state
    this.led.off();
    this.led.fade(255, 500);
    setTimeout(function() {
      this.led.stop();

      // After one cycle, the led is on,
      // but stopped so not running
      // and the value left behind is 255
      test.equal(this.led.isOn, true);
      test.equal(this.led.isRunning, false);
      test.ok(Math.abs(this.led.value - 255) < 1);

      test.done();

    }.bind(this), 500);
  },

  isOnFalse: function(test) {
    // https://github.com/rwaldron/johnny-five/issues/351
    test.expect(3);

    // Start in "off" state
    this.led.on();
    this.led.fade(0, 500);
    setTimeout(function() {
      this.led.stop();

      // After one cycle, the led is on,
      // but stopped so not running
      // and the value left behind is 255
      test.equal(this.led.isOn, false);
      test.equal(this.led.isRunning, false);
      test.ok(this.led.value === 0);

      test.done();

    }.bind(this), 520);
  },

  autoMode: function(test) {
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
