require("../common/bootstrap");

exports["Servo"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.servoWrite = this.sandbox.spy(MockFirmata.prototype, "servoWrite");

    done();
  },

  tearDown(done) {
    if (this.servo && this.servo.animation) {
      this.servo.animation.stop();
    }

    Board.purge();
    Servo.purge();
    this.sandbox.restore();

    done();
  },

  center(test) {
    test.expect(4);

    this.spy = this.sandbox.spy(Servo.prototype, "center");

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      center: true
    });

    // constructor called .center()
    test.ok(this.spy.called);


    // and servo is actually centered
    test.equal(this.servo.position, 90);


    this.servo.to(180);
    this.servo.center(1000, 100);

    setTimeout(() => {
      test.ok(this.servo.position > 90);
    }, 900);

    // it fired a move:complete event when finished
    this.servo.on("move:complete", () => {
      test.equal(this.servo.position, 90);
      test.done();
    });
  },

  min(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(180);
    this.servo.min(1000, 100);

    this.servo.on("move:complete", () => {
      test.equal(this.servo.position, 0);
      test.ok(this.servoWrite.callCount === 101, `Expected 101 calls to servoWrite. Saw ${this.servoWrite.callCount}`);
      test.done();
    });
  },



  min2(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(180);
    this.servo.min(1000, 100);

    this.servo.on("move:complete", () => {
      test.equal(this.servo.position, 0);
      test.ok(this.servoWrite.callCount === 101);
      test.done();
    });
  },

  rate(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(0);
    this.servo.to(180, 1000, 100);

    setTimeout(() => {
      test.equal(this.servo.position, 180);
      test.equal(this.servoWrite.callCount, 101);

      test.done();
    }, 1010);


  },

  min3(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(180);
    this.servo.min(1000, 100);

    this.servo.on("move:complete", () => {
      test.equal(this.servo.position, 0);
      test.ok(this.servoWrite.callCount === 101);
      test.done();
    });
  },

  min4(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(180);
    this.servo.min(1000, 100);

    this.servo.on("move:complete", () => {
      test.equal(this.servo.position, 0);
      test.ok(this.servoWrite.callCount === 101, `Expected 101 calls to servoWrite. Saw ${this.servoWrite.callCount}`);
      test.done();
    });
  },

  max(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(0);
    this.servo.max(1000, 100);
    //this.servo.to(180, 1000, 100);

    this.servo.on("move:complete", () => {
      test.equal(this.servo.position, 180);
      test.ok(this.servoWrite.callCount === 101, `Expected 101 calls to servoWrite. Saw ${this.servoWrite.callCount}`);
      test.done();
    });
  },

  completeMoveEmitted(test) {
    test.expect(1);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(0);
    this.servo.to(180, 1000, 100);

    this.servo.on("move:complete", () => {
      test.ok(this.servoWrite.callCount, 1);
      test.done();
    });
  },

  fps(test) {
    test.expect(1);

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      fps: 50
    });

    this.servo.to(0);
    this.servo.to(180, 1000);

    this.servo.on("move:complete", () => {
      test.ok(this.servoWrite.callCount === 51);
      test.done();
    });

  },

  toDegreesAndTimeWithOffset(test) {
    test.expect(2);

    this.servo = new Servo({
      board: this.board,
      pin: 11,
      offset: -10
    });

    this.servo.to(80, 100);

    this.servo.on("move:complete", () => {
      test.equal(this.servo.value, 80);
      test.equal(this.servoWrite.lastCall.args[1], 1300);
      test.done();
    });

  },

  toDegreesAndTimeWithOffsetAndInvert(test) {
    test.expect(2);

    this.servo = new Servo({
      board: this.board,
      pin: 11,
      offset: -10,
      invert: true
    });

    this.servo.to(80, 100);

    this.servo.on("move:complete", () => {
      test.equal(this.servo.value, 80);
      test.equal(this.servoWrite.lastCall.args[1], 1700);
      test.done();
    });

  },

  /* These tests are commented out while we figure out Issue #829
  degreeChange(test) {
    test.expect(1);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    //this.servo.to(180);

    this.servo.to(180, 1000, 100);

    this.servo.on("move:complete", () => {
      console.log("Servo move complete");
      test.ok(this.servoWrite.callCount, 1);

      test.done();
    });
  },

  resolutionLimited(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(0);
    this.servo.to(90, 1000, 255);

    this.servo.on("move:complete", () => {

      test.ok(this.servoWrite.callCount === 91);
      test.equal(this.servo.position, 90);

      test.done();
    });
  }
  */
};
