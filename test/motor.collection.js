require("./common/bootstrap");

exports["Motor.Collection"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    this.a = new Motor({
      pins: {
        pwm: 3,
        dir: 2,
        brake: 4
      },
      board: this.board
    });

    this.b = new Motor({
      pins: {
        pwm: 6,
        dir: 5,
        brake: 7
      },
      board: this.board
    });

    this.c = new Motor({
      pins: {
        pwm: 11,
        dir: 10,
        brake: 12
      },
      board: this.board
    });

    this.spies = [
      "start", "stop"
    ];

    this.spies.forEach(method => {
      this[method] = this.sandbox.spy(Motor.prototype, method);
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  initFromMotorNumbers(test) {
    test.expect(4);

    const motors = new Motor.Collection([{
      pins: {
        pwm: 3,
        dir: 4
      }
    }, {
      pins: {
        pwm: 5,
        dir: 6
      }
    }, {
      pins: {
        pwm: 9,
        dir: 10
      }
    }]);

    test.equal(motors.length, 3);

    test.equal(motors[0] instanceof Motor, true);
    test.equal(motors[1] instanceof Motor, true);
    test.equal(motors[2] instanceof Motor, true);

    test.done();
  },

  initFromMotors(test) {
    test.expect(4);

    const motors = new Motor.Collection([
      this.a, this.b, this.c
    ]);

    test.equal(motors[0] instanceof Motor, true);
    test.equal(motors[1] instanceof Motor, true);
    test.equal(motors[2] instanceof Motor, true);

  test.equal(motors.length, 3);
    test.done();
  },

  callForwarding(test) {
    test.expect(7);

    const motors = new Motor.Collection([{
      pins: {
        pwm: 3,
        dir: 4
      }
    }, {
      pins: {
        pwm: 5,
        dir: 6
      }
    }, {
      pins: {
        pwm: 9,
        dir: 10
      }
    }]);

    motors.start(90);

    test.equal(this.start.callCount, motors.length);
    test.equal(this.stop.callCount, motors.length);
    test.equal(this.start.getCall(0).args[0], 90);

    test.equal(motors[0] instanceof Motor, true);
    test.equal(motors[1] instanceof Motor, true);
    test.equal(motors[2] instanceof Motor, true);

    motors.stop();

    test.equal(this.stop.callCount, motors.length * 2);

    test.done();
  },

  nested(test) {
    test.expect(9);

    const nested = new Motor.Collection([
      new Motor.Collection([this.a, this.b]),
      this.c
    ]);

    test.equal(nested.length, 3);
    test.equal(nested[0], this.a);
    test.equal(nested[1], this.b);
    test.equal(nested[2], this.c);

    nested.start(90);

    test.equal(this.start.callCount, 3);
    test.equal(this.start.getCall(0).args[0], 90);
    test.equal(this.start.getCall(1).args[0], 90);
    test.equal(this.start.getCall(2).args[0], 90);

    nested.stop();

    test.equal(this.stop.callCount, 3);

    test.done();
  }

};
