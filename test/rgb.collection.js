require("./common/bootstrap");

var rgbCollectionProtoProperties = [{
  name: "on"
}, {
  name: "off"
}, {
  name: "color"
}, {
  name: "toggle"
}, {
  name: "blink"
}, {
  name: "stop"
}, {
  name: "intensity"
}, {
  name: "@@normalize"
}, {
  name: "@@render"
}, {
  name: "@@keys",
  typeof: "object"
}];

function testLedRgbCollectionShape(test) {
  test.expect(rgbCollectionProtoProperties.length);

  rgbCollectionProtoProperties.forEach(function(method) {
    var tOf = method.typeof || "function";
    test.equal(typeof this.rgbs[method.name], tOf);
  }, this);

  test.done();
}

exports["RGB.Collection"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    // Make all of these PWM pins for testing
    this.board.io.pins.forEach(function(pin) {
      pin.supportedModes.push(3);
    });

    this.a = new RGB({
      pins: [3, 5, 6],
      board: this.board
    });

    this.b = new RGB({
      pins: [9, 10, 11],
      board: this.board
    });

    this.rgbs = new RGB.Collection([
      this.a,
      this.b,
    ]);

    [
      "off", "on", "intensity"
    ].forEach(function(method) {
      this[method] = this.sandbox.spy(RGB.prototype, method);
    }.bind(this));

    done();
  },

  tearDown: function(done) {
    this.board.io.pins.forEach(function(pin) {
      pin.supportedModes.pop();
    });

    Board.purge();
    RGB.purge();
    this.sandbox.restore();
    done();
  },

  instanceof: function(test) {
    test.expect(1);
    test.equal(RGB.Collection([ {pins: [3, 4, 5]}, {pins: [9, 10, 11]} ]) instanceof RGB.Collection, true);
    test.done();
  },

  shape: testLedRgbCollectionShape,

  initFromObject: function(test) {
    test.expect(1);

    var rgbs = new RGB.Collection({
      pins: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      board: this.board,
    });

    test.equal(rgbs.length, 2);
    test.done();
  },

  initFromArrayOfPinNumbers: function(test) {
    test.expect(1);

    var rgbs = new RGB.Collection([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    test.equal(rgbs.length, 2);
    test.done();
  },

  initFromArrayOfRGBOptions: function(test) {
    test.expect(1);

    var rgbs = new RGB.Collection([
      { pins: [1, 2, 3], board: this.board },
      { pins: [4, 5, 6], board: this.board },
    ]);

    test.equal(rgbs.length, 2);
    test.done();
  },


  initFromLeds: function(test) {
    test.expect(1);

    var rgbs = new RGB.Collection([this.a, this.b]);

    test.equal(rgbs.length, 2);
    test.done();
  },

  blink: function(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.blink = this.sandbox.stub(RGB.prototype, "blink");
    this.stop = this.sandbox.stub(RGB.prototype, "stop");

    var rgbs = new RGB.Collection([this.a, this.b]);

    rgbs.blink().stop();

    test.equal(this.blink.callCount, 2);
    test.equal(this.stop.callCount, 2);

    test.done();
  },

  callbacks: function(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.blink = this.sandbox.stub(RGB.prototype, "blink");

    var noop = function() {};
    var rgbs = new RGB.Collection([this.a, this.b]);

    rgbs.blink(1, noop);

    test.equal(this.blink.callCount, 2);
    test.notEqual(this.blink.lastCall.args[1], noop);
    test.done();
  },

  callbacksNoDuration: function(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.blink = this.sandbox.stub(RGB.prototype, "blink", function(duration, cb) {
      cb();
    });

    var rgbs = new RGB.Collection([this.a, this.b]);
    var callback = this.sandbox.spy(function() {
      test.equal(this.blink.callCount, 2);
      test.equal(callback.callCount, 1);
      test.done();
    }.bind(this));

    rgbs.blink(callback);

    this.clock.tick(1000);
  },

  noCallbackNoop: function(test) {
    test.expect(2);

    var spy = this.sandbox.spy();

    this.clock = this.sandbox.useFakeTimers();
    this.blink = this.sandbox.stub(RGB.prototype, "blink", function(duration, callback) {
      spy();
      callback();
    });

    var rgbs = new RGB.Collection([this.a, this.b]);

    rgbs.blink();

    test.equal(this.blink.callCount, 2);
    test.equal(spy.callCount, 2);
    test.done();
  },

  "Animation.normalize": function(test) {
    test.expect(1);

    var rgbs = new RGB.Collection([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    var normalized = rgbs[Animation.normalize]([
      [
        null,
        {color: "red"},
        null,
        [255, 99, 0],
        {color: "ffff00"},
        {color: { red: 0x00, green: 0xFF, blue: 0x00 } },
        {color: "indigo"},
        "#4B0082",
      ],
      [
        null,
        {color: "red"},
        null,
        [255, 99, 0],
        {color: "ffff00"},
        {color: { red: 0x00, green: 0xFF, blue: 0x00 } },
        {color: "indigo"},
        "#4B0082",
      ]
    ]);

    test.deepEqual(normalized, [
      [
        { easing: "linear", value: { red: 0, green: 0, blue: 0 } },
        { easing: "linear", value: { red: 255, green: 0, blue: 0 } },
        null,
        { easing: "linear", value: { red: 255, green: 99, blue: 0 } },
        { easing: "linear", value: { red: 255, green: 255, blue: 0 } },
        { easing: "linear", value: { red: 0, green: 255, blue: 0 } },
        { easing: "linear", value: { red: 75, green: 0, blue: 130 } },
        { easing: "linear", value: { red: 75, green: 0, blue: 130 } },
      ],
      [
        { easing: "linear", value: { red: 0, green: 0, blue: 0 } },
        { easing: "linear", value: { red: 255, green: 0, blue: 0 } },
        null,
        { easing: "linear", value: { red: 255, green: 99, blue: 0 } },
        { easing: "linear", value: { red: 255, green: 255, blue: 0 } },
        { easing: "linear", value: { red: 0, green: 255, blue: 0 } },
        { easing: "linear", value: { red: 75, green: 0, blue: 130 } },
        { easing: "linear", value: { red: 75, green: 0, blue: 130 } },
      ]
    ]);

    test.done();
  },


  "Animation.normalize: frame === null": function(test) {
    test.expect(1);

    var rgbs = new RGB.Collection([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    var normalized = rgbs[Animation.normalize]([
      [
        {color: "red"},
      ],
      null,
    ]);

    test.deepEqual(normalized, [
      [ { easing: "linear", value: { red: 255, green: 0, blue: 0 } } ],
      null
    ]);
    test.done();
  },


  "Animation.render": function(test) {
    test.expect(4);

    var rgbs = new RGB.Collection([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    rgbs.each(function(rgb) {
      this.sandbox.stub(rgb, "write");
    }.bind(this));

    rgbs[Animation.render]([
      { red: 0xff, green: 0x00, blue: 0x00 },
      { red: 0x00, green: 0xff, blue: 0x00 },
    ]);

    test.equal(rgbs[0].write.callCount, 1);
    test.deepEqual(rgbs[0].write.firstCall.args[0], {
      red: 0xff,
      green: 0x00,
      blue: 0x00
    });

    test.equal(rgbs[1].write.callCount, 1);
    test.deepEqual(rgbs[1].write.firstCall.args[0], {
      red: 0x00,
      green: 0xff,
      blue: 0x00
    });

    test.done();
  },
};

