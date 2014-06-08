var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./mock-firmata"),
  Board = five.Board,
  Led = five.Led;

function newBoard() {
  return new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });
}

exports["Led - Digital"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.spy = sinon.spy(this.board.io, "digitalWrite");

    this.led = new Led({
      pin: 13,
      board: this.board
    });

    this.proto = [{
      name: "on"
    }, {
      name: "off"
    }, {
      name: "toggle"
    }, {
      name: "brightness"
    }, {
      name: "pulse"
    }, {
      name: "fade"
    }, {
      name: "fadeIn"
    }, {
      name: "fadeOut"
    }, {
      name: "strobe"
    }, {
      name: "blink"
    }, {
      name: "stop"
    }];

    this.instance = [{
      name: "id"
    }, {
      name: "pin"
    }, {
      name: "value"
    }, {
      name: "interval"
    }, {
      name: "mode"
    }];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.led[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.led[property.name], "undefined");
    }, this);

    test.done();
  },

  defaultMode: function(test) {
    test.expect(1);
    test.equal(this.led.mode, 1);
    test.done();
  },

  on: function(test) {
    test.expect(1);

    this.led.on();
    test.ok(this.spy.calledWith(13, 1));

    test.done();
  },

  off: function(test) {
    test.expect(1);

    this.led.off();
    test.ok(this.spy.calledWith(13, 0));

    test.done();
  },

  isOn: function(test) {
    // https://github.com/rwaldron/johnny-five/issues/351
    test.expect(6);

    // Start in "off" state
    this.led.off();
    this.led.strobe(5);
    this.clock.tick(6);
    this.led.stop();

    // After one cycle, the led is on,
    // but stopped so not running
    // and the value left behind is 1
    test.equal(this.led.isOn, true);
    test.equal(this.led.isRunning, false);
    test.equal(this.led.value, 1);

    // Now it will start out ON
    this.led.strobe(5);
    this.clock.tick(6);

    // After one cycle, the led is off,
    // but NOT stopped so still running
    // and the value left behind is 0
    test.equal(this.led.isOn, false);
    test.equal(this.led.isRunning, true);
    test.equal(this.led.value, 0);

    test.done();
  },

  toggle: function(test) {
    test.expect(2);

    this.led.off();
    this.led.toggle();

    test.ok(this.spy.calledWith(13, 1));

    this.led.toggle();
    test.ok(this.spy.calledWith(13, 0));

    test.done();
  },

  strobe: function(test) {
    test.expect(3);

    this.led.off();
    this.led.strobe(100);

    this.clock.tick(100);
    test.ok(this.spy.calledWith(13, 1));
    this.clock.tick(100);
    test.ok(this.spy.calledWith(13, 0));
    this.led.stop();
    this.clock.tick(100);
    test.equal(this.spy.callCount, 3);

    test.done();
  },

  blink: function(test) {
    test.expect(1);
    test.equal(this.led.blink, this.led.strobe);
    test.done();
  }
};


exports["Led - PWM (Analog)"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.board = newBoard();
    this.spy = sinon.spy(this.board.io, "analogWrite");

    this.led = new Led({
      pin: 11,
      board: this.board
    });

    this.proto = [{
      name: "on"
    }, {
      name: "off"
    }, {
      name: "toggle"
    }, {
      name: "brightness"
    }, {
      name: "pulse"
    }, {
      name: "fade"
    }, {
      name: "fadeIn"
    }, {
      name: "fadeOut"
    }, {
      name: "strobe"
    }, {
      name: "blink"
    }, {
      name: "stop"
    }];

    this.instance = [{
      name: "id"
    }, {
      name: "pin"
    }, {
      name: "value"
    }, {
      name: "interval"
    }];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.led[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.led[property.name], "undefined");
    }, this);

    test.done();
  },

  defaultMode: function(test) {
    test.expect(1);
    test.equal(this.led.mode, 3);
    test.done();
  },

  on: function(test) {
    test.expect(1);

    this.led.on();
    test.ok(this.spy.calledWith(11, 255));

    test.done();
  },

  off: function(test) {
    test.expect(1);

    this.led.off();
    test.ok(this.spy.calledWith(11, 0));

    test.done();
  },

  isOnTrue: function(test) {
    // https://github.com/rwaldron/johnny-five/issues/351
    // test.expect(3);

    // Start in "off" state
    this.led.off();
    this.led.fade(255, 500);
    this.clock.tick(500);
    this.led.stop();

    // After one cycle, the led is on,
    // but stopped so not running
    // and the value left behind is 255
    test.equal(this.led.isOn, true);
    test.equal(this.led.isRunning, false);
    test.equal(this.led.value, 255);

    test.done();
  },

  isOnFalse: function(test) {
    // https://github.com/rwaldron/johnny-five/issues/351
    test.expect(3);

    this.led.on();
    this.led.fade(0, 500);
    this.clock.tick(500);
    this.led.stop();

    // After one cycle, the led is on,
    // but stopped so not running
    // and the value left behind is 255
    test.equal(this.led.isOn, false);
    test.equal(this.led.isRunning, false);
    test.equal(this.led.value, 0);
    test.done();
  },

  toggle: function(test) {
    test.expect(2);

    this.led.off();
    this.led.toggle();
    test.ok(this.spy.calledWith(11, 255));

    this.led.toggle();
    test.ok(this.spy.calledWith(11, 0));

    test.done();
  },

  brightness: function(test) {
    test.expect(3);

    this.led.off();
    this.led.brightness(255);
    test.ok(this.spy.calledWith(11, 255));

    this.led.brightness(100);
    test.ok(this.spy.calledWith(11, 100));

    this.led.brightness(0);
    test.ok(this.spy.calledWith(11, 0));

    test.done();
  },

  pulse: function(test) {
    sinon.spy(global, "clearInterval");
    sinon.spy(global, "setInterval");
    test.expect(3);

    this.led.off();
    test.equal(this.led.interval, null);

    this.led.pulse();
    test.equal(setInterval.callCount, 1);

    this.led.stop();
    test.equal(clearInterval.callCount, 1);

    clearInterval.restore();
    setInterval.restore();
    test.done();
  },

  autoMode: function(test) {
    test.expect(4);

    this.led.mode = 1;
    this.led.brightness(255);
    test.equal(this.led.mode, 3);

    this.led.mode = 1;
    this.led.pulse();
    test.equal(this.led.mode, 3);

    this.led.mode = 1;
    this.led.fade();
    test.equal(this.led.mode, 3);

    this.led.strobe();
    test.equal(this.led.mode, 1);

    test.done();
  },

  fadeIn: function(test) {
    test.expect(7);

    test.equal(this.led.value, null);
    test.equal(this.led.isOn, false);
    test.equal(this.led.isRunning, false);

    this.led.fadeIn(10);
    this.clock.tick(5);
    test.equal(this.led.isRunning, true);
    this.clock.tick(6);

    test.equal(this.led.value, 255);
    test.equal(this.led.isOn, true);
    test.equal(this.led.isRunning, false);

    test.done();
  },

  fadeOut: function(test) {
    test.expect(10);

    test.equal(this.led.value, null);
    test.equal(this.led.isOn, false);
    test.equal(this.led.isRunning, false);

    this.led.fadeIn(10);
    this.clock.tick(11);

    test.equal(this.led.value, 255);
    test.equal(this.led.isOn, true);
    test.equal(this.led.isRunning, false);

    this.led.fadeOut(10);
    this.clock.tick(5);
    test.equal(this.led.isRunning, true);
    this.clock.tick(6);


    test.equal(this.led.value, 0);
    test.equal(this.led.isOn, false);
    test.equal(this.led.isRunning, false);

    test.done();
  },

  fadeCallback: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.led.on().fade(0, 100, spy);
    this.clock.tick(101);
    test.equal(spy.calledOnce, true);
    test.done();
  },

  fadeInCallback: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.led.off().fadeIn(spy);
    this.clock.tick(1001);
    test.equal(spy.calledOnce, true);
    test.done();
  },

  fadeOutCallback: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.led.on().fadeOut(spy);
    this.clock.tick(1001);
    test.equal(spy.calledOnce, true);
    test.done();
  },

  pulseCallback: function(test) {
    test.expect(1);

    var spy = sinon.spy();

    this.led.pulse(spy);
    this.clock.tick(1001);
    test.equal(spy.calledOnce, true);
    test.done();
  }
};


// TODO
// exports["Led.Array"] = {


// };

exports["Led.RGB"] = {

  setUp: function(done) {
    this.board = newBoard();

    this.ledRgb = new Led.RGB({
      pins: {
        red: 9,
        green: 10,
        blue: 11,
      },
      board: this.board
    });

    this.analog = sinon.spy(this.board.io, "analogWrite");

    this.proto = [{
      name: "on"
    }, {
      name: "off"
    }, {
      name: "toggle"
    }, {
      name: "brightness"
    }, {
      name: "pulse"
    }, {
      name: "fade"
    }, {
      name: "fadeIn"
    }, {
      name: "fadeOut"
    }, {
      name: "strobe"
    }, {
      name: "blink"
    }, {
      name: "stop"
    }];

    this.instance = [{
      name: "red"
    }, {
      name: "green"
    }, {
      name: "blue"
    }, ];

    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.ledRgb[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.ledRgb[property.name], "undefined");
    }, this);

    test.done();
  },

  color: function(test) {
    var redPin = 9,
      greenPin = 10,
      bluePin = 11;

    test.expect(9);

    this.ledRgb.color("#0000ff");
    test.ok(this.analog.calledWith(redPin, 0x00));
    test.ok(this.analog.calledWith(greenPin, 0x00));
    test.ok(this.analog.calledWith(bluePin, 0xff));

    this.ledRgb.color("#ffff00");
    test.ok(this.analog.calledWith(redPin, 0xff));
    test.ok(this.analog.calledWith(greenPin, 0xff));
    test.ok(this.analog.calledWith(bluePin, 0x00));

    this.ledRgb.color("#bbccaa");
    test.ok(this.analog.calledWith(redPin, 0xbb));
    test.ok(this.analog.calledWith(greenPin, 0xcc));
    test.ok(this.analog.calledWith(bluePin, 0xaa));

    test.done();
  },

  mixinArgs: function(test) {
    var redPin = 9,
      greenPin = 10,
      bluePin = 11;

    test.expect(6);

    this.ledRgb.brightness(255);

    test.ok(this.analog.calledWith(redPin, 255));
    test.ok(this.analog.calledWith(greenPin, 255));
    test.ok(this.analog.calledWith(bluePin, 255));

    this.ledRgb.brightness(0);
    test.ok(this.analog.calledWith(redPin, 0));
    test.ok(this.analog.calledWith(greenPin, 0));
    test.ok(this.analog.calledWith(bluePin, 0));

    test.done();
  },
  on: function(test) {
    test.expect(1);

    this.ledRgb.on();
    test.ok(this.analog.calledWith(11, 255));

    test.done();
  },

  off: function(test) {
    test.expect(1);

    this.ledRgb.off();
    test.ok(this.analog.calledWith(11, 0));

    test.done();
  },

  blink: function(test) {
    test.expect(1);
    test.equal(this.ledRgb.blink, this.ledRgb.strobe);
    test.done();
  }

};

exports["Led.RGB - Common Anode"] = {

  setUp: function(done) {
    this.board = newBoard();

    this.ledRgb = new Led.RGB({
      pins: {
        red: 9,
        green: 10,
        blue: 11,
      },
      isAnode: true,
      board: this.board
    });

    this.io = {
      analogWrite: function(pin, value) {}
    };

    this.board.io.analogWrite = function(pin, value) {
      value = 255 - value;
      this.io.analogWrite(pin, value);
    }.bind(this);

    this.spy = sinon.spy(this.io, "analogWrite");

    this.proto = [{
      name: "on"
    }, {
      name: "off"
    }, {
      name: "toggle"
    }, {
      name: "brightness"
    }, {
      name: "pulse"
    }, {
      name: "fade"
    }, {
      name: "fadeIn"
    }, {
      name: "fadeOut"
    }, {
      name: "strobe"
    }, {
      name: "blink"
    }, {
      name: "stop"
    }];

    this.instance = [{
      name: "red"
    }, {
      name: "green"
    }, {
      name: "blue"
    }, ];

    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.ledRgb[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.ledRgb[property.name], "undefined");
    }, this);

    test.done();
  },

  color: function(test) {
    var redPin = 9,
      greenPin = 10,
      bluePin = 11;

    test.expect(9);

    this.ledRgb.color("#0000ff");
    test.ok(this.spy.calledWith(redPin, 0xff));
    test.ok(this.spy.calledWith(greenPin, 0xff));
    test.ok(this.spy.calledWith(bluePin, 0x00));

    this.ledRgb.color("#ffff00");
    test.ok(this.spy.calledWith(redPin, 0x00));
    test.ok(this.spy.calledWith(greenPin, 0x00));
    test.ok(this.spy.calledWith(bluePin, 0xff));

    this.ledRgb.color("#bbccaa");
    test.ok(this.spy.calledWith(redPin, 0x44));
    test.ok(this.spy.calledWith(greenPin, 0x33));
    test.ok(this.spy.calledWith(bluePin, 0x55));

    test.done();
  },

  on: function(test) {
    test.expect(1);

    this.ledRgb.on();
    test.ok(this.spy.calledWith(11, 0));

    test.done();
  },

  off: function(test) {
    test.expect(1);

    this.ledRgb.off();
    test.ok(this.spy.calledWith(11, 255));

    test.done();
  },

  blink: function(test) {
    test.expect(1);
    test.equal(this.ledRgb.blink, this.ledRgb.strobe);
    test.done();
  }

};


exports["Led - Default Pin w/ Firmata"] = {
  shape: function(test) {
    test.expect(8);
    test.equal(new Led().pin, 13);
    test.equal(new Led(0).pin, 0);

    test.equal(new Led("A0").pin, 14);
    test.equal(new Led(14).pin, 14);

    // 13 & 14 are OUTPUT
    test.equal(new Led(13).mode, 1);
    test.equal(new Led(14).mode, 1);

    // 12 is PWM, but the mechanism is stubbed
    sinon.stub(five.Board.Pins.prototype, "isPwm").returns(true);

    test.equal(new Led(12).mode, 3);
    test.equal(new Led({
      type: "PWM"
    }).mode, 3);

    test.done();
  }
};

exports["Led - Pulse"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.spy = sinon.spy(this.board.io, "analogWrite");

    this.led = new Led({
      pin: 11,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();

    done();
  },

  pulse: function(test) {
    test.expect(1);

    // pulse length 1s
    this.led.pulse(1000);

    // move the clock forwards 1001 ms so we have a complete set of values
    this.clock.tick(1001);

    // stop pulsing
    this.led.stop();

    // make sure NaN was not passed to io
    test.ok(!isNaN(this.spy.firstCall.args[1]));

    test.done();
  }
};
