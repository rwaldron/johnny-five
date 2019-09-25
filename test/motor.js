require("./common/bootstrap");

exports["Motor: Non-Directional"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.spy = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    this.motor = new Motor({
      board: this.board,
      pin: 11
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "speed"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  pinList(test) {
    test.expect(3);

    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.settings.device, "NONDIRECTIONAL");
    test.equal(typeof this.motor.pins.dir, "undefined");

    test.done();
  },

  startStop(test) {
    test.expect(3);

    this.motor.start();
    test.deepEqual(this.spy.args[0], [11, 128]);
    this.spy.reset();

    this.motor.stop();
    test.deepEqual(this.spy.args[0], [11, 0]);
    this.spy.reset();

    this.motor.start();
    test.deepEqual(this.spy.args[0], [11, 128]);
    test.done();
  },

  startBrakeRelease(test) {
    test.expect(3);

    this.motor.start();
    test.deepEqual(this.spy.args[0], [11, 128]);
    this.spy.reset();

    this.motor.brake();
    test.deepEqual(this.spy.args[0], [11, 0]);
    this.spy.reset();

    this.motor.release();
    test.deepEqual(this.spy.args[0], [11, 128]);
    test.done();
  },

  enablePin(test) {
    test.expect(5);

    const motor = new Motor({
      board: this.board,
      pins: {
        pwm: 10,
        enable: 7
      }
    });

    // enabled by default
    test.equal(motor.enabled, true);

    motor.disable();
    test.equal(motor.enabled, false);
    test.ok(this.digitalWrite.lastCall.calledWith(7, 0));

    motor.enable();
    test.equal(motor.enabled, true);
    test.ok(this.digitalWrite.lastCall.calledWith(7, 1));

    test.done();
  },

  threshold(test) {
    test.expect(2);

    this.motor.threshold = 30;
    this.spy.reset();
    this.motor.start(20);
    test.deepEqual(this.spy.args[0], [11, 0]);

    this.spy.reset();
    this.motor.start(40);
    test.deepEqual(this.spy.args[0], [11, 40]);

    test.done();
  }

};

exports["Motor: Directional"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.motor = new Motor({
      board: this.board,
      pins: [11, 12]
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },


  pinList(test) {
    test.expect(2);

    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.pins.dir, 12);

    test.done();
  },

  startStop(test) {
    test.expect(3);

    this.analogWrite.reset();
    this.motor.start();
    test.deepEqual(this.analogWrite.args[0], [11, 128]);

    this.analogWrite.reset();
    this.motor.stop();
    test.deepEqual(this.analogWrite.args[0], [11, 0]);

    this.analogWrite.reset();
    this.motor.start();
    test.deepEqual(this.analogWrite.args[0], [11, 128]);

    test.done();
  },

  forward(test) {
    test.expect(2);

    this.motor.forward(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));

    test.done();
  },

  reverse(test) {
    test.expect(2);

    this.motor.reverse(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));

    test.done();
  },

  brake(test) {
    test.expect(6);

    this.motor.rev(128);
    test.ok(this.analogWrite.firstCall.calledWith(11, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.forward(180);
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 180));

    test.done();
  },

  threshold(test) {
    test.expect(3);

    this.motor.threshold = 30;
    this.motor.start(20);
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    test.done();
  },

  enablePin(test) {
    test.expect(5);

    const motor = new Motor({
      board: this.board,
      pins: {
        pwm: 11,
        dir: 12,
        enable: 7
      }
    });

    // enabled by default
    test.equal(motor.enabled, true);

    motor.disable();
    test.equal(motor.enabled, false);
    test.ok(this.digitalWrite.lastCall.calledWith(7, 0));

    motor.enable();
    test.equal(motor.enabled, true);
    test.ok(this.digitalWrite.lastCall.calledWith(7, 1));

    test.done();
  }
};

exports["Motor: Directional with no speed passed"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.motor = new Motor({
      board: this.board,
      pins: [11, 12]
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  start(test) {
    test.expect(6);

    this.motor.forward();
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.stop();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.forward(200);
    test.ok(this.analogWrite.lastCall.calledWith(11, 200));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.stop();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.start();
    test.ok(this.analogWrite.lastCall.calledWith(11, 200));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.stop();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));

    test.done();
  },

  threshold(test) {
    test.expect(3);

    this.motor.threshold = 30;
    this.motor.start(20);
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));

    test.done();
  }
};

exports["Motor: Directional with Brake"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.motor = new Motor({
      board: this.board,
      pins: {
        pwm: 3,
        dir: 12,
        brake: 9
      }
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "brake"
    }, {
      name: "release"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  pinList(test) {
    test.expect(3);

    test.equal(this.motor.pins.pwm, 3);
    test.equal(this.motor.pins.dir, 12);
    test.equal(this.motor.pins.brake, 9);

    test.done();
  },

  startStop(test) {
    test.expect(2);

    this.motor.start();
    test.ok(this.analogWrite.lastCall.calledWith(3, 128));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.stop();
    test.ok(this.analogWrite.lastCall.calledWith(3, 0));

    test.done();
  },

  forward(test) {
    test.expect(2);

    this.motor.forward(128);
    test.ok(this.analogWrite.lastCall.calledWith(3, 128));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));

    test.done();
  },

  reverse(test) {
    test.expect(2);

    this.motor.reverse(128);
    test.ok(this.analogWrite.lastCall.calledWith(3, 128));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));

    test.done();
  },

  brake(test) {
    test.expect(14);

    this.motor.rev(128);
    test.ok(this.analogWrite.lastCall.calledWith(3, 128));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(3, 255));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    test.ok(this.digitalWrite.firstCall.calledWith(9, 1));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(3, 128));
    test.ok(this.digitalWrite.firstCall.calledWith(12, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(9, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.forward(180);
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(3, 255));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    test.ok(this.digitalWrite.firstCall.calledWith(9, 1));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(3, 180));
    test.ok(this.digitalWrite.firstCall.calledWith(12, 1));
    test.ok(this.digitalWrite.lastCall.calledWith(9, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    test.done();
  },

  timedBrake(test) {
    const clock = sinon.useFakeTimers();
    test.expect(5);

    this.motor.rev(128);
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake(1000);

    test.ok(this.analogWrite.lastCall.calledWith(3, 255));
    test.ok(this.digitalWrite.firstCall.calledWith(9, 1));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    clock.tick(1000);

    test.ok(this.analogWrite.firstCall.calledWith(3, 0));
    test.ok(this.analogWrite.lastCall.calledWith(3, 128));
    test.ok(this.digitalWrite.lastCall.calledWith(9, 0));

    clock.restore();
    test.done();
  },

  threshold(test) {
    test.expect(7);

    this.motor.threshold = 30;
    this.motor.start(20);
    test.ok(this.analogWrite.calledWith(3, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(3, 255));
    test.ok(this.digitalWrite.firstCall.calledWith(9, 1));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(3, 0));
    test.ok(this.digitalWrite.firstCall.calledWith(12, 1));
    test.ok(this.digitalWrite.lastCall.calledWith(9, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    test.done();
  }

};

exports["Motor: Directional with Current Sensing Pin"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.motor = new Motor({
      board: this.board,
      pins: {
        pwm: 3,
        dir: 12
      },
      current: {
        pin: "A0",
        freq: 250
      }
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "brake"
    }, {
      name: "release"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }, {
      name: "current"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  current(test) {
    test.expect(1);

    test.ok(this.motor.current instanceof Sensor);

    test.done();
  },

  pinList(test) {
    test.expect(3);

    test.equal(this.motor.pins.pwm, 3);
    test.equal(this.motor.pins.dir, 12);
    test.equal(this.motor.current.pin, "0");

    test.done();
  }

};

exports["Motor: Directional - Three Pin"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.motor = new Motor({
      board: this.board,
      pins: [11, 12, 13]
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  pinList(test) {
    test.expect(3);

    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.pins.dir, 12);
    test.equal(this.motor.pins.cdir, 13);

    test.done();
  },

  start(test) {
    test.expect(3);

    this.motor.start();
    test.ok(this.digitalWrite.firstCall.calledWith(13, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));

    test.done();
  },

  stop(test) {
    test.expect(1);

    this.motor.stop();
    test.ok(this.analogWrite.calledWith(11, 0));

    test.done();
  },

  forward(test) {
    test.expect(3);

    this.analogWrite.reset();
    this.digitalWrite.reset();
    this.motor.forward(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    test.ok(this.digitalWrite.firstCall.calledWith(13, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));

    test.done();
  },

  reverse(test) {
    test.expect(3);

    this.analogWrite.reset();
    this.digitalWrite.reset();
    this.motor.reverse(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    test.ok(this.digitalWrite.firstCall.calledWith(13, 1));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));

    test.done();
  },

  brakeRelease(test) {
    test.expect(6);

    this.motor.rev(128);
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    test.ok(this.digitalWrite.firstCall.calledWith(12, 1));
    test.ok(this.digitalWrite.lastCall.calledWith(13, 1));

    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    test.ok(this.digitalWrite.firstCall.calledWith(13, 1));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));

    test.done();
  },

  enablePin(test) {
    test.expect(5);

    const motor = new Motor({
      board: this.board,
      pins: {
        pwm: 11,
        dir: 12,
        cdir: 8,
        enable: 7
      }
    });

    // enabled by default
    test.equal(motor.enabled, true);

    motor.disable();
    test.equal(motor.enabled, false);
    test.ok(this.digitalWrite.lastCall.calledWith(7, 0));

    motor.enable();
    test.equal(motor.enabled, true);
    test.ok(this.digitalWrite.lastCall.calledWith(7, 1));

    test.done();
  }

};

exports["Motor: Inverse Speed When Forward"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.motor = new Motor({
      board: this.board,
      pins: [11, 12],
      invertPWM: true
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }, {
      name: "invertPWM"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  pinList(test) {
    test.expect(3);

    test.equal(this.motor.settings.invertPWM, true);

    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.pins.dir, 12);

    test.done();
  },

  forward(test) {
    test.expect(6);

    this.motor.forward(255);
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.forward(180);
    test.ok(this.analogWrite.lastCall.calledWith(11, 75));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.stop();
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.start();
    test.ok(this.analogWrite.lastCall.calledWith(11, 75));

    test.done();
  },

  reverse(test) {
    test.expect(6);

    this.motor.reverse(255);
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.reverse(180);
    test.ok(this.analogWrite.lastCall.calledWith(11, 180));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.stop();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.start();
    test.ok(this.analogWrite.lastCall.calledWith(11, 180));

    test.done();
  },

  brake(test) {
    test.expect(8);

    this.motor.forward(255);
    // pwm values are inversed when the enable pin is high
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.reverse(255);
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));

    test.done();
  },

  threshold(test) {
    test.expect(4);

    this.motor.threshold = 30;
    this.motor.start(20);
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));

    test.done();
  }

};

exports["Motor: Inverse Speed With Brake"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.motor = new Motor({
      board: this.board,
      pins: {
        pwm: 11,
        dir: 12,
        brake: 9
      },
      invertPWM: true
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }, {
      name: "invertPWM"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  brake(test) {
    test.expect(17);

    this.motor.forward(255);
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    test.ok(this.digitalWrite.firstCall.calledWith(9, 1));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(9, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.reverse(255);
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    test.ok(this.digitalWrite.firstCall.calledWith(12, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(9, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    test.ok(this.digitalWrite.firstCall.calledWith(9, 1));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.firstCall.calledWith(11, 0));
    test.ok(this.analogWrite.lastCall.calledWith(11, 255));
    test.ok(this.digitalWrite.firstCall.calledWith(12, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(9, 0));

    test.done();
  }

};

exports["Motor: 10-Bit"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    // Override PWM Resolution
    this.board.RESOLUTION.PWM = 1023;

    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.motor = new Motor({
      board: this.board,
      pins: [11, 12]
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  startStop(test) {
    test.expect(3);

    this.analogWrite.reset();
    this.motor.start();
    test.deepEqual(this.analogWrite.args[0], [11, 513]);

    this.analogWrite.reset();
    this.motor.stop();
    test.deepEqual(this.analogWrite.args[0], [11, 0]);

    this.analogWrite.reset();
    this.motor.start();
    test.deepEqual(this.analogWrite.args[0], [11, 513]);

    test.done();
  },

  forward(test) {
    test.expect(2);

    this.motor.forward(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 513));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));

    test.done();
  },

  reverse(test) {
    test.expect(2);

    this.motor.reverse(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 513));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));

    test.done();
  },

  brake(test) {
    test.expect(6);

    this.motor.rev(128);
    test.ok(this.analogWrite.firstCall.calledWith(11, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 513));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.forward(180);
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 722));

    test.done();
  },
};

exports["Motor: 10-Bit With Inverse"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    // Override PWM Resolution
    this.board.RESOLUTION.PWM = 1024;

    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.motor = new Motor({
      board: this.board,
      pins: [11, 12],
      invertPWM: true
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  startStop(test) {
    test.expect(3);

    this.analogWrite.reset();
    this.motor.start();
    test.deepEqual(this.analogWrite.args[0], [11, 509]);

    this.analogWrite.reset();
    this.motor.stop();
    test.deepEqual(this.analogWrite.args[0], [11, 1024]);

    this.analogWrite.reset();
    this.motor.start();
    test.deepEqual(this.analogWrite.args[0], [11, 509]);

    test.done();
  },

  forward(test) {
    test.expect(2);

    this.motor.forward(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 509));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));

    test.done();
  },

  reverse(test) {
    test.expect(2);

    this.motor.reverse(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 514));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));

    test.done();
  },

  brake(test) {
    test.expect(7);

    this.motor.rev(128);
    test.ok(this.analogWrite.firstCall.calledWith(11, 1024));
    test.ok(this.analogWrite.lastCall.calledWith(11, 514));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 0));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 514));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.forward(180);
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.brake();
    test.ok(this.analogWrite.lastCall.calledWith(11, 1024));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.release();
    test.ok(this.analogWrite.lastCall.calledWith(11, 301));

    test.done();
  },
};

exports["Motor: I2C - PCA9685"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.normalize = this.sandbox.spy(Board.Pins, "normalize");
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.motor = new Motor({
      board: this.board,
      pins: [8, 9, 10],
      controller: "PCA9685",
      address: 0x60
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    Expander.purge();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Motor({
      controller: "PCA9685",
      address: 0xff,
      bus: "i2c-1",
      board: this.board,
      pins: [8, 9, 10]
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  defaultFrequency(test) {
    test.expect(1);
    test.equal(this.motor.frequency, 50);
    test.done();
  },

  customFrequency(test) {
    test.expect(1);

    this.motor = new Motor({
      frequency: 60,
      board: this.board,
      pins: [8, 9, 10],
      controller: "PCA9685",
      address: 0x60
    });

    test.equal(this.motor.frequency, 60);
    test.done();
  },

  noNormalization(test) {
    test.expect(1);
    test.equal(this.normalize.callCount, 0);
    test.done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  pinList(test) {
    test.expect(3);

    test.equal(this.motor.pins.pwm, 8);
    test.equal(this.motor.pins.dir, 9);
    test.equal(this.motor.pins.cdir, 10);

    test.done();
  },

  start(test) {
    test.expect(6);
    this.i2cWrite.reset();

    this.motor.start();
    test.equal(this.i2cWrite.args[0][0], 0x60);
    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 2048);
    test.equal(this.i2cWrite.args[0][1][4], 8);

    test.done();
  },

  stop(test) {
    test.expect(6);
    this.i2cWrite.reset();
    this.motor.stop();


    test.equal(this.i2cWrite.args[0][0], 0x60);
    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 4096);
    test.equal(this.i2cWrite.args[0][1][4], 16);

    test.done();
  },

  forward(test) {
    test.expect(21);
    this.i2cWrite.reset();

    this.motor.forward(128);

    test.equal(this.i2cWrite.args[0][0], 0x60);

    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 4096);
    test.equal(this.i2cWrite.args[0][1][4], 16);

    test.equal(this.i2cWrite.args[1][1][0], 46);
    test.equal(this.i2cWrite.args[1][1][1], 0);
    test.equal(this.i2cWrite.args[1][1][2], 0);
    test.equal(this.i2cWrite.args[1][1][3], 4096);
    test.equal(this.i2cWrite.args[1][1][4], 16);

    test.equal(this.i2cWrite.args[2][1][0], 42);
    test.equal(this.i2cWrite.args[2][1][1], 4096);
    test.equal(this.i2cWrite.args[2][1][2], 16);
    test.equal(this.i2cWrite.args[2][1][3], 0);
    test.equal(this.i2cWrite.args[2][1][4], 0);

    test.equal(this.i2cWrite.args[3][1][0], 38);
    test.equal(this.i2cWrite.args[3][1][1], 0);
    test.equal(this.i2cWrite.args[3][1][2], 0);
    test.equal(this.i2cWrite.args[3][1][3], 2048);
    test.equal(this.i2cWrite.args[3][1][4], 8);
    test.done();
  },

  reverse(test) {
    test.expect(21);
    this.i2cWrite.reset();

    this.motor.reverse(128);

    test.equal(this.i2cWrite.args[0][0], 0x60);

    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 4096);
    test.equal(this.i2cWrite.args[0][1][4], 16);

    test.equal(this.i2cWrite.args[1][1][0], 46);
    test.equal(this.i2cWrite.args[1][1][1], 4096);
    test.equal(this.i2cWrite.args[1][1][2], 16);
    test.equal(this.i2cWrite.args[1][1][3], 0);
    test.equal(this.i2cWrite.args[1][1][4], 0);

    test.equal(this.i2cWrite.args[2][1][0], 42);
    test.equal(this.i2cWrite.args[2][1][1], 0);
    test.equal(this.i2cWrite.args[2][1][2], 0);
    test.equal(this.i2cWrite.args[2][1][3], 4096);
    test.equal(this.i2cWrite.args[2][1][4], 16);

    test.equal(this.i2cWrite.args[3][1][0], 38);
    test.equal(this.i2cWrite.args[3][1][1], 0);
    test.equal(this.i2cWrite.args[3][1][2], 0);
    test.equal(this.i2cWrite.args[3][1][3], 2048);
    test.equal(this.i2cWrite.args[3][1][4], 8);

    test.done();
  },

  brakeRelease(test) {
    test.expect(42);
    this.i2cWrite.reset();

    this.motor.rev(128);
    this.i2cWrite.reset();

    this.motor.brake();

    test.equal(this.i2cWrite.args[0][0], 0x60);

    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 4096);
    test.equal(this.i2cWrite.args[0][1][4], 16);

    test.equal(this.i2cWrite.args[1][1][0], 42);
    test.equal(this.i2cWrite.args[1][1][1], 4096);
    test.equal(this.i2cWrite.args[1][1][2], 16);
    test.equal(this.i2cWrite.args[1][1][3], 0);
    test.equal(this.i2cWrite.args[1][1][4], 0);

    test.equal(this.i2cWrite.args[2][1][0], 46);
    test.equal(this.i2cWrite.args[2][1][1], 4096);
    test.equal(this.i2cWrite.args[2][1][2], 16);
    test.equal(this.i2cWrite.args[2][1][3], 0);
    test.equal(this.i2cWrite.args[2][1][4], 0);

    test.equal(this.i2cWrite.args[3][1][0], 38);
    test.equal(this.i2cWrite.args[3][1][1], 4096);
    test.equal(this.i2cWrite.args[3][1][2], 16);
    test.equal(this.i2cWrite.args[3][1][3], 0);
    test.equal(this.i2cWrite.args[3][1][4], 0);

    this.i2cWrite.reset();

    this.motor.release();

    test.equal(this.i2cWrite.args[0][0], 0x60);

    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 4096);
    test.equal(this.i2cWrite.args[0][1][4], 16);

    test.equal(this.i2cWrite.args[1][1][0], 46);
    test.equal(this.i2cWrite.args[1][1][1], 4096);
    test.equal(this.i2cWrite.args[1][1][2], 16);
    test.equal(this.i2cWrite.args[1][1][3], 0);
    test.equal(this.i2cWrite.args[1][1][4], 0);

    test.equal(this.i2cWrite.args[2][1][0], 42);
    test.equal(this.i2cWrite.args[2][1][1], 0);
    test.equal(this.i2cWrite.args[2][1][2], 0);
    test.equal(this.i2cWrite.args[2][1][3], 4096);
    test.equal(this.i2cWrite.args[2][1][4], 16);

    test.equal(this.i2cWrite.args[3][1][0], 38);
    test.equal(this.i2cWrite.args[3][1][1], 0);
    test.equal(this.i2cWrite.args[3][1][2], 0);
    test.equal(this.i2cWrite.args[3][1][3], 2048);
    test.equal(this.i2cWrite.args[3][1][4], 8);

    this.i2cWrite.reset();

    test.done();
  },

};

exports["Motor: ShiftRegister"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.analogWrite = this.sandbox.spy(MockFirmata.prototype, "analogWrite");
    this.shiftOut = this.sandbox.spy(Board.prototype, "shiftOut");
    this.motor = new Motor({
      board: this.board,
      pins: {
        pwm: 11
      },
      register: {
        data: 8,
        clock: 4,
        latch: 12
      },
      bits: {
        a: 2,
        b: 3
      }
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  pinList(test) {
    test.expect(1);

    test.equal(this.motor.pins.pwm, 11);

    test.done();
  },

  start(test) {
    test.expect(1);

    this.motor.start();

    test.ok(this.analogWrite.lastCall.calledWith(11, 128));

    test.done();
  },

  stop(test) {
    test.expect(1);

    this.motor.stop();

    test.ok(this.analogWrite.lastCall.calledWith(11, 0));

    test.done();
  },

  forward(test) {
    test.expect(4);

    this.motor.forward(128);

    test.ok(this.analogWrite.lastCall.calledWith(11, 128));

    test.ok(this.digitalWrite.firstCall.calledWith(12, 0)); // Latch 0
    test.ok(this.shiftOut.lastCall.calledWith(8, 4, true, 0x04));
    test.ok(this.digitalWrite.getCall(25).calledWith(12, 1)); // Latch 1

    test.done();
  },

  reverse(test) {
    test.expect(4);

    this.motor.reverse(128);

    test.ok(this.analogWrite.lastCall.calledWith(11, 128));

    test.ok(this.digitalWrite.firstCall.calledWith(12, 0)); // Latch 0
    test.ok(this.shiftOut.lastCall.calledWith(8, 4, true, 0x08));
    test.ok(this.digitalWrite.getCall(25).calledWith(12, 1)); // Latch 1

    test.done();
  },
};

exports["Motor: EVS_EV3"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    this.ev3write = this.sandbox.spy(EVS.prototype, "write");
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.motor = new Motor({
      controller: "EVS_EV3",
      pin: "BBM2",
      board: this.board
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  pinList(test) {
    test.expect(1);

    test.equal(this.motor.pins.pwm, "BBM2");

    test.done();
  },

  start(test) {
    test.expect(1);

    this.motor.start();

    const expect = [{
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78, [50, 0, 0, 129]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },

  stop(test) {
    test.expect(1);

    this.motor.stop();

    const expect = [{
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      65,
      82
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },

  forward(test) {
    test.expect(1);

    this.motor.forward(128);

    const expect = [{
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78, [50, 0, 0, 129]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },

  reverse(test) {
    test.expect(1);

    this.motor.reverse(128);

    const expect = [{
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78, [-50, 0, 0, 129]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },
};


exports["Motor: EVS_NXT"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    this.ev3write = this.sandbox.spy(EVS.prototype, "write");
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.motor = new Motor({
      controller: "EVS_NXT",
      pin: "BBM2",
      board: this.board
    });

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.motor[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.motor[name], "undefined"));

    test.done();
  },

  pinList(test) {
    test.expect(1);

    test.equal(this.motor.pins.pwm, "BBM2");

    test.done();
  },

  start(test) {
    test.expect(1);

    this.motor.start();

    const expect = [{
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78, [50, 0, 0, 129]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },

  stop(test) {
    test.expect(1);

    this.motor.stop();

    const expect = [{
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      65,
      82
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },

  forward(test) {
    test.expect(1);

    this.motor.forward(128);

    const expect = [{
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78, [50, 0, 0, 129]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },

  reverse(test) {
    test.expect(1);

    this.motor.reverse(128);

    const expect = [{
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78, [-50, 0, 0, 129]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },
};


exports["Motor: GROVE_I2C_MOTOR_DRIVER"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");

    this.a = new Motor({
      controller: "GROVE_I2C_MOTOR_DRIVER",
      pin: "A",
      board: this.board
    });

    // this.dir = this.sandbox.spy(this.a, "dir");
    // this.speed = this.sandbox.spy(this.a, "speed");

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Motor({
      controller: "GROVE_I2C_MOTOR_DRIVER",
      address: 0xff,
      bus: "i2c-1",
      pin: "A",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.a[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.a[name], "undefined"));

    test.done();
  },

  pinList(test) {
    test.expect(2);
    test.equal(this.a.pins.pwm, "A");
    test.equal(this.a.pins.dir, "A");
    test.done();
  },

  start(test) {
    test.expect(1);

    this.a.start();

    test.deepEqual(
      this.i2cWrite.lastCall.args[1],
      [this.a.COMMANDS.SET_SPEED, 128, 0]
    );
    test.done();
  },

  stop(test) {
    test.expect(1);

    this.a.stop();

    test.deepEqual(
      this.i2cWrite.lastCall.args[1],
      [this.a.COMMANDS.SET_SPEED, 0, 0]
    );
    test.done();
  },

  forward(test) {
    test.expect(2);

    this.i2cWrite.reset();
    this.a.forward(128);

    test.deepEqual(
      this.i2cWrite.getCall(1).args[1],
      [this.a.COMMANDS.SET_DIRECTION, 5, 1]
    );

    test.deepEqual(
      this.i2cWrite.getCall(2).args[1],
      [this.a.COMMANDS.SET_SPEED, 128, 0]
    );
    test.done();
  },

  reverse(test) {
    test.expect(2);

    this.i2cWrite.reset();
    this.a.reverse(128);

    test.deepEqual(
      this.i2cWrite.getCall(1).args[1],
      [this.a.COMMANDS.SET_DIRECTION, 6, 1]
    );

    test.deepEqual(
      this.i2cWrite.getCall(2).args[1],
      [this.a.COMMANDS.SET_SPEED, 128, 0]
    );

    test.done();
  },

  forwardControlBoth(test) {
    test.expect(6);

    this.b = new Motor({
      controller: "GROVE_I2C_MOTOR_DRIVER",
      pin: "B",
      board: this.board
    });


    this.i2cWrite.reset();

    this.a.forward(128);
    this.b.forward(128);

    // A stop
    test.deepEqual(
      this.i2cWrite.getCall(0).args[1],
      [this.a.COMMANDS.SET_SPEED, 0, 0]
    );

    // A fwd
    test.deepEqual(
      this.i2cWrite.getCall(1).args[1],
      [this.a.COMMANDS.SET_DIRECTION, 5, 1]
    );

    // A speed
    test.deepEqual(
      this.i2cWrite.getCall(2).args[1],
      [this.a.COMMANDS.SET_SPEED, 128, 0]
    );

    // B stop
    test.deepEqual(
      this.i2cWrite.getCall(3).args[1],
      [this.a.COMMANDS.SET_SPEED, 128, 0]
    );

    // B fwd
    test.deepEqual(
      this.i2cWrite.getCall(4).args[1],
      [this.a.COMMANDS.SET_DIRECTION, 5, 1]
    );

    // B speed
    test.deepEqual(
      this.i2cWrite.getCall(5).args[1],
      [this.a.COMMANDS.SET_SPEED, 128, 128]
    );
    test.done();
  },

  reverseControlBoth(test) {
    test.expect(6);

    this.b = new Motor({
      controller: "GROVE_I2C_MOTOR_DRIVER",
      pin: "B",
      board: this.board
    });


    this.i2cWrite.reset();

    this.a.reverse(128);
    this.b.reverse(128);

    // A stop
    test.deepEqual(
      this.i2cWrite.getCall(0).args[1],
      [this.a.COMMANDS.SET_SPEED, 0, 0]
    );

    // A rev
    test.deepEqual(
      this.i2cWrite.getCall(1).args[1],
      [this.a.COMMANDS.SET_DIRECTION, 6, 1]
    );

    // A speed
    test.deepEqual(
      this.i2cWrite.getCall(2).args[1],
      [this.a.COMMANDS.SET_SPEED, 128, 0]
    );

    // B stop
    test.deepEqual(
      this.i2cWrite.getCall(3).args[1],
      [this.a.COMMANDS.SET_SPEED, 128, 0]
    );

    // B rev
    test.deepEqual(
      this.i2cWrite.getCall(4).args[1],
      [this.a.COMMANDS.SET_DIRECTION, 10, 1]
    );

    // B speed
    test.deepEqual(
      this.i2cWrite.getCall(5).args[1],
      [this.a.COMMANDS.SET_SPEED, 128, 128]
    );
    test.done();
  }
};

exports["Motor: Require Pins"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    this.proto = [{
      name: "dir"
    }, {
      name: "start"
    }, {
      name: "stop"
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
    }, {
      name: "resume"
    }, {
      name: "setPin"
    }, {
      name: "setPWM"
    }];

    this.instance = [{
      name: "pins"
    }, {
      name: "threshold"
    }, {
      name: "speed"
    }];

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    Expander.purge();
    done();
  },

  nondirectionalMissingPins(test) {
    test.expect(3);

    test.throws(() => {
      new Motor();
    }, "PWM pin must be defined");

    test.throws(() => {
      new Motor({
        device: "NONDIRECTIONAL"
      });
    }, "PWM pin must be defined");

    test.throws(() => {
      new Motor({
        device: "NONDIRECTIONAL",
        pins: {
          dir: 1
        }
      });
    }, "PWM pin must be defined");

    test.done();
  },

  directionalMissingPins(test) {
    test.expect(4);

    test.throws(() => {
      new Motor({
        device: "DIRECTIONAL"
      });
    }, "PWM pin must be defined");

    test.throws(() => {
      new Motor({
        device: "DIRECTIONAL",
        pins: [1]
      });
    }, "DIR pin must be defined");

    test.throws(() => {
      new Motor({
        device: "DIRECTIONAL",
        pins: {
          pwm: 1
        }
      });
    }, "DIR pin must be defined");

    test.throws(() => {
      new Motor({
        device: "DIRECTIONAL",
        pins: {
          pwm: 1,
          cdir: 2
        }
      });
    }, "DIR pin must be defined");

    test.done();
  },

  cdirMissingPins(test) {
    test.expect(4);

    test.throws(() => {
      new Motor({
        device: "CDIR"
      });
    }, "PWM pin must be defined");

    test.throws(() => {
      new Motor({
        device: "CDIR",
        pins: [1, 2]
      });
    }, "CDIR pin must be defined");

    test.throws(() => {
      new Motor({
        device: "CDIR",
        pins: {
          pwm: 1
        }
      });
    }, "CDIR pin must be defined");

    test.throws(() => {
      new Motor({
        device: "CDIR",
        pins: {
          pwm: 1,
          dir: 2
        }
      });
    }, "CDIR pin must be defined");

    test.done();
  }
};

Object.keys(Motor.Controllers).forEach(name => {

  // These are duplicates
  if (name.startsWith("GROVE_") || name.startsWith("EVS_") || name.startsWith("Shift")) {
    return;
  }

  exports[`Motor - Controller, ${name}`] = addControllerTest(Motor, Motor.Controllers[name], {
    controller: name,
    pins: [8, 9]
  });
});
