var MockFirmata = require("./util/mock-firmata"),
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
      name: "invert"
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
    test.expect(5);

    this.spy = sinon.spy(Servo.prototype, "center");

    this.servo = new Servo({
      pin: 11,
      board: board,
      center: true
    });

    // constructor called .center()
    test.ok(this.spy.called);
    // and servo is actually centered
    test.equal(this.servo.position, 90);

    this.spy.restore();

    this.servo.to(180);
    this.servo.center(1000, 100);

    // not there yet
    this.clock.tick(900);
    test.ok(this.servo.position > 90);

    // now there
    this.clock.tick(110);
    test.equal(this.servo.position, 90);

    // it fired a move:complete event when finished
    this.servo.on("move:complete", function() {
      test.ok(1, "event fired");
      test.done();
    }.bind(this));

  },

  inverted: function(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: board,
      invert: true
    });

    this.servo.to(180);

    test.ok(this.servoWrite.calledWith(11, 0));

    this.servo.to(135);

    test.ok(this.servoWrite.calledWith(11, 45));

    this.servo.to(90);

    test.ok(this.servoWrite.calledWith(11, 90));

    test.done();
  },

  range: function(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: board,
      range: [20, 160]
    });

    this.servo.to(180);

    test.ok(this.servoWrite.calledWith(11, 160));

    this.servo.to(135);

    test.ok(this.servoWrite.calledWith(11, 135));

    this.servo.to(10);

    test.ok(this.servoWrite.calledWith(11, 20));

    test.done();
  },

  rangeWithInvert: function(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: board,
      invert: true,
      range: [30, 160]
    });

    this.servo.to(180);

    test.ok(this.servoWrite.calledWith(11, 20));

    this.servo.to(135);

    test.ok(this.servoWrite.calledWith(11, 45));

    this.servo.to(10);

    test.ok(this.servoWrite.calledWith(11, 150));

    test.done();
  },

  offset: function(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: board,
      offset: -10
    });

    this.servo.to(180);

    test.ok(this.servoWrite.calledWith(11, 170));

    this.servo.to(135);

    test.ok(this.servoWrite.calledWith(11, 125));

    this.servo.to(10);

    test.ok(this.servoWrite.calledWith(11, 0));

    test.done();
  },

  offsetWithInvert: function(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: board,
      offset: -10,
      invert: true
    });

    this.servo.to(180);

    test.ok(this.servoWrite.calledWith(11, 10));

    this.servo.to(135);

    test.ok(this.servoWrite.calledWith(11, 55));

    this.servo.to(10);

    test.ok(this.servoWrite.calledWith(11, 180));

    test.done();
  },

  offsetWithRange: function(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: board,
      offset: -10,
      range: [20, 150]
    });

    this.servo.to(180);

    test.ok(this.servoWrite.calledWith(11, 140));

    this.servo.to(135);

    test.ok(this.servoWrite.calledWith(11, 125));

    this.servo.to(10);

    test.ok(this.servoWrite.calledWith(11, 10));

    test.done();
  },

  offsetWithRangeAndInvert: function(test) {
    test.expect(3);

    this.servo = new Servo({
      pin: 11,
      board: board,
      offset: -10,
      range: [20, 150],
      invert: true
    });

    this.servo.to(180);

    test.ok(this.servoWrite.calledWith(11, 40));

    this.servo.to(135);

    test.ok(this.servoWrite.calledWith(11, 55));

    this.servo.to(10);

    test.ok(this.servoWrite.calledWith(11, 170));

    test.done();
  },

  /*
  offset - range - invert
  1 - 1 - 1
  */

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

  min: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: board
    });

    this.servo.to(180);
    this.servo.min(1000, 100);

    this.clock.tick(1010);

    test.equal(this.servo.position, 0);

    this.servo.on("move:complete", function() {
      test.ok(this.servoWrite.callCount === 101);
      test.done();
    }.bind(this));
  },

  max: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: board
    });

    this.servo.to(0);
    this.servo.max(1000, 100);

    this.clock.tick(1010);

    test.equal(this.servo.position, 180);

    this.servo.on("move:complete", function() {
      test.ok(this.servoWrite.callCount === 101);
      test.done();
    }.bind(this));
  },

  completeMoveEmitted: function(test) {
    test.expect(1);

    this.servo = new Servo({
      pin: 11,
      board: board
    });

    this.servo.to(180);
    this.servo.to(180, 1000, 100);
    this.servo.on("move:complete", function() {
      test.ok(this.servoWrite.callCount, 1);
      test.done();
    }.bind(this));
  },


  degreeChange: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: board
    });
    // We are spying on setInterval instead of servoWrite because the following set of
    // parameters will result with setInterval will be called with an interval of infinity
    var spy = sinon.spy(global, "setInterval");

    this.servo.to(180);

    this.servo.to(180, 1000, 100);

    this.clock.tick(1010);

    test.equal(spy.callCount, 0);
    test.ok(this.servoWrite.callCount, 1);

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
      deadband: [85, 95]
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
      deadband: [85, 95],
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
  setUp: function(done) {
    Board.purge();
    done();
  },
  tearDown: function(done) {
    Board.purge();
    done();
  },
  firmata: function(test) {
    test.expect(10);

    var firmata = new MockFirmata();
    var board = new Board({
      io: firmata,
      debug: false,
      repl: false
    });

    board.on("ready", function() {

      Object.defineProperty(board.io, "analogPins", {
        value: [14, 15, 16, 17, 18, 19]
      });

      test.equal(new Servo(2).pin, 2);
      test.equal(new Servo(12).pin, 12);

      test.equal(new Servo({
        pin: 2
      }).pin, 2);
      test.equal(new Servo({
        pin: 12
      }).pin, 12);

      test.equal(new Servo("A0").pin, 14);
      test.equal(new Servo(14).pin, 14);

      test.equal(new Servo({
        pin: "A0"
      }).pin, 14);
      test.equal(new Servo({
        pin: 14
      }).pin, 14);

      // Modes is SERVO
      test.equal(new Servo(12).mode, 4);
      test.equal(new Servo(14).mode, 4);

      test.done();
    });

    board.emit("ready");
  },

  nonFirmataNonNormalized: function(test) {
    test.expect(5);

    var nonFirmata = new MockFirmata();
    var board = new Board({
      io: nonFirmata,
      debug: false,
      repl: false
    });

    nonFirmata.name = "FooBoard";

    board.on("ready", function() {

      test.equal(new Servo({
        pin: 2,
        board: board
      }).pin, 2);
      test.equal(new Servo({
        pin: 12,
        board: board
      }).pin, 12);
      test.equal(new Servo({
        pin: "A0",
        board: board
      }).pin, "A0");

      // Modes is SERVO
      test.equal(new Servo({
        pin: 12,
        board: board
      }).mode, 4);
      test.equal(new Servo({
        pin: "A0",
        board: board
      }).mode, 4);

      test.done();
    });

    board.emit("ready");
  }
};

exports["Servo - PCA9685"] = {
  setUp: function(done) {
    this.writeSpy = sinon.spy(board.io, "i2cWrite");
    this.readSpy = sinon.spy(board.io, "i2cRead");
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

  withAddress: function(test) {
    test.expect(1);

    var servo = new Servo({
      pin: 0,
      board: board,
      controller: "PCA9685",
      address: 0x40
    });

    test.notEqual(servo.board.Drivers[0x40], undefined);
    test.done();
  },

  withoutAddress: function(test) {
    test.expect(1);

    var servo = new Servo({
      pin: 0,
      board: board,
      controller: "PCA9685"
    });

    test.notEqual(servo.board.Drivers[0x40], undefined);
    test.done();
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

exports["Servo.Array"] = {
  setUp: function(done) {
    var board = new Board({
      io: new MockFirmata(),
      debug: false,
      repl: false
    });

    Servo.purge();

    this.a = new Servo({
      pin: 3,
      board: board
    });

    this.b = new Servo({
      pin: 6,
      board: board
    });

    this.c = new Servo({
      pin: 9,
      board: board
    });

    this.spies = [
      "to", "stop"
    ];

    this.spies.forEach(function(method) {
      this[method] = sinon.spy(Servo.prototype, method);
    }.bind(this));

    done();
  },

  tearDown: function(done) {
    this.spies.forEach(function(value) {
      this[value].restore();
    }.bind(this));
    done();
  },

  initFromEmpty: function(test) {
    test.expect(4);

    var servos = new Servo.Array();

    test.equal(servos.length, 3);
    test.equal(servos[0], this.a);
    test.equal(servos[1], this.b);
    test.equal(servos[2], this.c);

    test.done();
  },

  initFromServoNumbers: function(test) {
    test.expect(1);

    var servos = new Servo.Array([3, 6, 9]);

    test.equal(servos.length, 3);
    test.done();
  },

  initFromServos: function(test) {
    test.expect(1);

    var servos = new Servo.Array([
      this.a, this.b, this.c
    ]);

    test.equal(servos.length, 3);
    test.done();
  },

  callForwarding: function(test) {
    test.expect(3);

    var servos = new Servo.Array();

    servos.to(90);

    test.equal(this.to.callCount, servos.length);
    test.equal(this.to.getCall(0).args[0], 90);

    servos.stop();

    test.equal(this.stop.callCount, servos.length);

    test.done();
  },

  arrayOfArrays: function(test) {
    test.expect(9);

    var servos = new Servo.Array([this.a, this.b]);
    var arrayOfArrays = new Servo.Array([servos, this.c]);

    arrayOfArrays.to(90);

    test.equal(this.to.callCount, 3);
    test.equal(this.to.getCall(0).args[0], 90);
    test.equal(this.to.getCall(1).args[0], 90);
    test.equal(this.to.getCall(2).args[0], 90);

    test.equal(arrayOfArrays.length, 2);
    test.equal(arrayOfArrays[0][0], this.a);
    test.equal(arrayOfArrays[0][1], this.b);
    test.equal(arrayOfArrays[1], this.c);

    arrayOfArrays.stop();

    test.equal(this.stop.callCount, 3);

    test.done();
  }

};
