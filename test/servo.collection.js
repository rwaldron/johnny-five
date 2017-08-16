require("./common/bootstrap");

exports["Servo.Collection"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    Servo.purge();

    this.a = new Servo({
      pin: 3,
      board: this.board
    });

    this.b = new Servo({
      pin: 6,
      board: this.board
    });

    this.c = new Servo({
      pin: 9,
      board: this.board
    });

    this.spies = [
      "to", "stop"
    ];

    this.spies.forEach(function(method) {
      this[method] = this.sandbox.spy(Servo.prototype, method);
    }.bind(this));

    this.servoWrite = this.sandbox.spy(MockFirmata.prototype, "servoWrite");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    Servo.purge();
    this.sandbox.restore();
    done();
  },

  instanceof: function(test) {
    test.expect(1);
    test.equal(Servos({}) instanceof Servos, true);
    test.done();
  },

  initFromServoNumbers: function(test) {
    test.expect(1);

    var servos = new Servo.Collection([3, 6, 9]);
    test.equal(servos.length, 3);
    test.done();
  },

  initFromServos: function(test) {
    test.expect(1);

    var servos = new Servo.Collection([
      this.a, this.b, this.c
    ]);
    test.equal(servos.length, 3);
    test.done();
  },

  callForwarding: function(test) {
    test.expect(3);

    var servos = new Servo.Collection([3, 6, 9]);

    servos.to(90);
    test.equal(this.to.callCount, servos.length);
    test.equal(this.to.getCall(0).args[0], 90);

    servos.stop();
    test.equal(this.stop.callCount, servos.length);

    test.done();
  },

  home: function(test) {
    test.expect(4);

    this.servos = new Servo.Collection([{
      pin: 9,
      board: this.board,
      startAt: 40
    }, {
      pin: 11,
      board: this.board,
      startAt: 20
    }]);

    this.servos.to(180);
    test.ok(this.servoWrite.calledWith(9, 180));
    test.ok(this.servoWrite.calledWith(11, 180));

    this.servos.home();
    test.ok(this.servoWrite.calledWith(9, 40));
    test.ok(this.servoWrite.calledWith(11, 20));

    test.done();
  },

  collectionFromArray: function(test) {
    test.expect(9);

    var servos = new Servo.Collection([this.a, this.b]);
    var collectionFromArray = new Servo.Collection([servos, this.c]);

    collectionFromArray.to(90);
    test.equal(this.to.callCount, 3);
    test.equal(this.to.getCall(0).args[0], 90);
    test.equal(this.to.getCall(1).args[0], 90);
    test.equal(this.to.getCall(2).args[0], 90);
    test.equal(collectionFromArray.length, 2);
    test.equal(collectionFromArray[0][0], this.a);
    test.equal(collectionFromArray[0][1], this.b);
    test.equal(collectionFromArray[1], this.c);

    collectionFromArray.stop();
    test.equal(this.stop.callCount, 3);

    test.done();
  },

  "Animation.normalize": function(test) {
    test.expect(3);

    var servos = new Servo.Collection([
      this.a, this.b, this.c
    ]);

    var normalized = servos[Animation.normalize]([
      [
        null,
        10,
      ],
      [
        null,
        10,
      ],
      [
        null,
        10,
      ],
    ]);

    test.deepEqual(normalized, [
      [
        { value: servos[0].startAt, easing: "linear" },
        { step: 10, easing: "linear" },
      ],
      [
        { value: servos[1].startAt, easing: "linear" },
        { step: 10, easing: "linear" },
      ],
      [
        { value: servos[2].startAt, easing: "linear" },
        { step: 10, easing: "linear" },
      ],
    ]);

    normalized = servos[Animation.normalize]([
      null,
      [
        null,
        10,
      ],
      [
        null,
        10,
      ],
    ]);

    test.deepEqual(normalized, [
      null,
      [
        { value: servos[0].startAt, easing: "linear" },
        { step: 10, easing: "linear" },
      ],
      [
        { value: servos[1].startAt, easing: "linear" },
        { step: 10, easing: "linear" },
      ],
    ]);

    normalized = servos[Animation.normalize]([
      [
        20,
        40
      ],
      [
        null,
        10,
      ],
      [
        30,
        10,
      ],
    ]);

    test.deepEqual(normalized, [
      [
        { value: servos[0].startAt + 20, easing: "linear" },
        { step: 40, easing: "linear" },
      ],
      [
        { value: servos[1].startAt, easing: "linear" },
        { step: 10, easing: "linear" },
      ],
      [
        { value: servos[2].startAt + 30, easing: "linear" },
        { step: 10, easing: "linear" },
      ],
    ]);

    test.done();
  },

  "Animation.render": function(test) {
    test.expect(4);

    this.to.reset();

    var servos = new Servo.Collection([
      this.a, this.b, this.c
    ]);

    servos[Animation.render]([1, 1, 1]);

    test.equal(this.to.callCount, 3);
    test.deepEqual(this.to.firstCall.args[0], 1);
    test.deepEqual(this.to.secondCall.args[0], 1);
    test.deepEqual(this.to.thirdCall.args[0], 1);
    test.done();
  },
};
