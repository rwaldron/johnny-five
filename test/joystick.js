require("./common/bootstrap");

const instance = [{
  name: "x"
}, {
  name: "y"
}];


exports["Joystick -- Analog"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.stick = new Joystick({
      pins: ["A0", "A1"],
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(instance.length);

    instance.forEach(function({name}) {
      test.notEqual(typeof this.stick[name], "undefined");
    }, this);

    test.done();
  },

  data(test) {
    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];
    const spy = this.sandbox.spy();

    test.expect(2);

    this.stick.on("data", spy);

    x(512);
    y(512);

    this.clock.tick(200);

    test.ok(spy.calledOnce);
    test.deepEqual(spy.args[0], [{
      x: 0,
      y: 0
    }]);

    test.done();
  },

  change(test) {
    test.expect(10);

    const spy = this.sandbox.spy();
    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];

    this.stick.on("change", spy);


    // FIRST -----------------------------------

    x(512);
    this.clock.tick(100);

    y(512);
    this.clock.tick(100);


    x(1023);
    this.clock.tick(100);

    y(1023);
    this.clock.tick(100);

    test.equal(this.stick.x, 1);
    test.equal(this.stick.y, 1);

    // SECOND -----------------------------------

    x(512);
    this.clock.tick(100);

    y(512);
    this.clock.tick(100);


    test.equal(this.stick.x, 0);
    test.equal(this.stick.y, 0);


    // THIRD -----------------------------------

    x(0);
    this.clock.tick(100);

    y(0);
    this.clock.tick(100);


    test.equal(this.stick.x, -1);
    test.equal(this.stick.y, -1);

    // // -----------------------------------

    test.equal(spy.callCount, 4);

    test.deepEqual(spy.args[0], [{
      x: 0,
      y: 0
    }]);

    test.deepEqual(spy.args[1], [{
      x: 1,
      y: 1
    }]);

    test.deepEqual(spy.args[2], [{
      x: 0,
      y: 0
    }]);

    test.done();
  },

  nochange(test) {
    test.expect(5);

    const spy = this.sandbox.spy();
    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];

    this.stick.on("change", spy);


    // FIRST -----------------------------------

    x(512);
    this.clock.tick(100);

    y(512);
    this.clock.tick(100);

    x(512);
    this.clock.tick(100);

    y(512);
    this.clock.tick(100);

    test.equal(this.stick.x, 0);
    test.equal(this.stick.y, 0);

    // SECOND -----------------------------------

    x(512);
    this.clock.tick(100);

    y(512);
    this.clock.tick(100);

    test.equal(this.stick.x, 0);
    test.equal(this.stick.y, 0);


    test.equal(spy.callCount, 1);

    test.done();
  },

  invertX(test) {
    test.expect(4);

    this.analogRead.reset();

    this.stick = new Joystick({
      pins: ["A0", "A1"],
      invertX: true,
      board: this.board
    });

    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];

    x(512);
    y(512);

    x(1023);
    y(1023);

    test.equal(this.stick.x, -1);
    test.equal(this.stick.y, 1);

    x(0);
    y(0);

    test.equal(this.stick.x, 1);
    test.equal(this.stick.y, -1);

    test.done();
  },
  invertY(test) {
    test.expect(4);

    this.analogRead.reset();

    this.stick = new Joystick({
      pins: ["A0", "A1"],
      invertY: true,
      board: this.board
    });

    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];


    x(512);
    y(512);

    x(1023);
    y(1023);

    test.equal(this.stick.x, 1);
    test.equal(this.stick.y, -1);

    x(0);
    y(0);

    test.equal(this.stick.x, -1);
    test.equal(this.stick.y, 1);

    test.done();
  },
  invert(test) {
    test.expect(4);

    this.analogRead.reset();

    this.stick = new Joystick({
      pins: ["A0", "A1"],
      invert: true,
      board: this.board
    });

    const x = this.analogRead.args[0][1];
    const y = this.analogRead.args[1][1];


    x(512);
    y(512);

    x(1023);
    y(1023);

    test.equal(this.stick.x, -1);
    test.equal(this.stick.y, -1);

    x(0);
    y(0);

    test.equal(this.stick.x, 1);
    test.equal(this.stick.y, 1);

    test.done();
  }
};

exports["Joystick -- ESPLORA"] = {

  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.stick = new Joystick({
      controller: "ESPLORA",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(instance.length);

    instance.forEach(function({name}) {
      test.notEqual(typeof this.stick[name], "undefined");
    }, this);

    test.done();
  },

  data(test) {
    test.expect(2);

    const spy = this.sandbox.spy();

    this.stick.on("data", spy);

    const x = this.analogRead.args[0][1];

    // This is REQUIRED for y to exist
    x(512);

    this.clock.tick(10);

    const y = this.analogRead.args[1][1];

    y(512);

    this.clock.tick(10);

    test.equal(spy.callCount, 1);

    test.deepEqual(spy.args[0], [{
      x: 0,
      y: 0
    }]);

    test.done();
  },

  change(test) {
    test.expect(10);

    const spy = this.sandbox.spy();

    this.stick.on("change", spy);


    // FIRST -----------------------------------

    let x = this.analogRead.args[0][1];

    // This is REQUIRED for y to exist
    x(512);

    this.clock.tick(10);

    let y = this.analogRead.args[1][1];

    y(512);

    this.clock.tick(10);

    x = this.analogRead.args[2][1];

    // This is REQUIRED for y to exist
    x(0);

    this.clock.tick(10);

    y = this.analogRead.args[3][1];

    y(0);

    this.clock.tick(10);

    test.equal(this.stick.x, -1);
    test.equal(this.stick.y, -1);

    // SECOND -----------------------------------

    x = this.analogRead.args[4][1];

    // This is REQUIRED for y to exist
    x(512);

    this.clock.tick(10);

    y = this.analogRead.args[5][1];

    y(512);

    this.clock.tick(10);

    test.equal(this.stick.x, 0);
    test.equal(this.stick.y, 0);

    // THIRD -----------------------------------

    x = this.analogRead.args[6][1];

    // This is REQUIRED for y to exist
    x(0);

    this.clock.tick(10);

    y = this.analogRead.args[7][1];

    y(0);

    this.clock.tick(10);

    test.equal(this.stick.x, -1);
    test.equal(this.stick.y, -1);

    // -----------------------------------

    test.equal(spy.callCount, 4);

    test.deepEqual(spy.args[0], [{
      x: 0,
      y: 0
    }]);

    test.deepEqual(spy.args[1], [{
      x: -1,
      y: -1
    }]);

    test.deepEqual(spy.args[2], [{
      x: 0,
      y: 0
    }]);


    test.done();
  },

  nochange(test) {
    test.expect(5);

    const spy = this.sandbox.spy();

    this.stick.on("change", spy);

    let x = this.analogRead.args[0][1];

    // This is REQUIRED for y to exist
    x(512);

    this.clock.tick(10);

    let y = this.analogRead.args[1][1];

    y(512);

    this.clock.tick(10);

    // FIRST -----------------------------------

    x = this.analogRead.args[2][1];

    x(512);

    this.clock.tick(10);

    y = this.analogRead.args[3][1];

    y(512);

    this.clock.tick(10);

    test.equal(this.stick.x, 0);
    test.equal(this.stick.y, 0);

    // SECOND -----------------------------------

    x = this.analogRead.args[4][1];

    x(512);

    this.clock.tick(10);

    y = this.analogRead.args[5][1];

    y(512);

    this.clock.tick(10);


    test.equal(this.stick.x, 0);
    test.equal(this.stick.y, 0);


    test.equal(spy.callCount, 1);

    test.done();
  },

  invertX(test) {
    test.expect(4);

    this.analogRead.reset();

    this.stick = new Joystick({
      controller: "ESPLORA",
      invertX: true,
      board: this.board
    });

    let x = this.analogRead.args[0][1];

    x(512);

    this.clock.tick(10);

    let y = this.analogRead.args[1][1];

    y(512);

    this.clock.tick(10);

    x = this.analogRead.args[2][1];

    x(1023);

    this.clock.tick(10);

    y = this.analogRead.args[3][1];

    y(1023);

    this.clock.tick(10);

    test.equal(this.stick.x, -1);
    test.equal(this.stick.y, 1);


    x(0);

    this.clock.tick(10);

    y(0);

    this.clock.tick(10);

    test.equal(this.stick.x, 1);
    test.equal(this.stick.y, -1);

    test.done();
  },
  invertY(test) {
    test.expect(4);

    this.analogRead.reset();

    this.stick = new Joystick({
      controller: "ESPLORA",
      invertY: true,
      board: this.board
    });

    let x = this.analogRead.args[0][1];

    x(512);

    this.clock.tick(10);

    let y = this.analogRead.args[1][1];

    y(512);

    this.clock.tick(10);

    x = this.analogRead.args[2][1];

    x(1023);

    this.clock.tick(10);

    y = this.analogRead.args[3][1];

    y(1023);

    this.clock.tick(10);


    test.equal(this.stick.x, 1);
    test.equal(this.stick.y, -1);

    x(0);

    this.clock.tick(10);

    y(0);

    this.clock.tick(10);

    test.equal(this.stick.x, -1);
    test.equal(this.stick.y, 1);

    test.done();
  },
  invert(test) {
    test.expect(4);

    this.analogRead.reset();

    this.stick = new Joystick({
      controller: "ESPLORA",
      invert: true,
      board: this.board
    });

    let x = this.analogRead.args[0][1];

    x(512);

    this.clock.tick(10);

    let y = this.analogRead.args[1][1];

    y(512);

    this.clock.tick(10);

    x = this.analogRead.args[2][1];

    x(1023);

    this.clock.tick(10);

    y = this.analogRead.args[3][1];

    y(1023);

    this.clock.tick(10);

    test.equal(this.stick.x, -1);
    test.equal(this.stick.y, -1);

    x(0);

    this.clock.tick(10);

    y(0);

    this.clock.tick(10);

    test.equal(this.stick.x, 1);
    test.equal(this.stick.y, 1);

    test.done();
  }
};

Object.keys(Joystick.Controllers).forEach(name => {
  exports[`Joystick - Controller, ${name}`] = addControllerTest(Joystick, Joystick.Controllers[name], {
    controller: name,
    pins: []
  });
});
