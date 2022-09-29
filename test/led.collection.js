require("./common/bootstrap");



exports["Led.Collection"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    Led.purge();

    this.a = new Led({
      pin: 3,
      board: this.board
    });

    this.b = new Led({
      pin: 6,
      board: this.board
    });

    this.c = new Led({
      pin: 9,
      board: this.board
    });

    this.spies = [
      "brightness", "off"
    ];

    this.spies.forEach(method => {
      this[method] = this.sandbox.spy(Led.prototype, method);
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  instanceof(test) {
    test.expect(1);
    test.equal(new Leds([3, 7, 9]) instanceof Leds, true);
    test.done();
  },

  initFromLedNumbers(test) {
    test.expect(1);

    const leds = new Led.Collection([3, 7, 9]);

    test.equal(leds.length, 3);
    test.done();
  },

  initFromLeds(test) {
    test.expect(1);

    const leds = new Led.Collection([
      this.a, this.b, this.c
    ]);

    test.equal(leds.length, 3);
    test.done();
  },

  blink(test) {
    test.expect(2);

    this.blink = this.sandbox.stub(Led.prototype, "blink");
    this.stop = this.sandbox.stub(Led.prototype, "stop");

    const leds = new Led.Collection([
      this.a, this.b, this.c
    ]);

    leds.blink().stop();

    test.equal(this.blink.callCount, 3);
    test.equal(this.stop.callCount, 3);

    test.done();
  },

  callbacks(test) {
    test.expect(2);

    this.blink = this.sandbox.stub(Led.prototype, "blink");

    const noop = () => {};
    const leds = new Led.Collection([
      this.a, this.b, this.c
    ]);

    leds.blink(1, noop);

    test.equal(this.blink.callCount, 3);
    test.notEqual(this.blink.lastCall.args[1], noop);
    test.done();
  },

  ["Animation.normalize"](test) {
    test.expect(3);

    const leds = new Led.Collection([
      this.a, this.b, this.c
    ]);

    let normalized = leds[Animation.normalize]([
      [
        null,
        255,
      ],
      [
        null,
        255,
      ],
      [
        null,
        255,
      ],
    ]);

    test.deepEqual(normalized, [
      [
        { value: 0, easing: "linear" },
        { value: 255, easing: "linear" },
      ],
      [
        { value: 0, easing: "linear" },
        { value: 255, easing: "linear" },
      ],
      [
        { value: 0, easing: "linear" },
        { value: 255, easing: "linear" },
      ],
    ]);

    normalized = leds[Animation.normalize]([
      null,
      [
        null,
        255,
      ],
      [
        null,
        255,
      ],
    ]);

    test.deepEqual(normalized, [
      null,
      [
        { value: 0, easing: "linear" },
        { value: 255, easing: "linear" },
      ],
      [
        { value: 0, easing: "linear" },
        { value: 255, easing: "linear" },
      ],
    ]);

    normalized = leds[Animation.normalize]([
      [
        0,
        128
      ],
      [
        10,
        220,
      ],
      [
        0,
        255,
      ],
    ]);

    test.deepEqual(normalized, [
      [
        { value: 0, easing: "linear" },
        { value: 128, easing: "linear" }
      ],
      [
        { value: 10, easing: "linear" },
        { value: 220, easing: "linear" },
      ],
      [
        { value: 0, easing: "linear" },
        { value: 255, easing: "linear" },
      ],
    ]);

    test.done();
  },

  ["Animation.render"](test) {
    test.expect(4);

    this.render = this.sandbox.stub(Led.prototype, "@@render");

    const leds = new Led.Collection([
      this.a, this.b, this.c
    ]);

    leds[Animation.render]([1, 1, 1]);

    test.equal(this.render.callCount, 3);
    test.deepEqual(this.render.firstCall.args[0], [1]);
    test.deepEqual(this.render.secondCall.args[0], [1]);
    test.deepEqual(this.render.thirdCall.args[0], [1]);
    test.done();
  },

};

