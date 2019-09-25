require("./common/bootstrap");

const rgbCollectionProtoProperties = [{
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

  rgbCollectionProtoProperties.forEach((method) => {
    const tOf = method.typeof || "function";
    test.equal(typeof this.rgbs[method.name], tOf);
  });

  test.done();
}

exports["RGB.Collection"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();

    // Make all of these PWM pins for testing
    this.board.io.pins.forEach(({supportedModes}) => {
      supportedModes.push(3);
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
    ].forEach(method => {
      this[method] = this.sandbox.spy(RGB.prototype, method);
    });

    done();
  },

  tearDown(done) {
    this.board.io.pins.forEach(({supportedModes}) => {
      supportedModes.pop();
    });

    Board.purge();
    RGB.purge();
    this.sandbox.restore();
    done();
  },

  instanceof(test) {
    test.expect(1);
    test.equal(new RGB.Collection([ {pins: [3, 4, 5]}, {pins: [9, 10, 11]} ]) instanceof RGB.Collection, true);
    test.done();
  },

  shape: testLedRgbCollectionShape,

  initFromObject(test) {
    test.expect(1);

    const rgbs = new RGB.Collection({
      pins: [
        [1, 2, 3],
        [4, 5, 6],
      ],
      board: this.board,
    });

    test.equal(rgbs.length, 2);
    test.done();
  },

  initFromArrayOfPinNumbers(test) {
    test.expect(1);

    const rgbs = new RGB.Collection([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    test.equal(rgbs.length, 2);
    test.done();
  },

  initFromArrayOfRGBOptions(test) {
    test.expect(1);

    const rgbs = new RGB.Collection([
      { pins: [1, 2, 3], board: this.board },
      { pins: [4, 5, 6], board: this.board },
    ]);

    test.equal(rgbs.length, 2);
    test.done();
  },


  initFromLeds(test) {
    test.expect(1);

    const rgbs = new RGB.Collection([this.a, this.b]);

    test.equal(rgbs.length, 2);
    test.done();
  },

  blink(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.blink = this.sandbox.stub(RGB.prototype, "blink");
    this.stop = this.sandbox.stub(RGB.prototype, "stop");

    const rgbs = new RGB.Collection([this.a, this.b]);

    rgbs.blink().stop();

    test.equal(this.blink.callCount, 2);
    test.equal(this.stop.callCount, 2);

    test.done();
  },

  callbacks(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.blink = this.sandbox.stub(RGB.prototype, "blink");

    const noop = () => {};
    const rgbs = new RGB.Collection([this.a, this.b]);

    rgbs.blink(1, noop);

    test.equal(this.blink.callCount, 2);
    test.notEqual(this.blink.lastCall.args[1], noop);
    test.done();
  },

  callbacksNoDuration(test) {
    test.expect(2);

    this.clock = this.sandbox.useFakeTimers();
    this.blink = this.sandbox.stub(RGB.prototype, "blink", (duration, cb) => {
      cb();
    });

    const rgbs = new RGB.Collection([this.a, this.b]);
    const callback = this.sandbox.spy(() => {
      test.equal(this.blink.callCount, 2);
      test.equal(callback.callCount, 1);
      test.done();
    });

    rgbs.blink(callback);

    this.clock.tick(1000);
  },

  noCallbackNoop(test) {
    test.expect(2);

    const spy = this.sandbox.spy();

    this.clock = this.sandbox.useFakeTimers();
    this.blink = this.sandbox.stub(RGB.prototype, "blink", (duration, callback) => {
      spy();
      callback();
    });

    const rgbs = new RGB.Collection([this.a, this.b]);

    rgbs.blink();

    test.equal(this.blink.callCount, 2);
    test.equal(spy.callCount, 2);
    test.done();
  },

  "Animation.normalize": function(test) {
    test.expect(1);

    const rgbs = new RGB.Collection([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    const normalized = rgbs[Animation.normalize]([
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

    const rgbs = new RGB.Collection([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    const normalized = rgbs[Animation.normalize]([
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
    test.expect(1);

    const rgbs = new RGB.Collection([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    this.color = this.sandbox.stub(RGB.prototype, "color");

    rgbs[Animation.render]([
      { red: 0xff, green: 0x00, blue: 0x00 },
      { red: 0x00, green: 0xff, blue: 0x00 },
    ]);

    test.equal(this.color.callCount, 2);
    test.done();
  },
};

