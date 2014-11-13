var MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Servo = five.Servo,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Servo"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.servoWrite = sinon.spy(board.io, "servoWrite");
    this.servoConfig = sinon.spy(board.io, "servoConfig");
    this.pinMode = sinon.spy(board.io, "pinMode");
    this.servo = new Servo({
      pin: 11,
      board: board
    });

    this.proto = [{
      name: "to"
    }, {
      name: "step"
    }, {
      name: "move"
    }, {
      name: "min"
    }, {
      name: "max"
    }, {
      name: "center"
    }, {
      name: "sweep"
    }, {
      name: "stop"
    }, {
      name: "clockWise"
    }, {
      name: "cw"
    }, {
      name: "counterClockwise"
    }, {
      name: "ccw"
    }, {
      name: "write"
    }];

    this.instance = [{
      name: "id"
    }, {
      name: "pin"
    }, {
      name: "mode"
    }, {
      name: "range"
    }, {
      name: "isInverted"
    }, {
      name: "type"
    }, {
      name: "specs"
    }, {
      name: "interval"
    }, {
      name: "value"
    }];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.servoWrite.restore();
    this.servoConfig.restore();
    this.pinMode.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.servo[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.servo[property.name], "undefined");
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);

    test.ok(this.servo instanceof events.EventEmitter);

    test.done();
  },

  startAt: function(test) {
    test.expect(1);

    this.spy = sinon.spy(Servo.prototype, "to");

    this.servo = new Servo({
      pin: 11,
      board: board,
      startAt: 90
    });

    test.ok(this.spy.called);

    this.spy.restore();
    test.done();
  },

  center: function(test) {
    test.expect(1);

    this.spy = sinon.spy(Servo.prototype, "center");

    this.servo = new Servo({
      pin: 11,
      board: board,
      center: true
    });

    test.ok(this.spy.called);

    this.spy.restore();
    test.done();

  },

  isInverted: function(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: board,
      isInverted: true
    });

    this.servo.to(180);

    test.ok(this.servoWrite.calledWith(11, 0));

    this.servo.to(135);

    test.ok(this.servoWrite.calledWith(11, 45));

    this.servo.to(90);

    test.ok(this.servoWrite.calledWith(11, 90));

    test.done();
  },

  rate: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: board
    });

    this.servo.to(0);
    this.servo.to(180, 1000, 100);

    this.clock.tick(1010);

    test.equal(this.servo.position, 180);
    test.ok(this.servoWrite.callCount === 101);

    test.done();
  },

  fps: function(test) {
    test.expect(1);

    this.servo = new Servo({
      pin: 11,
      board: board,
      fps: 50
    });

    this.servo.to(0);
    this.servo.to(180, 1000);

    this.clock.tick(1010);

    test.ok(this.servoWrite.callCount === 51);

    test.done();
  },

  resolutionLimited: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: board
    });

    this.servo.to(0);
    this.servo.to(90, 1000, 255);

    this.clock.tick(1010);

    test.ok(this.servoWrite.callCount === 91);
    test.equal(this.servo.position, 90);

    test.done();
  },

  type: function(test) {
    test.expect(1);

    test.equal(this.servo.type, "standard");

    test.done();
  },

  value: function(test) {
    test.expect(1);

    this.servo.to(100);

    test.equal(this.servo.value, 100);

    test.done();
  }
};


exports["Servo mode and config"] = {
  setUp: function(done) {
    this.servoConfig = sinon.spy(board.io, "servoConfig");
    this.pinMode = sinon.spy(board.io, "pinMode");
    done();
  },

  tearDown: function(done) {
    this.servoConfig.restore();
    this.pinMode.restore();
    done();
  },

  noRange: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: board
    });

    test.equal(this.servoConfig.callCount, 0);
    test.equal(this.pinMode.callCount, 1);
    test.done();
  },

  pwmRange: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: board,
      pwmRange: [1000, 2000]
    });

    test.equal(this.servoConfig.callCount, 1);
    test.equal(this.pinMode.callCount, 0);
    test.done();
  }
};

exports["Servo - Continuous"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.servoWrite = sinon.spy(board.io, "servoWrite");

    this.a = new Servo({
      pin: 11,
      type: "continuous",
      board: board
    });

    this.b = new Servo.Continuous({
      pin: 11,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.servoWrite.restore();
    done();
  },

  type: function(test) {
    test.expect(2);

    test.equal(this.a.type, "continuous");
    test.equal(this.b.type, "continuous");


    test.done();
  },

  cw: function(test) {
    test.expect(2);

    this.a.cw();
    test.ok(this.servoWrite.calledWith(11, 180));

    this.servoWrite.restore();

    this.b.cw();
    test.ok(this.servoWrite.calledWith(11, 180));


    test.done();
  },

  ccw: function(test) {
    test.expect(2);

    this.a.ccw();
    test.ok(this.servoWrite.calledWith(11, 0));

    this.servoWrite.restore();

    this.b.ccw();
    test.ok(this.servoWrite.calledWith(11, 0));


    test.done();
  },

  deadband: function(test) {
    test.expect(2);

    this.continuousServo = new Servo.Continuous({
      pin: 5,
      board: board,
      deadband: [85,95]
    });

    this.continuousServo.cw(0.5);
    test.equal(this.continuousServo.value, 138);

    this.continuousServo.ccw(0.5);
    test.equal(this.continuousServo.value, 42);

    test.done();
  },

  rangePlusDeadband: function(test) {
    test.expect(2);

    this.continuousServo = new Servo.Continuous({
      pin: 5,
      board: board,
      deadband: [85,95],
      range: [20, 160]
    });

    this.continuousServo.cw();
    test.ok(this.servoWrite.calledWith(5, 160));

    this.servoWrite.reset();

    this.continuousServo.cw(0.5);
    test.ok(this.servoWrite.calledWith(5, 128));

    test.done();
  }
};

exports["Servo - Allowed Pin Names"] = {
  firmata: function(test) {
    test.expect(10);

    test.equal(new Servo(2).pin, 2);
    test.equal(new Servo(12).pin, 12);

    test.equal(new Servo({ pin: 2 }).pin, 2);
    test.equal(new Servo({ pin: 12 }).pin, 12);

    test.equal(new Servo("A0").pin, 14);
    test.equal(new Servo(14).pin, 14);

    test.equal(new Servo({ pin: "A0" }).pin, 14);
    test.equal(new Servo({ pin: 14 }).pin, 14);

    // Modes is SERVO
    test.equal(new Servo(12).mode, 4);
    test.equal(new Servo(14).mode, 4);

    test.done();
  },

  nonFirmata: function(test) {
    test.expect(5);

    var nonFirmata = new MockFirmata();
    var board = new Board({
      io: nonFirmata,
      debug: false,
      repl: false
    });

    nonFirmata.name = "FooBoard";

    test.equal(new Servo({ pin: 2, board: board }).pin, 2);
    test.equal(new Servo({ pin: 12, board: board }).pin, 12);
    test.equal(new Servo({ pin: "A0", board: board }).pin, 0);

    // Modes is SERVO
    test.equal(new Servo({ pin: 12, board: board }).mode, 4);
    test.equal(new Servo({ pin: "A0", board: board }).mode, 4);

    test.done();
  }
};

exports["Servo - PCA9685"] = {
  setUp: function(done) {
    this.writeSpy = sinon.spy(board.io, "sendI2CWriteRequest");
    this.readSpy = sinon.spy(board.io, "sendI2CReadRequest");
    this.servo = new Servo({
      pin: 0,
      board: board,
      controller: "PCA9685",
      address: 0x40
    });

    done();
  },

  tearDown: function(done) {
    this.writeSpy.restore();
    this.readSpy.restore();
    done();
  },

  to: function(test) {
    test.expect(6);
    this.writeSpy.reset();

    this.servo.to(20);

    test.equal(this.writeSpy.args[0][0], 0x40);
    test.equal(this.writeSpy.args[0][1][0], 6);
    test.equal(this.writeSpy.args[0][1][1], 0);
    test.equal(this.writeSpy.args[0][1][2], 0);
    test.equal(this.writeSpy.args[0][1][3], 187);
    test.equal(this.writeSpy.args[0][1][4], 0);

    test.done();

  }

};
