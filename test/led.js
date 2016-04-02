var five = require("../lib/johnny-five.js");
var sinon = require("sinon");
var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata;
var Board = five.Board;
var Expander = five.Expander;
var Led = five.Led;

var protoProperties = [{
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

var instanceProperties = [{
  name: "id"
}, {
  name: "pin"
}, {
  name: "value"
}];

var rgbProtoProperties = [{
  name: "on"
}, {
  name: "off"
}, {
  name: "color"
}, {
  name: "toggle"
}, {
  name: "strobe"
}, {
  name: "blink"
}, {
  name: "stop"
}];

var rgbInstanceProperties = [];

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

function testLedShape(test) {
  test.expect(protoProperties.length + instanceProperties.length);

  protoProperties.forEach(function(method) {
    test.equal(typeof this.led[method.name], "function");
  }, this);

  instanceProperties.forEach(function(property) {
    test.notEqual(typeof this.led[property.name], "undefined");
  }, this);

  test.done();
}

function testLedRgbShape(test) {
  test.expect(rgbProtoProperties.length + rgbInstanceProperties.length);

  rgbProtoProperties.forEach(function(method) {
    test.equal(typeof this.rgb[method.name], "function");
  }, this);

  rgbInstanceProperties.forEach(function(property) {
    test.notEqual(typeof this.rgb[property.name], "undefined");
  }, this);

  test.done();
}

exports["Led - Digital"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");

    this.led = new Led({
      pin: 13,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: testLedShape,

  pinMode: function(test) {
    test.expect(2);
    test.ok(this.pinMode.firstCall.calledWith(13, this.board.io.MODES.OUTPUT));
    test.equal(this.pinMode.callCount, 1);
    test.done();
  },

  defaultMode: function(test) {
    test.expect(1);
    test.equal(this.led.mode, this.board.io.MODES.OUTPUT);
    test.done();
  },

  on: function(test) {
    test.expect(2);

    this.led.on();
    test.ok(this.digitalWrite.firstCall.calledWith(13, 1));
    test.equal(this.digitalWrite.callCount, 1);

    test.done();
  },

  off: function(test) {
    test.expect(2);

    this.led.off();
    test.ok(this.digitalWrite.firstCall.calledWith(13, 0));
    test.equal(this.digitalWrite.callCount, 1);

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
    test.expect(5);

    this.led.off();
    this.digitalWrite.reset();

    this.led.toggle();
    test.ok(this.digitalWrite.lastCall.calledWith(13, 1));
    test.ok(this.led.isOn);

    this.led.toggle();
    test.ok(this.digitalWrite.lastCall.calledWith(13, 0));
    test.ok(!this.led.isOn);

    test.equal(this.digitalWrite.callCount, 2);

    test.done();
  },

  strobe: function(test) {
    test.expect(7);

    var spy;

    this.led.off();
    this.digitalWrite.reset();
    this.led.strobe(100);

    this.clock.tick(100);
    test.ok(this.digitalWrite.lastCall.calledWith(13, 1));
    this.clock.tick(100);
    test.ok(this.digitalWrite.lastCall.calledWith(13, 0));
    this.led.stop();
    this.clock.tick(100);
    test.equal(this.digitalWrite.callCount, 2);

    this.led.stop().off();
    spy = this.sandbox.spy();
    this.led.strobe(100, spy);

    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    this.clock.tick(100);
    test.equal(spy.callCount, 2);

    this.led.stop().off();
    spy = this.sandbox.spy();
    this.led.strobe(spy);

    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    this.clock.tick(100);
    test.equal(spy.callCount, 2);

    test.done();
  },

  blink: function(test) {
    test.expect(1);
    test.equal(this.led.blink, this.led.strobe);
    test.done();
  },

  stop: function(test) {
    test.expect(2);

    this.led.strobe();
    test.ok(this.led.isRunning);
    this.led.stop();
    test.ok(!this.led.isRunning);

    test.done();
  },

  correctReturns: function(test) {
    test.expect(5);

    this.enqueue = this.sandbox.stub(five.Animation.prototype, "enqueue");

    test.equal(this.led.blink(), this.led);
    test.equal(this.led.on(), this.led);
    test.equal(this.led.off(), this.led);
    test.equal(this.led.toggle(), this.led);
    test.equal(this.led.stop(), this.led);

    test.done();
  },

};

exports["Led - PWM (Analog)"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");

    this.led = new Led({
      pin: 11,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: testLedShape,

  pinMode: function(test) {
    test.expect(2);
    test.ok(this.pinMode.firstCall.calledWith(11, this.board.io.MODES.PWM));
    test.equal(this.pinMode.callCount, 1);
    test.done();
  },

  defaultMode: function(test) {
    test.expect(1);
    test.equal(this.led.mode, this.board.io.MODES.PWM);
    test.done();
  },

  on: function(test) {
    test.expect(2);

    this.led.on();
    test.ok(this.analogWrite.firstCall.calledWith(11, 255));
    test.equal(this.analogWrite.callCount, 1);

    test.done();
  },

  off: function(test) {
    test.expect(2);

    this.led.off();
    test.ok(this.analogWrite.firstCall.calledWith(11, 0));
    test.equal(this.analogWrite.callCount, 1);

    test.done();
  },

  toggle: function(test) {
    test.expect(5);

    this.led.off();
    this.analogWrite.reset();

    this.led.toggle();
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    test.ok(this.led.isOn);

    this.led.toggle();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    test.ok(!this.led.isOn);

    test.equal(this.analogWrite.callCount, 2);

    test.done();
  },

  brightness: function(test) {
    test.expect(4);

    this.led.off();
    this.analogWrite.reset();

    this.led.brightness(255);
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));

    this.led.brightness(100);
    test.ok(this.analogWrite.lastCall.calledWith(11, 100));

    this.led.brightness(0);
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));

    test.equal(this.analogWrite.callCount, 3);

    test.done();
  },

  correctReturns: function(test) {
    test.expect(10);

    this.enqueue = this.sandbox.stub(five.Animation.prototype, "enqueue");

    test.equal(this.led.blink(), this.led);
    test.equal(this.led.brightness(), this.led);
    test.equal(this.led.fade(), this.led);
    test.equal(this.led.fadeIn(), this.led);
    test.equal(this.led.fadeOut(), this.led);
    test.equal(this.led.on(), this.led);
    test.equal(this.led.off(), this.led);
    test.equal(this.led.toggle(), this.led);
    test.equal(this.led.pulse(), this.led);
    test.equal(this.led.stop(), this.led);

    test.done();
  },
};

exports["Led - PCA9685 (I2C)"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.normalize = this.sandbox.spy(Board.Pins, "normalize");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");

    this.led = new Led({
      pin: 0,
      controller: "PCA9685",
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    Expander.purge();
    done();
  },

  shape: testLedShape,

  defaultFrequency: function(test) {
    test.expect(1);
    test.equal(this.led.frequency, 200);
    test.done();
  },

  customFrequency: function(test) {
    test.expect(1);

    this.led = new Led({
      frequency: 100,
      pin: 0,
      controller: "PCA9685",
      board: this.board
    });

    test.equal(this.led.frequency, 100);
    test.done();
  },

  noNormalization: function(test) {
    test.expect(1);
    test.equal(this.normalize.callCount, 0);
    test.done();
  },

  defaultMode: function(test) {
    test.expect(2);

    var led2 = new Led({
      pin: 5,
      controller: "PCA9685",
      board: this.board
    });

    test.equal(this.led.mode, this.board.io.MODES.PWM);
    test.equal(led2.mode, this.board.io.MODES.PWM);

    test.done();
  },

  pinMode: function(test) {
    test.expect(1);

    // I2C device: no need to call pinMode!
    test.equal(this.pinMode.callCount, 0);

    test.done();
  },

  on: function(test) {
    test.expect(2);

    this.i2cWrite.reset();
    this.led.on();

    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 4096, 16, 0, 0]));
    test.equal(this.i2cWrite.callCount, 1);

    test.done();
  },

  off: function(test) {
    test.expect(2);

    this.i2cWrite.reset();
    this.led.off();
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 4096, 16]));
    test.equal(this.i2cWrite.callCount, 1);

    test.done();
  },

  toggle: function(test) {
    test.expect(5);

    this.led.off();
    this.i2cWrite.reset();

    this.led.toggle();
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 4096, 16, 0, 0]));
    test.ok(this.led.isOn);

    this.led.toggle();
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 4096, 16]));
    test.ok(!this.led.isOn);

    test.equal(this.i2cWrite.callCount, 2);

    test.done();
  },

  brightness: function(test) {
    test.expect(4);

    this.led.off();
    this.i2cWrite.reset();

    this.led.brightness(255);
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 4096, 16, 0, 0]));

    this.led.brightness(100);
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 4095 * 100 / 255, 6]));

    this.led.brightness(0);
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 4096, 16]));

    test.equal(this.i2cWrite.callCount, 3);

    test.done();
  }
};

exports["Led.Collection"] = {
  setUp: function(done) {
    var board = new Board({
      io: new MockFirmata(),
      debug: false,
      repl: false
    });

    this.sandbox = sinon.sandbox.create();

    Led.purge();

    this.a = new Led({
      pin: 3,
      board: board
    });

    this.b = new Led({
      pin: 6,
      board: board
    });

    this.c = new Led({
      pin: 9,
      board: board
    });

    this.spies = [
      "brightness", "off"
    ];

    this.spies.forEach(function(method) {
      this[method] = this.sandbox.spy(Led.prototype, method);
    }.bind(this));

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  initFromLedNumbers: function(test) {
    test.expect(1);

    var leds = new Led.Collection([3, 7, 9]);

    test.equal(leds.length, 3);
    test.done();
  },

  initFromLeds: function(test) {
    test.expect(1);

    var leds = new Led.Collection([
      this.a, this.b, this.c
    ]);

    test.equal(leds.length, 3);
    test.done();
  }
};

exports["Led.RGB"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");

    this.rgb = new Led.RGB({
      pins: {
        red: 9,
        green: 10,
        blue: 11,
      },
      board: this.board
    });

    this.write = this.sandbox.spy(this.rgb, "write");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: testLedRgbShape,

  params: function(test) {
    var led;

    test.expect(5);

    // Test object constructor
    led = new Led.RGB({
      pins: {
        red: 9,
        green: 10,
        blue: 11,
      }
    });
    test.deepEqual(led.pins, [9, 10, 11]);

    // Test object constructor with array
    led = new Led.RGB({
      pins: [9, 10, 11]
    });
    test.deepEqual(led.pins, [9, 10, 11]);

    // Test array constructor
    led = new Led.RGB([9, 10, 11]);
    test.deepEqual(led.pins, [9, 10, 11]);

    // Non-PWM digital pin
    test.throws(function() {
      new Led.RGB({
        pins: [2, 3, 4]
      });
    }, /Pin Error: 2 is not a valid PWM pin \(Led\.RGB\)/);

    // Analog pin
    test.throws(function() {
      new Led.RGB({
        pins: ["A0", "A1", "A2"]
      });
    }, /Pin Error: \d+ is not a valid PWM pin \(Led\.RGB\)/);

    test.done();
  },

  write: function(test) {
    test.expect(4);

    this.rgb.write({
      red: 0xbb,
      green: 0xcc,
      blue: 0xaa
    });
    test.ok(this.analogWrite.callCount, 3);
    test.ok(this.analogWrite.calledWith(9, 0xbb));
    test.ok(this.analogWrite.calledWith(10, 0xcc));
    test.ok(this.analogWrite.calledWith(11, 0xaa));

    test.done();
  },

  color: function(test) {
    var rgb = this.rgb;

    test.expect(36);

    // returns this
    test.equal(this.rgb.color("#000000"), this.rgb);
    this.write.reset();

    // hex values
    this.rgb.color("#0000ff");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 0x00,
      green: 0x00,
      blue: 0xff
    }));
    this.write.reset();

    this.rgb.color("#bbccaa");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 0xbb,
      green: 0xcc,
      blue: 0xaa
    }));
    this.write.reset();

    // without "#"
    this.rgb.color("0000ff");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 0x00,
      green: 0x00,
      blue: 0xff
    }));
    this.write.reset();

    // name
    this.rgb.color("PapayaWhip");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 0xff,
      green: 0xef,
      blue: 0xd5
    }));
    this.write.reset();

    // lowercase names
    this.rgb.color("papayawhip");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 0xff,
      green: 0xef,
      blue: 0xd5
    }));
    this.write.reset();

    // three arguments
    this.rgb.color(255, 100, 50);
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 255,
      green: 100,
      blue: 50
    }));
    this.write.reset();

    // with constraints
    this.rgb.color(999, -999, 0);
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 255,
      green: 0,
      blue: 0
    }));
    this.write.reset();

    // by object
    this.rgb.color({
      red: 255,
      green: 100,
      blue: 50
    });
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 255,
      green: 100,
      blue: 50
    }));
    this.write.reset();

    // by array
    this.rgb.color([255, 100, 50]);
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 255,
      green: 100,
      blue: 50
    }));
    this.write.reset();

    // bad values
    test.throws(function() {
      rgb.color(null);
    });

    // shorthand not supported
    test.throws(function() {
      rgb.color("#fff");
    });

    // bad hex
    test.throws(function() {
      rgb.color("#ggffff");
    });
    test.throws(function() {
      rgb.color("#ggffffff");
    });
    test.throws(function() {
      rgb.color("#ffffffff");
    });

    // bad color names
    test.throws(function() {
      rgb.color("not a real color");
    });
    test.throws(function() {
      rgb.color("#papayawhip");
    });

    // missing/null/undefined param
    test.throws(function() {
      rgb.color(10, 20);
    });
    test.throws(function() {
      rgb.color(10, 20, null);
    });
    test.throws(function() {
      rgb.color(10, undefined, 30);
    });

    // missing/null/undefined value in array
    test.throws(function() {
      rgb.color([10, 20]);
    });
    test.throws(function() {
      rgb.color([10, null, 30]);
    });
    test.throws(function() {
      rgb.color([10, undefined, 30]);
    });

    // missing/null/undefined value in object
    test.throws(function() {
      rgb.color({
        red: 255,
        green: 100
      });
    });
    test.throws(function() {
      rgb.color({
        red: 255,
        green: 100,
        blue: null
      });
    });
    test.throws(function() {
      rgb.color({
        red: 255,
        green: 100,
        blue: undefined
      });
    });

    // returns color if no params
    this.rgb.color([10, 20, 30]);
    test.deepEqual(this.rgb.color(), {
      red: 10,
      green: 20,
      blue: 30
    });

    test.done();
  },

  on: function(test) {
    var color;

    test.expect(23);

    test.ok(!this.rgb.isOn);
    test.deepEqual(this.rgb.values, {
      red: 0,
      green: 0,
      blue: 0
    });

    // Should default to #ffffff
    this.write.reset();
    this.rgb.on();

    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 0xff,
      green: 0xff,
      blue: 0xff
    }));
    this.write.reset();

    color = this.rgb.color();
    test.ok(!this.write.called);
    test.equal(color.red, 255);
    test.equal(color.green, 255);
    test.equal(color.blue, 255);

    // Set a color and make sure .on() doesn't override
    this.rgb.color("#bbccaa");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 0xbb,
      green: 0xcc,
      blue: 0xaa
    }));
    this.write.reset();
    this.rgb.on();
    test.ok(!this.write.called);

    color = this.rgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    // And that those values are actually live
    var values = this.rgb.values;
    test.equal(values.red, 0xbb);
    test.equal(values.green, 0xcc);
    test.equal(values.blue, 0xaa);

    // Turn led off and back on to see if state restored
    this.rgb.off();
    this.rgb.on();
    color = this.rgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    values = this.rgb.values;
    test.equal(values.red, 0xbb);
    test.equal(values.green, 0xcc);
    test.equal(values.blue, 0xaa);

    test.done();
  },

  off: function(test) {
    test.expect(8);

    this.rgb.color("#bbccaa");
    this.write.reset();

    this.rgb.off();
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 0,
      green: 0,
      blue: 0
    }));
    this.write.reset();

    // Test saved state
    var color = this.rgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    // Test live values
    var values = this.rgb.values;
    test.equal(values.red, 0);
    test.equal(values.green, 0);
    test.equal(values.blue, 0);

    test.done();
  },

  stop: function(test) {
    test.expect(2);

    this.rgb.strobe();
    test.ok(this.rgb.isRunning);
    this.rgb.stop();
    test.ok(!this.rgb.isRunning);

    test.done();
  },

  toggle: function(test) {
    test.expect(7);

    var on = this.sandbox.spy(this.rgb, "on");
    var off = this.sandbox.spy(this.rgb, "off");

    // Should default to off
    test.ok(!this.rgb.isOn);

    // Toggling should call on()
    this.rgb.toggle();
    test.ok(on.calledOnce);
    test.ok(!off.called);
    test.ok(this.rgb.isOn);
    on.reset();
    off.reset();

    // Toggling should call off()
    this.rgb.toggle();
    test.ok(off.calledOnce);
    test.ok(!on.called);
    test.ok(!this.rgb.isOn);

    test.done();
  },

  blink: function(test) {
    test.expect(1);
    test.equal(this.rgb.blink, this.rgb.strobe);
    test.done();
  },

  intensity: function(test) {
    test.expect(24);

    this.rgb.color("#33aa00");
    test.equal(this.rgb.intensity(), 100);
    this.write.reset();

    // partial intensity
    test.equal(this.rgb.intensity(20), this.rgb);
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 10,
      green: 34,
      blue: 0
    }));
    test.deepEqual(this.rgb.values, {
      red: 10,
      green: 34,
      blue: 0
    });
    test.deepEqual(this.rgb.color(), {
      red: 0x33,
      green: 0xaa,
      blue: 0x00
    });
    test.equal(this.rgb.intensity(), 20);
    this.write.reset();

    // change color
    this.rgb.color("#ff0000");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 51,
      green: 0,
      blue: 0
    }));
    test.deepEqual(this.rgb.values, {
      red: 51,
      green: 0,
      blue: 0
    });
    test.deepEqual(this.rgb.color(), {
      red: 0xff,
      green: 0x00,
      blue: 0x00
    });
    test.equal(this.rgb.intensity(), 20);
    this.write.reset();

    // fully off
    test.equal(this.rgb.intensity(0), this.rgb);
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 0,
      green: 0,
      blue: 0
    }));
    test.deepEqual(this.rgb.values, {
      red: 0,
      green: 0,
      blue: 0
    });
    test.deepEqual(this.rgb.color(), {
      red: 0xff,
      green: 0x00,
      blue: 0x00
    });
    test.equal(this.rgb.intensity(), 0);
    this.write.reset();

    // restore from off
    test.equal(this.rgb.intensity(50), this.rgb);
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 128,
      green: 0,
      blue: 0
    }));
    test.deepEqual(this.rgb.values, {
      red: 128,
      green: 0,
      blue: 0
    });
    test.deepEqual(this.rgb.color(), {
      red: 0xff,
      green: 0x00,
      blue: 0x00
    });
    test.equal(this.rgb.intensity(), 50);
    this.write.reset();

    test.done();
  }
};

exports["Led.RGB - Common Anode"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.rgb = new Led.RGB({
      pins: {
        red: 9,
        green: 10,
        blue: 11,
      },
      isAnode: true,
      board: this.board
    });

    this.analog = this.sandbox.spy(MockFirmata.prototype, "analogWrite");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  isAnode: function(test) {
    test.expect(1);

    test.equal(this.rgb.isAnode, true);

    test.done();
  },

  write: function(test) {
    test.expect(4);

    this.rgb.write({
      red: 0xbb,
      green: 0xcc,
      blue: 0xaa
    });
    test.ok(this.analog.callCount, 3);
    test.ok(this.analog.calledWith(9, 0x44));
    test.ok(this.analog.calledWith(10, 0x33));
    test.ok(this.analog.calledWith(11, 0x55));

    test.done();
  }
};

exports["Led.RGB - PCA9685 (I2C)"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.rgb = new Led.RGB({
      pins: {
        red: 0,
        green: 1,
        blue: 2,
      },
      controller: "PCA9685",
      board: this.board
    });

    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    Expander.purge();
    done();
  },

  shape: testLedRgbShape,

  defaultFrequency: function(test) {
    test.expect(1);
    test.equal(this.rgb.frequency, 200);
    test.done();
  },

  customFrequency: function(test) {
    test.expect(1);

    this.rgb = new Led.RGB({
      frequency: 100,
      pins: {
        red: 0,
        green: 1,
        blue: 2,
      },
      controller: "PCA9685",
      board: this.board
    });

    test.equal(this.rgb.frequency, 100);
    test.done();
  },

  normalization: function(test) {
    test.expect(1);

    this.a = new Led.RGB({
      pins: {
        red: 13,
        green: 14,
        blue: 15,
      },
      controller: "PCA9685",
      board: this.board
    });

    test.deepEqual(this.a.pins, [13, 14, 15]);

    test.done();
  },

  write: function(test) {
    test.expect(12);

    // Fully off
    this.rgb.write({
      red: 0x00,
      green: 0x00,
      blue: 0x00
    });
    test.equal(this.i2cWrite.callCount, 3);
    test.ok(this.i2cWrite.calledWith(64, [6, 0, 0, 4096, 16]));
    test.ok(this.i2cWrite.calledWith(64, [10, 0, 0, 4096, 16]));
    test.ok(this.i2cWrite.calledWith(64, [14, 0, 0, 4096, 16]));
    this.i2cWrite.reset();

    // Fully on
    this.rgb.write({
      red: 0xff,
      green: 0xff,
      blue: 0xff
    });
    test.equal(this.i2cWrite.callCount, 3);
    test.ok(this.i2cWrite.calledWith(64, [6, 4096, 16, 0, 0]));
    test.ok(this.i2cWrite.calledWith(64, [10, 4096, 16, 0, 0]));
    test.ok(this.i2cWrite.calledWith(64, [14, 4096, 16, 0, 0]));
    this.i2cWrite.reset();

    // Custom color
    this.rgb.write({
      red: 0xbb,
      green: 0xcc,
      blue: 0xaa
    });
    test.equal(this.i2cWrite.callCount, 3);
    test.ok(this.i2cWrite.calledWith(64, [6, 0, 0, 3003, 11]));
    test.ok(this.i2cWrite.calledWith(64, [10, 0, 0, 3276, 12]));
    test.ok(this.i2cWrite.calledWith(64, [14, 0, 0, 2730, 10]));
    this.i2cWrite.reset();

    test.done();
  }
};

exports["Led.RGB - PCA9685 (I2C) Common Anode"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.rgb = new Led.RGB({
      pins: {
        red: 0,
        green: 1,
        blue: 2,
      },
      controller: "PCA9685",
      isAnode: true,
      board: this.board
    });

    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    Expander.purge();
    done();
  },

  shape: testLedRgbShape,

  write: function(test) {
    test.expect(12);

    // Fully off
    this.rgb.write({
      red: 0x00,
      green: 0x00,
      blue: 0x00
    });

    test.equal(this.i2cWrite.callCount, 3);
    test.ok(this.i2cWrite.calledWith(64, [6, 4096, 16, 0, 0]));
    test.ok(this.i2cWrite.calledWith(64, [10, 4096, 16, 0, 0]));
    test.ok(this.i2cWrite.calledWith(64, [14, 4096, 16, 0, 0]));
    this.i2cWrite.reset();

    // Fully on
    this.rgb.write({
      red: 0xff,
      green: 0xff,
      blue: 0xff
    });
    test.equal(this.i2cWrite.callCount, 3);
    test.ok(this.i2cWrite.calledWith(64, [6, 0, 0, 4096, 16]));
    test.ok(this.i2cWrite.calledWith(64, [10, 0, 0, 4096, 16]));
    test.ok(this.i2cWrite.calledWith(64, [14, 0, 0, 4096, 16]));
    this.i2cWrite.reset();

    // Custom color
    this.rgb.write({
      red: 0xbb,
      green: 0xcc,
      blue: 0xaa
    });
    test.equal(this.i2cWrite.callCount, 3);
    test.ok(this.i2cWrite.calledWith(64, [6, 0, 0, 1092, 4]));
    test.ok(this.i2cWrite.calledWith(64, [10, 0, 0, 819, 3]));
    test.ok(this.i2cWrite.calledWith(64, [14, 0, 0, 1365, 5]));
    this.i2cWrite.reset();

    test.done();
  }
};

exports["Led.RGB - BlinkM (I2C)"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.rgb = new Led.RGB({
      controller: "BlinkM",
      board: this.board
    });

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: testLedRgbShape,

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Led.RGB({
      controller: "BlinkM",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  write: function(test) {
    test.expect(6);

    // Fully off
    this.rgb.write({
      red: 0x00,
      green: 0x00,
      blue: 0x00
    });
    test.equal(this.i2cWrite.callCount, 1);
    test.ok(this.i2cWrite.calledWith(0x09, [0x6e, 0x00, 0x00, 0x00]));
    this.i2cWrite.reset();

    // Fully on
    this.rgb.write({
      red: 0xff,
      green: 0xff,
      blue: 0xff
    });
    test.equal(this.i2cWrite.callCount, 1);
    test.ok(this.i2cWrite.calledWith(0x09, [0x6e, 0xff, 0xff, 0xff]));
    this.i2cWrite.reset();

    // Custom color
    this.rgb.write({
      red: 0xbb,
      green: 0xcc,
      blue: 0xaa
    });
    test.equal(this.i2cWrite.callCount, 1);
    test.ok(this.i2cWrite.calledWith(0x09, [0x6e, 0xbb, 0xcc, 0xaa]));
    this.i2cWrite.reset();

    test.done();
  }
};

exports["Led.RGB - Esplora"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.rgb = new Led.RGB({
      controller: "Esplora",
      board: this.board
    });

    this.analog = this.sandbox.spy(MockFirmata.prototype, "analogWrite");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: testLedRgbShape,

  initialization: function(test) {
    test.expect(1);

    test.deepEqual(this.rgb.pins, [5, 10, 9]);

    test.done();
  },

  write: function(test) {
    test.expect(12);

    // Fully off
    this.rgb.write({
      red: 0x00,
      green: 0x00,
      blue: 0x00
    });
    test.ok(this.analog.callCount, 3);
    test.ok(this.analog.calledWith(5, 0x00));
    test.ok(this.analog.calledWith(10, 0x00));
    test.ok(this.analog.calledWith(9, 0x00));
    this.analog.reset();

    // Fully on
    this.rgb.write({
      red: 0xff,
      green: 0xff,
      blue: 0xff
    });
    test.ok(this.analog.callCount, 3);
    test.ok(this.analog.calledWith(5, 0xff));
    test.ok(this.analog.calledWith(10, 0xff));
    test.ok(this.analog.calledWith(9, 0xff));
    this.analog.reset();

    // Custom color
    this.rgb.write({
      red: 0xbb,
      green: 0xcc,
      blue: 0xaa
    });
    test.ok(this.analog.callCount, 3);
    test.ok(this.analog.calledWith(5, 0xbb));
    test.ok(this.analog.calledWith(10, 0xcc));
    test.ok(this.analog.calledWith(9, 0xaa));
    this.analog.reset();

    test.done();
  }
};

exports["Led - Default Pin w/ Firmata"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(7);

    Board.purge();

    var io = new MockFirmata();
    new Board({
      io: io,
      debug: false,
      repl: false
    });
    io.emit("ready");

    test.equal(new Led().pin, 13);
    test.equal(new Led(0).pin, 0);

    test.equal(new Led("A0").pin, 14);
    test.equal(new Led(14).pin, 14);

    // 13 & 14 are OUTPUT
    test.equal(new Led(13).mode, 1);
    test.equal(new Led(14).mode, 1);

    // 12 is PWM, but the mechanism is stubbed
    this.sandbox.stub(five.Board.Pins.prototype, "isPwm").returns(true);

    test.equal(new Led(12).mode, 3);

    test.done();
  }
};

exports["Led - Cycling Operations"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.ledStop = this.sandbox.spy(five.Led.prototype, "stop");
    this.rgbStop = this.sandbox.spy(five.Led.RGB.prototype, "stop");
    this.enqueue = this.sandbox.stub(five.Animation.prototype, "enqueue");

    this.led = new Led({
      pin: 11,
      board: this.board
    });

    this.rgb = new Led.RGB({
      pins: [3, 5, 6],
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  ledCallsStopBeforeNextCyclingOperation: function(test) {
    test.expect(2);

    this.led.blink();
    this.led.fade();
    this.led.pulse();

    test.equal(this.ledStop.callCount, 3);
    // fade and pulse are animations
    test.equal(this.enqueue.callCount, 2);
    test.done();
  },

  rgbCallsStopBeforeNextCyclingOperation: function(test) {
    test.expect(1);

    this.rgb.blink();

    test.equal(this.rgbStop.callCount, 1);
    test.done();
  },

};
