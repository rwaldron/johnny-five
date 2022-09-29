require("./common/bootstrap");

const rgbProtoProperties = [{
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

const rgbInstanceProperties = [];


function shape(test) {
  test.expect(rgbProtoProperties.length + rgbInstanceProperties.length);

  rgbProtoProperties.forEach(({name}) => test.equal(typeof this.rgb[name], "function"));
  rgbInstanceProperties.forEach(({name}) => test.notEqual(typeof this.rgb[name], "undefined"));

  test.done();
}

exports["RGB"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");

    this.rgb = new RGB({
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

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape,

  instanceof(test) {
    test.expect(1);
    test.equal(new RGB({ pins: [ 3, 5, 6 ] }) instanceof RGB, true);
    test.done();
  },
  params(test) {
    let led;

    test.expect(5);

    // Test object constructor
    led = new RGB({
      pins: {
        red: 9,
        green: 10,
        blue: 11,
      }
    });
    test.deepEqual(led.pins, [9, 10, 11]);

    // Test object constructor with array
    led = new RGB({
      pins: [9, 10, 11]
    });
    test.deepEqual(led.pins, [9, 10, 11]);

    // Test array constructor
    led = new RGB([9, 10, 11]);
    test.deepEqual(led.pins, [9, 10, 11]);

    // Non-PWM digital pin
    test.throws(() => {
      new RGB({
        pins: [2, 3, 4],
        debug: true,
      });
    }, /Pin Error: 2 is not a valid PWM pin \(Led\.RGB\)/);

    // Analog pin
    test.throws(() => {
      new RGB({
        pins: ["A0", "A1", "A2"],
        debug: true,
      });
    }, /Pin Error: \d+ is not a valid PWM pin \(Led\.RGB\)/);

    test.done();
  },

  write(test) {
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

  color(test) {
    const rgb = this.rgb;

    test.expect(46);

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

    // CSS functional notation
    this.rgb.color("rgb(255, 100, 50)");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 255,
      green: 100,
      blue: 50
    }));
    this.write.reset();

    // CSS functional notation with alpha
    // Subtle bug: Alpha is translated to intensity using linear scaling
    // when it should probably use logarithmic scaling.
    this.rgb.color("rgba(255, 100, 50, 0.5)");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 128,
      green: 50,
      blue: 25
    }));
    this.write.reset();

    // CSS4 functional notation (rgb and rgba become aliases)
    this.rgb.color("rgba(255, 100, 50)");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 255,
      green: 100,
      blue: 50
    }));
    this.write.reset();

    // CSS4 functional notation with alpha (rgb and rgba become aliases)
    // Also testing with no spaces to make sure that's supported.
    this.rgb.color("rgb(255,100,50,0.5)");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 128,
      green: 50,
      blue: 25
    }));
    this.write.reset();

    // CSS4 functional notation without commas
    this.rgb.color("rgb(255 100 50)");
    test.ok(this.write.calledOnce);
    test.ok(this.write.calledWith({
      red: 255,
      green: 100,
      blue: 50
    }));
    this.write.reset();

    // bad values
    test.throws(() => {
      rgb.color(null);
    });

    // shorthand not supported
    test.throws(() => {
      rgb.color("#fff");
    });

    // bad hex
    test.throws(() => {
      rgb.color("#ggffff");
    });
    test.throws(() => {
      rgb.color("#ggffffff");
    });
    test.throws(() => {
      rgb.color("#ffffffff");
    });

    // bad color names
    test.throws(() => {
      rgb.color("not a real color");
    });
    test.throws(() => {
      rgb.color("#papayawhip");
    });

    // missing/null/undefined param
    test.throws(() => {
      rgb.color(10, 20);
    });
    test.throws(() => {
      rgb.color(10, 20, null);
    });
    test.throws(() => {
      rgb.color(10, undefined, 30);
    });

    // missing/null/undefined value in array
    test.throws(() => {
      rgb.color([10, 20]);
    });
    test.throws(() => {
      rgb.color([10, null, 30]);
    });
    test.throws(() => {
      rgb.color([10, undefined, 30]);
    });

    // missing/null/undefined value in object
    test.throws(() => {
      rgb.color({
        red: 255,
        green: 100
      });
    });
    test.throws(() => {
      rgb.color({
        red: 255,
        green: 100,
        blue: null
      });
    });
    test.throws(() => {
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

  on(test) {
    let color;

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
    let values = this.rgb.values;
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

  off(test) {
    test.expect(8);

    this.rgb.color("#bbccaa");
    this.rgb.on();
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
    const color = this.rgb.color();
    test.equal(color.red, 0xbb);
    test.equal(color.green, 0xcc);
    test.equal(color.blue, 0xaa);

    // Test live values
    const values = this.rgb.values;
    test.equal(values.red, 0);
    test.equal(values.green, 0);
    test.equal(values.blue, 0);

    test.done();
  },

  stop(test) {
    test.expect(2);

    this.rgb.strobe();
    test.ok(this.rgb.isRunning);
    this.rgb.stop();
    test.ok(!this.rgb.isRunning);
    test.done();
  },

  toggle(test) {
    test.expect(7);

    const on = this.sandbox.spy(this.rgb, "on");
    const off = this.sandbox.spy(this.rgb, "off");

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

  blink(test) {
    test.expect(1);
    test.equal(this.rgb.blink, this.rgb.strobe);
    test.done();
  },

  blinkDuration(test) {
    test.expect(1);

    this.clock = this.sandbox.useFakeTimers();
    this.toggle = this.sandbox.spy(this.rgb, "toggle");

    this.rgb.blink(100);
    this.clock.tick(100);

    test.equal(this.toggle.callCount, 1);
    test.done();
  },

  blinkCallback(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.spy = this.sandbox.spy();
    this.toggle = this.sandbox.spy(this.rgb, "toggle");

    this.rgb.blink(this.spy);
    this.clock.tick(100);

    test.equal(this.spy.callCount, 1);
    test.equal(this.toggle.callCount, 1);
    test.done();
  },

  blinkDurationCallback(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.spy = this.sandbox.spy();
    this.toggle = this.sandbox.spy(this.rgb, "toggle");

    this.rgb.blink(5, this.spy);
    this.clock.tick(5);

    test.equal(this.spy.callCount, 1);
    test.equal(this.toggle.callCount, 1);
    test.done();
  },

  intensity(test) {
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
  },


  "Animation.normalize"(test) {
    test.expect(1);

    this.rgb.color("red");

    const normalized = this.rgb[Animation.normalize]([
      null,
      {color: "red"},
      [255, 99, 0],
      {color: "ffff00"},
      {color: { red: 0x00, green: 0xFF, blue: 0x00 } },
      {color: "indigo"},
      "#4B0082",
    ]);

    test.deepEqual(normalized, [
      { easing: "linear", value: { red: 255, green: 0, blue: 0 } },
      { easing: "linear", value: { red: 255, green: 0, blue: 0 } },
      { easing: "linear", value: { red: 255, green: 99, blue: 0 } },
      { easing: "linear", value: { red: 255, green: 255, blue: 0 } },
      { easing: "linear", value: { red: 0, green: 255, blue: 0 } },
      { easing: "linear", value: { red: 75, green: 0, blue: 130 } },
      { easing: "linear", value: { red: 75, green: 0, blue: 130 } },
    ]);

    test.done();
  },

  "Animation.normalize: frame === null"(test) {
    test.expect(1);

    const normalized = this.rgb[Animation.normalize]([
      null,
      {color: "red"},
      null,
    ]);

    test.deepEqual(normalized, [
      { easing: "linear", value: { red: 0, green: 0, blue: 0 } },
      { easing: "linear", value: { red: 255, green: 0, blue: 0 } },
      null,
    ]);

    test.done();
  },

  "Animation.normalize: no existing values"(test) {
    test.expect(1);

    const normalized = this.rgb[Animation.normalize]([
      null,
    ]);

    test.deepEqual(normalized, [
      { easing: "linear", value: { red: 0, green: 0, blue: 0 } },
    ]);

    test.done();
  },

  "Animation.normalize: intensity"(test) {
    test.expect(3);

    this.ToRGB = this.sandbox.spy(RGB, "ToRGB");
    this.ToScaledRGB = this.sandbox.spy(RGB, "ToScaledRGB");

    this.rgb.color("red");

    const normalized = this.rgb[Animation.normalize]([
      { intensity: 100, color: { red: 0, green: 0, blue: 0 } }
    ]);

    test.deepEqual(normalized, [
      { easing: "linear", value: { red: 0, green: 0, blue: 0 } },
    ]);

    test.deepEqual(this.ToRGB.lastCall.args, [{ red: 0, green: 0, blue: 0 }]);
    test.deepEqual(this.ToScaledRGB.lastCall.args, [ 100, { red: 0, green: 0, blue: 0 } ]);

    test.done();
  },

  "Animation.normalize: easing"(test) {
    test.expect(1);

    const normalized = this.rgb[Animation.normalize]([
      { easing: "foo", intensity: 100, color: { red: 0, green: 0, blue: 0 } }
    ]);

    test.deepEqual(normalized, [
      { easing: "foo", value: { red: 0, green: 0, blue: 0 } },
    ]);

    test.done();
  },

  "Animation.normalize: invalid to send just a number to RGB animation"(test) {
    test.expect(1);

    test.throws(() => {
      this.rgb[Animation.normalize]([
        0,
      ]);
    });

    test.done();
  },

  "Animation.render"(test) {
    test.expect(1);
    this.color = this.sandbox.stub(this.rgb, "color");
    this.rgb[Animation.render]([0]);
    test.equal(this.color.callCount, 1);
    test.done();
  },

};

exports["10-bit RGB"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");

    // Override PWM Resolution
    this.board.RESOLUTION.PWM = 1023;

    this.rgb = new RGB({
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

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  write(test) {
    test.expect(4);

    this.rgb.write({
      red: 0xbb, // 750 or 0x2ee
      green: 0xcc, // 819 or 0x333
      blue: 0xaa // 682 or 0x2aa
    });

    test.ok(this.analogWrite.callCount, 3);
    test.deepEqual(this.analogWrite.getCall(3).args, [9, 0x2ee]);
    test.deepEqual(this.analogWrite.getCall(4).args, [10, 0x332]);
    test.deepEqual(this.analogWrite.getCall(5).args, [11, 0x2aa]);

    test.done();
  }
};

exports["10-bit RGB Common Anode"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");

    // Override PWM Resolution
    this.board.RESOLUTION.PWM = 1023;

    this.rgb = new RGB({
      pins: {
        red: 9,
        green: 10,
        blue: 11,
      },
      isAnode: true,
      board: this.board
    });

    this.write = this.sandbox.spy(this.rgb, "write");

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  write(test) {
    test.expect(4);

    this.analogWrite.reset();

    this.rgb.write({
      red: 0xbb, // 187 -> 68 -> 273 -> 0x111
      green: 0xcc, // 204 -> 51 -> 204 -> 0xCC
      blue: 0xaa // 170 -> 85 -> 341 -> 0x155
    });

    test.ok(this.analogWrite.callCount, 3);
    test.deepEqual(this.analogWrite.getCall(0).args, [9, 0x110]);
    test.deepEqual(this.analogWrite.getCall(1).args, [10, 0xCC]);
    test.deepEqual(this.analogWrite.getCall(2).args, [11, 0x155]);

    test.done();
  }
};

exports["RGB - Cycling Operations"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.stop = this.sandbox.spy(RGB.prototype, "stop");
    this.enqueue = this.sandbox.stub(Animation.prototype, "enqueue");

    this.rgb = new RGB({
      pins: [3, 5, 6],
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  rgbCallsStopBeforeNextCyclingOperation(test) {
    test.expect(1);

    this.rgb.blink();

    test.equal(this.stop.callCount, 1);

    // Ensure that the interval is cleared.
    this.rgb.stop();
    test.done();
  },

};

exports["RGB - Common Anode"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.rgb = new RGB({
      pins: {
        red: 9,
        green: 10,
        blue: 11,
      },
      isAnode: true,
      board: this.board
    });

    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  isAnode(test) {
    test.expect(1);

    test.equal(this.rgb.isAnode, true);

    test.done();
  },

  write(test) {
    test.expect(4);

    this.rgb.write({
      red: 0xbb,
      green: 0xcc,
      blue: 0xaa
    });
    test.ok(this.analogWrite.callCount, 3);
    test.ok(this.analogWrite.calledWith(9, 0x44));
    test.ok(this.analogWrite.calledWith(10, 0x33));
    test.ok(this.analogWrite.calledWith(11, 0x55));

    test.done();
  }
};

exports["RGB - PCA9685 (I2C)"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.rgb = new RGB({
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

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    Expander.purge();
    done();
  },

  shape,

  defaultFrequency(test) {
    test.expect(1);
    test.equal(this.rgb.frequency, 200);
    test.done();
  },

  customFrequency(test) {
    test.expect(1);

    this.rgb = new RGB({
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

  normalization(test) {
    test.expect(1);

    this.a = new RGB({
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

  write(test) {
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

exports["RGB - PCA9685 (I2C) Common Anode"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.rgb = new RGB({
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

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    Expander.purge();
    done();
  },

  shape,

  write(test) {
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

exports["RGB - BlinkM (I2C)"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.rgb = new RGB({
      controller: "BlinkM",
      board: this.board
    });

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape,

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new RGB({
      controller: "BlinkM",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  write(test) {
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

exports["RGB - Esplora"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    this.rgb = new RGB({
      controller: "Esplora",
      board: this.board
    });

    this.analog = this.sandbox.spy(MockFirmata.prototype, "analogWrite");

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape,

  initialization(test) {
    test.expect(1);

    test.deepEqual(this.rgb.pins, [5, 10, 9]);

    test.done();
  },

  write(test) {
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

exports["RGB.ToRGB"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.ToRGB = this.sandbox.spy(Led.RGB, "ToRGB");
    this.keywordRgb = this.sandbox.spy(converter.keyword, "rgb");
    done();
  },

  tearDown(done) {
    this.sandbox.restore();
    done();
  },

  "ToRGB(null)"(test) {
    test.expect(1);
    test.throws(() => {
      Led.RGB.ToRGB(null);
    });
    test.done();
  },

  "ToRGB(undefined)"(test) {
    test.expect(1);
    test.throws(() => {
      Led.RGB.ToRGB(undefined);
    });
    test.done();
  },

  "ToRGB([Byte, Byte, Byte])"(test) {
    test.expect(2);
    test.deepEqual(Led.RGB.ToRGB([0x00, 0x00, 0x00]), { red: 0, green: 0, blue: 0 });
    test.equal(this.ToRGB.callCount, 1);
    test.done();
  },

  "ToRGB({ red, green, blue })"(test) {
    test.expect(2);
    test.deepEqual(Led.RGB.ToRGB({ red: 0, green: 0, blue: 0 }), { red: 0, green: 0, blue: 0 });
    test.equal(this.ToRGB.callCount, 1);
    test.done();
  },

  "ToRGB('hex')"(test) {
    test.expect(2);
    test.deepEqual(Led.RGB.ToRGB("000000"), { red: 0, green: 0, blue: 0 });
    test.equal(this.ToRGB.callCount, 1);
    test.done();
  },

  "ToRGB('#hex')"(test) {
    test.expect(2);
    test.deepEqual(Led.RGB.ToRGB("#000000"), { red: 0, green: 0, blue: 0 });
    test.equal(this.ToRGB.callCount, 1);
    test.done();
  },

  "ToRGB('name')"(test) {
    test.expect(3);
    test.deepEqual(Led.RGB.ToRGB("red"), { red: 0xFF, green: 0, blue: 0 });
    // This is called TWICE because the name is
    // translated, and the resulting object is
    // passed as an argument to color(...)
    test.equal(this.ToRGB.callCount, 2);
    test.equal(this.keywordRgb.callCount, 1);
    test.done();
  },

  "ToRGB(red, green, blue)"(test) {
    test.expect(2);
    test.deepEqual(Led.RGB.ToRGB(0xFF, 0x00, 0x00), { red: 0xFF, green: 0, blue: 0 });
    test.equal(this.ToRGB.callCount, 1);
    test.done();
  },

  "ToRGB('rgb(r, g, b)')"(test) {
    test.expect(4);

    test.deepEqual(Led.RGB.ToRGB("rgb(255,0,0)"), { red: 255, green: 0, blue: 0 });
    test.deepEqual(Led.RGB.ToRGB("rgb(255, 0, 0)"), { red: 255, green: 0, blue: 0 });
    test.deepEqual(Led.RGB.ToRGB("rgb(100%, 0%, 0%)"), { red: 255, green: 0, blue: 0 });
    test.equal(this.ToRGB.callCount, 3);
    test.done();
  },

  "ToRGB('rgba(r, g, b, a)')"(test) {
    test.expect(5);
    test.deepEqual(Led.RGB.ToRGB("rgb(255,0,0,1)"), { red: 255, green: 0, blue: 0 });
    test.deepEqual(Led.RGB.ToRGB("rgb(255, 0, 0, 1)"), { red: 255, green: 0, blue: 0 });
    test.deepEqual(Led.RGB.ToRGB("rgb(255, 0, 0, 0.5)"), { red: 128, green: 0, blue: 0 });
    test.deepEqual(Led.RGB.ToRGB("rgb(100%, 0%, 0%, 50%)"), { red: 128, green: 0, blue: 0 });
    test.equal(this.ToRGB.callCount, 4);
    test.done();
  },

  "ToRGB('rgb(r g b)')"(test) {
    test.expect(3);
    test.deepEqual(Led.RGB.ToRGB("rgb(255 0 0)"), { red: 255, green: 0, blue: 0 });
    test.deepEqual(Led.RGB.ToRGB("rgb(100% 0% 0%)"), { red: 255, green: 0, blue: 0 });
    test.equal(this.ToRGB.callCount, 2);
    test.done();
  },

  "ToRGB('rgba(r g b a)')"(test) {
    test.expect(4);
    test.deepEqual(Led.RGB.ToRGB("rgb(255 0 0 1)"), { red: 255, green: 0, blue: 0 });
    test.deepEqual(Led.RGB.ToRGB("rgb(255 0 0 0.5)"), { red: 128, green: 0, blue: 0 });
    test.deepEqual(Led.RGB.ToRGB("rgb(100% 0% 0% 50%)"), { red: 128, green: 0, blue: 0 });
    test.equal(this.ToRGB.callCount, 3);
    test.done();
  },

};

exports["RGB.ToScaledRGB"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.ToScaledRGB = this.sandbox.spy(Led.RGB, "ToScaledRGB");
    done();
  },

  tearDown(done) {
    this.sandbox.restore();
    done();
  },

  "ToScaledRGB(intensity, colors)"(test) {
    test.expect(101);

    const colors = Led.RGB.ToRGB(0xFF, 0x00, 0x00);

    for (let i = 0; i <= 100; i++) {
      test.equal(Led.RGB.ToScaledRGB(i, colors).red, Math.round(0xFF * (i / 100)));
    }
    test.done();
  },
};

Object.keys(RGB.Controllers).forEach(name => {
  exports[`RGB - Controller, ${name}`] = addControllerTest(RGB, RGB.Controllers[name], {
    controller: name,
    pins: [1, 2, 3]
  });
});
