var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./util/mock-firmata"),
  Board = five.Board,
  Led = five.Led;

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
}, {
  name: "interval"
}];

function newBoard() {
  var io = new MockFirmata();
  var board = new Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("ready");

  return board;
}

exports["Led - Digital"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.digitalWrite = sinon.spy(this.board.io, "digitalWrite");
    this.pinMode = sinon.spy(this.board.io, "pinMode");

    this.led = new Led({
      pin: 13,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(protoProperties.length + instanceProperties.length);

    protoProperties.forEach(function(method) {
      test.equal(typeof this.led[method.name], "function");
    }, this);

    instanceProperties.forEach(function(property) {
      test.notEqual(typeof this.led[property.name], "undefined");
    }, this);

    test.done();
  },

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
    spy = sinon.spy();
    this.led.strobe(100, spy);

    this.clock.tick(100);
    test.equal(spy.callCount, 1);
    this.clock.tick(100);
    test.equal(spy.callCount, 2);

    this.led.stop().off();
    spy = sinon.spy();
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
  }
};


exports["Led - PWM (Analog)"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.board = newBoard();
    this.analogWrite = sinon.spy(this.board.io, "analogWrite");
    this.pinMode = sinon.spy(this.board.io, "pinMode");

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

  shape: function(test) {
    test.expect(protoProperties.length + instanceProperties.length);

    protoProperties.forEach(function(method) {
      test.equal(typeof this.led[method.name], "function");
    }, this);

    instanceProperties.forEach(function(property) {
      test.notEqual(typeof this.led[property.name], "undefined");
    }, this);

    test.done();
  },

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
  }
};

exports["Led - PCA9685 (I2C)"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.board = newBoard();
    this.i2cWrite = sinon.spy(this.board.io, "i2cWrite");
    this.pinMode = sinon.spy(this.board.io, "pinMode");

    this.led = new Led({
      pin: 0,
      controller: "PCA9685",
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(protoProperties.length + instanceProperties.length);

    protoProperties.forEach(function(method) {
      test.equal(typeof this.led[method.name], "function");
    }, this);

    instanceProperties.forEach(function(property) {
      test.notEqual(typeof this.led[property.name], "undefined");
    }, this);

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
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 4095, 15]));
    test.equal(this.i2cWrite.callCount, 1);

    test.done();
  },

  off: function(test) {
    test.expect(2);

    this.i2cWrite.reset();
    this.led.off();
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 0, 0]));
    test.equal(this.i2cWrite.callCount, 1);

    test.done();
  },

  toggle: function(test) {
    test.expect(5);

    this.led.off();
    this.i2cWrite.reset();

    this.led.toggle();
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 4095, 15]));
    test.ok(this.led.isOn);

    this.led.toggle();
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 0, 0]));
    test.ok(!this.led.isOn);

    test.equal(this.i2cWrite.callCount, 2);

    test.done();
  },

  brightness: function(test) {
    test.expect(4);

    this.led.off();
    this.i2cWrite.reset();

    this.led.brightness(255);
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 4095, 15]));

    this.led.brightness(100);
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 4095 * 100 / 255, 6]));

    this.led.brightness(0);
    test.ok(this.i2cWrite.lastCall.calledWith(64, [6, 0, 0, 0, 0]));

    test.equal(this.i2cWrite.callCount, 3);

    test.done();
  }
};

exports["Led.Array"] = {
  setUp: function(done) {
    var board = new Board({
      io: new MockFirmata(),
      debug: false,
      repl: false
    });

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
      this[method] = sinon.spy(Led.prototype, method);
    }.bind(this));

    done();
  },

  tearDown: function(done) {
    this.spies.forEach(function(value) {
      this[value].restore();
    }.bind(this));
    done();
  },

  initFromLedNumbers: function(test) {
    test.expect(1);

    var leds = new Led.Array([3, 7, 9]);

    test.equal(leds.length, 3);
    test.done();
  },

  initFromLeds: function(test) {
    test.expect(1);

    var leds = new Led.Array([
      this.a, this.b, this.c
    ]);

    test.equal(leds.length, 3);
    test.done();
  }
};

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

  params: function(test) {
    var led;

    test.expect(9);

    // Test object constructor
    led = new Led.RGB({
      pins: {
        red: 9,
        green: 10,
        blue: 11,
      }
    });
    test.equal(led.red.pin, 9);
    test.equal(led.green.pin, 10);
    test.equal(led.blue.pin, 11);

    // Test object constructor with array
    led = new Led.RGB({
      pins: [9, 10, 11]
    });
    test.equal(led.red.pin, 9);
    test.equal(led.green.pin, 10);
    test.equal(led.blue.pin, 11);

    // Test array constructor
    led = new Led.RGB([9, 10, 11]);

    test.equal(led.red.pin, 9);
    test.equal(led.green.pin, 10);
    test.equal(led.blue.pin, 11);

    test.done();
  },

  color: function(test) {
    var redPin = 9,
      greenPin = 10,
      bluePin = 11,
      rgb = this.ledRgb;

    test.expect(39);

    // returns this
    test.equal(rgb.color("#000000"), rgb);

    // Hex values
    rgb.color("#0000ff");
    test.ok(this.analog.calledWith(redPin, 0x00));
    test.ok(this.analog.calledWith(greenPin, 0x00));
    test.ok(this.analog.calledWith(bluePin, 0xff));

    rgb.color("#ffff00");
    test.ok(this.analog.calledWith(redPin, 0xff));
    test.ok(this.analog.calledWith(greenPin, 0xff));
    test.ok(this.analog.calledWith(bluePin, 0x00));

    rgb.color("#bbccaa");
    test.ok(this.analog.calledWith(redPin, 0xbb));
    test.ok(this.analog.calledWith(greenPin, 0xcc));
    test.ok(this.analog.calledWith(bluePin, 0xaa));

    // without "#"
    rgb.color("0000ff");
    test.ok(this.analog.calledWith(redPin, 0x00));
    test.ok(this.analog.calledWith(greenPin, 0x00));
    test.ok(this.analog.calledWith(bluePin, 0xff));

    // three arguments
    rgb.color(255, 100, 50);
    test.ok(this.analog.calledWith(redPin, 255));
    test.ok(this.analog.calledWith(greenPin, 100));
    test.ok(this.analog.calledWith(bluePin, 50));

    // with constraints
    rgb.color(999, -999, 0);
    test.ok(this.analog.calledWith(redPin, 255));
    test.ok(this.analog.calledWith(greenPin, 0));

    // by object
    rgb.color({
      red: 255,
      green: 100,
      blue: 50
    });
    test.ok(this.analog.calledWith(redPin, 255));
    test.ok(this.analog.calledWith(greenPin, 100));
    test.ok(this.analog.calledWith(bluePin, 50));

    // by array
    rgb.color([255, 100, 50]);
    test.ok(this.analog.calledWith(redPin, 255));
    test.ok(this.analog.calledWith(greenPin, 100));
    test.ok(this.analog.calledWith(bluePin, 50));

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
      rgb.color({red: 255, green: 100});
    });
    test.throws(function() {
      rgb.color({red: 255, green: 100, blue: null});
    });
    test.throws(function() {
      rgb.color({red: 255, green: 100, blue: undefined});
    });

    //returns color if no params
    rgb.color([10, 20, 30]);
    test.deepEqual(rgb.color(), {
      red: 10, green: 20, blue: 30
    });

    test.done();
  },

  on: function(test) {
    var redPin = 9,
      greenPin = 10,
      bluePin = 11;

    test.expect(18);

    // Should default to #ffffff
    this.ledRgb.on();

    test.ok(this.analog.calledWith(redPin, 255));
    test.ok(this.analog.calledWith(greenPin, 255));
    test.ok(this.analog.calledWith(bluePin, 255));

    var color = this.ledRgb.color();
    test.equal(color.red, 255);
    test.equal(color.green, 255);
    test.equal(color.blue, 255);

    // Set a color and make sure .on() doesn't override
    this.ledRgb.color("#bbccaa");
    this.ledRgb.on();

    color = this.ledRgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    // And that those values are actually live
    var values = this.ledRgb.values;
    test.equal(values.red, 0xbb);
    test.equal(values.green, 0xcc);
    test.equal(values.blue, 0xaa);

    // Turn led off and back on to see if state restored
    this.ledRgb.off();
    this.ledRgb.on();
    color = this.ledRgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    values = this.ledRgb.values;
    test.equal(values.red, 0xbb);
    test.equal(values.green, 0xcc);
    test.equal(values.blue, 0xaa);


    test.done();
  },

  off: function(test) {
    var redPin = 9,
      greenPin = 10,
      bluePin = 11;

    test.expect(9);

    this.ledRgb.color("#bbccaa");
    this.ledRgb.off();
    test.ok(this.analog.calledWith(redPin, 0));
    test.ok(this.analog.calledWith(greenPin, 0));
    test.ok(this.analog.calledWith(bluePin, 0));

    // Test saved state
    var color = this.ledRgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    // Test live values
    var values = this.ledRgb.values;
    test.equal(values.red, 0);
    test.equal(values.green, 0);
    test.equal(values.blue, 0);


    test.done();
  },

  stop: function(test) {
    test.expect(2);

    this.ledRgb.strobe();
    test.ok(this.ledRgb.isRunning);
    this.ledRgb.stop();
    test.ok(!this.ledRgb.isRunning);

    test.done();
  },

  toggle: function(test) {
    var color,
      values;

    test.expect(11);

    // Sets color and turns it on
    this.ledRgb.color("#bbccaa");

    // toggle it off after setting color
    this.ledRgb.toggle();

    // test isOn property properly set
    // after turning off
    test.ok(!this.ledRgb.isOn);

    // Color should still be #bbccaa
    // but values should be 0
    color = this.ledRgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    values = this.ledRgb.values;
    test.equal(values.red, 0);
    test.equal(values.green, 0);
    test.equal(values.blue, 0);

    // test isOn property properly set
    // after turning back on
    this.ledRgb.toggle();
    test.ok(this.ledRgb.isOn);

    // Should have gone back to #bbccaa
    values = this.ledRgb.values;
    test.equal(values.red, 0xbb);
    test.equal(values.green, 0xcc);
    test.equal(values.blue, 0xaa);


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
      analogWrite: function() {}
    };

    this.board.io.analogWrite = function(pin, value) {
      this.io.analogWrite(pin, value);
    }.bind(this);

    this.analog = sinon.spy(this.io, "analogWrite");

    done();
  },

  isAnode: function (test) {
    test.expect(1);

    test.equal(this.ledRgb.isAnode, true);

    test.done();
  },

  color: function(test) {
    var redPin = 9,
      greenPin = 10,
      bluePin = 11;

    test.expect(25);

    // returns this
    test.equal(this.ledRgb.color("#000000"), this.ledRgb);

    // Hex values
    this.ledRgb.color("#0000ff");
    test.ok(this.analog.calledWith(redPin, 0xff));
    test.ok(this.analog.calledWith(greenPin, 0xff));
    test.ok(this.analog.calledWith(bluePin, 0x00));

    this.ledRgb.color("#ffff00");
    test.ok(this.analog.calledWith(redPin, 0x00));
    test.ok(this.analog.calledWith(greenPin, 0x00));
    test.ok(this.analog.calledWith(bluePin, 0xff));

    this.ledRgb.color("#bbccaa");
    test.ok(this.analog.calledWith(redPin, 0x44));
    test.ok(this.analog.calledWith(greenPin, 0x33));
    test.ok(this.analog.calledWith(bluePin, 0x55));

    // without "#"
    this.ledRgb.color("0000ff");
    test.ok(this.analog.calledWith(redPin, 0xff));
    test.ok(this.analog.calledWith(greenPin, 0xff));
    test.ok(this.analog.calledWith(bluePin, 0x00));

    // three arguments
    this.ledRgb.color(255, 100, 50);
    test.ok(this.analog.calledWith(redPin, 0));
    test.ok(this.analog.calledWith(greenPin, 155));
    test.ok(this.analog.calledWith(bluePin, 205));

    // with constraints
    this.ledRgb.color(999, -999, 0);
    test.ok(this.analog.calledWith(redPin, 0));
    test.ok(this.analog.calledWith(greenPin, 255));

    // by object
    this.ledRgb.color({
      red: 255,
      green: 100,
      blue: 50
    });
    test.ok(this.analog.calledWith(redPin, 0));
    test.ok(this.analog.calledWith(greenPin, 155));
    test.ok(this.analog.calledWith(bluePin, 205));

    // by array
    this.ledRgb.color([255, 100, 50]);
    test.ok(this.analog.calledWith(redPin, 0));
    test.ok(this.analog.calledWith(greenPin, 155));
    test.ok(this.analog.calledWith(bluePin, 205));

    //returns color
    this.ledRgb.color([10, 20, 30]);
    test.deepEqual(this.ledRgb.color(), {
      red: 10, green: 20, blue: 30
    });

    test.done();
  },

  on: function(test) {
    var redPin = 9,
      greenPin = 10,
      bluePin = 11;

    test.expect(18);

    // Should default to #ffffff
    this.ledRgb.on();

    test.ok(this.analog.calledWith(redPin, 0));
    test.ok(this.analog.calledWith(greenPin, 0));
    test.ok(this.analog.calledWith(bluePin, 0));

    var color = this.ledRgb.color();
    test.equal(color.red, 255);
    test.equal(color.green, 255);
    test.equal(color.blue, 255);

    // Set a color and make sure .on() doesn't override
    this.ledRgb.color("#bbccaa");
    this.ledRgb.on();

    color = this.ledRgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    // And that those values are actually live
    var values = this.ledRgb.values;
    test.equal(values.red, 0xbb);
    test.equal(values.green, 0xcc);
    test.equal(values.blue, 0xaa);

    // Turn led off and back on to see if state restored
    this.ledRgb.off();
    this.ledRgb.on();
    color = this.ledRgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    values = this.ledRgb.values;
    test.equal(values.red, 0xbb);
    test.equal(values.green, 0xcc);
    test.equal(values.blue, 0xaa);


    test.done();
  },

  off: function(test) {
    var redPin = 9,
      greenPin = 10,
      bluePin = 11;

    test.expect(9);

    this.ledRgb.color("#bbccaa");
    this.ledRgb.off();
    test.ok(this.analog.calledWith(redPin, 255));
    test.ok(this.analog.calledWith(greenPin, 255));
    test.ok(this.analog.calledWith(bluePin, 255));

    // Test saved state
    var color = this.ledRgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    // Test live values
    var values = this.ledRgb.values;
    test.equal(values.red, 0);
    test.equal(values.green, 0);
    test.equal(values.blue, 0);


    test.done();
  },

  toggle: function(test) {
    var color,
      values;

    test.expect(11);

    // Sets color and turns it on
    this.ledRgb.color("#bbccaa");

    // toggle it off after setting color
    this.ledRgb.toggle();

    // test isOn property properly set
    // after turning off
    test.ok(!this.ledRgb.isOn);

    // Color should still be #bbccaa
    // but values should be 0
    color = this.ledRgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    values = this.ledRgb.values;
    test.equal(values.red, 0);
    test.equal(values.green, 0);
    test.equal(values.blue, 0);

    // test isOn property properly set
    // after turning back on
    this.ledRgb.toggle();
    test.ok(this.ledRgb.isOn);

    // Should have gone back to #bbccaa
    values = this.ledRgb.values;
    test.equal(values.red, 0xbb);
    test.equal(values.green, 0xcc);
    test.equal(values.blue, 0xaa);


    test.done();
  }

};


exports["Led - Default Pin w/ Firmata"] = {
  shape: function(test) {
    test.expect(8);

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
    sinon.stub(five.Board.Pins.prototype, "isPwm").returns(true);

    test.equal(new Led(12).mode, 3);
    test.equal(new Led({
      type: "PWM"
    }).mode, 3);

    test.done();
  }
};
