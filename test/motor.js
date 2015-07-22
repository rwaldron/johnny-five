var MockFirmata = require("./util/mock-firmata");
var five = require("../lib/johnny-five");
var EVS = require("../lib/evshield");
var sinon = require("sinon");
var Board = five.Board;
var Motor = five.Motor;
var Sensor = five.Sensor;

function newBoard() {
  var io = new MockFirmata();
  var board = new Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("connect");
  io.emit("ready");

  return board;
}

function restore(target) {
  for (var prop in target) {

    if (Array.isArray(target[prop])) {
      continue;
    }

    if (target[prop] != null && typeof target[prop].restore === "function") {
      target[prop].restore();
    }

    if (typeof target[prop] === "object") {
      restore(target[prop]);
    }
  }
}

exports["Motor: Non-Directional"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.spy = sinon.spy(MockFirmata.prototype, "analogWrite");
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  pinList: function(test) {
    test.expect(3);

    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.opts.device, "NONDIRECTIONAL");
    test.equal(typeof this.motor.pins.dir, "undefined");

    test.done();
  },

  startStop: function(test) {
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

  startBrakeRelease: function(test) {
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

  threshold: function(test) {
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
  setUp: function(done) {
    this.board = newBoard();
    this.analogWrite = sinon.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  pinList: function(test) {
    test.expect(2);

    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.pins.dir, 12);

    test.done();
  },

  startStop: function(test) {
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

  forward: function(test) {
    test.expect(2);

    this.motor.forward(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));

    test.done();
  },

  reverse: function(test) {
    test.expect(2);

    this.motor.reverse(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));

    test.done();
  },

  brake: function(test) {
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

  threshold: function(test) {
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
  }
};

exports["Motor: Directional with no speed passed"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.analogWrite = sinon.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {

    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  start: function(test) {
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

  threshold: function(test) {
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
  setUp: function(done) {
    this.board = newBoard();
    this.analogWrite = sinon.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  pinList: function(test) {
    test.expect(3);

    test.equal(this.motor.pins.pwm, 3);
    test.equal(this.motor.pins.dir, 12);
    test.equal(this.motor.pins.brake, 9);

    test.done();
  },

  startStop: function(test) {
    test.expect(2);

    this.motor.start();
    test.ok(this.analogWrite.lastCall.calledWith(3, 128));
    this.analogWrite.reset();
    this.digitalWrite.reset();

    this.motor.stop();
    test.ok(this.analogWrite.lastCall.calledWith(3, 0));

    test.done();
  },

  forward: function(test) {
    test.expect(2);

    this.motor.forward(128);
    test.ok(this.analogWrite.lastCall.calledWith(3, 128));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));

    test.done();
  },

  reverse: function(test) {
    test.expect(2);

    this.motor.reverse(128);
    test.ok(this.analogWrite.lastCall.calledWith(3, 128));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));

    test.done();
  },

  brake: function(test) {
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

  timedBrake: function(test) {
    var clock = sinon.useFakeTimers();
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

  threshold: function(test) {
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
  setUp: function(done) {
    this.board = newBoard();
    this.analogWrite = sinon.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  current: function(test) {
    test.expect(1);

    test.ok(this.motor.current instanceof Sensor);

    test.done();
  },

  pinList: function(test) {
    test.expect(3);

    test.equal(this.motor.pins.pwm, 3);
    test.equal(this.motor.pins.dir, 12);
    test.equal(this.motor.current.pin, "0");

    test.done();
  }

};

exports["Motor: Directional - Three Pin"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.analogWrite = sinon.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  pinList: function(test) {
    test.expect(3);

    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.pins.dir, 12);
    test.equal(this.motor.pins.cdir, 13);

    test.done();
  },

  start: function(test) {
    test.expect(3);

    this.motor.start();
    test.ok(this.digitalWrite.firstCall.calledWith(13, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));

    test.done();
  },

  stop: function(test) {
    test.expect(1);

    this.motor.stop();
    test.ok(this.analogWrite.calledWith(11, 0));

    test.done();
  },

  forward: function(test) {
    test.expect(3);

    this.analogWrite.reset();
    this.digitalWrite.reset();
    this.motor.forward(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    test.ok(this.digitalWrite.firstCall.calledWith(13, 0));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 1));

    test.done();
  },

  reverse: function(test) {
    test.expect(3);

    this.analogWrite.reset();
    this.digitalWrite.reset();
    this.motor.reverse(128);
    test.ok(this.analogWrite.lastCall.calledWith(11, 128));
    test.ok(this.digitalWrite.firstCall.calledWith(13, 1));
    test.ok(this.digitalWrite.lastCall.calledWith(12, 0));

    test.done();
  },

  brakeRelease: function(test) {
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

};

exports["Motor: Inverse Speed When Forward"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.analogWrite = sinon.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  pinList: function(test) {
    test.expect(3);

    test.equal(this.motor.opts.invertPWM, true);

    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.pins.dir, 12);

    test.done();
  },

  forward: function(test) {
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

  reverse: function(test) {
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

  brake: function(test) {
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

  threshold: function(test) {
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
  setUp: function(done) {
    this.board = newBoard();
    this.analogWrite = sinon.spy(MockFirmata.prototype, "analogWrite");
    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  brake: function(test) {
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

exports["Motor: I2C - PCA9685"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Motor({
      controller: "PCA9685",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  pinList: function(test) {
    test.expect(3);

    test.equal(this.motor.pins.pwm, 8);
    test.equal(this.motor.pins.dir, 9);
    test.equal(this.motor.pins.cdir, 10);

    test.done();
  },

  start: function(test) {
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

  stop: function(test) {
    test.expect(6);
    this.i2cWrite.reset();
    this.motor.stop();


    test.equal(this.i2cWrite.args[0][0], 0x60);
    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 0);
    test.equal(this.i2cWrite.args[0][1][4], 0);

    test.done();
  },

  forward: function(test) {
    test.expect(21);
    this.i2cWrite.reset();

    this.motor.forward(128);

    test.equal(this.i2cWrite.args[0][0], 0x60);

    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 0);
    test.equal(this.i2cWrite.args[0][1][4], 0);

    test.equal(this.i2cWrite.args[1][1][0], 46);
    test.equal(this.i2cWrite.args[1][1][1], 0);
    test.equal(this.i2cWrite.args[1][1][2], 0);
    test.equal(this.i2cWrite.args[1][1][3], 0);
    test.equal(this.i2cWrite.args[1][1][4], 0);

    test.equal(this.i2cWrite.args[2][1][0], 42);
    test.equal(this.i2cWrite.args[2][1][1], 0);
    test.equal(this.i2cWrite.args[2][1][2], 0);
    test.equal(this.i2cWrite.args[2][1][3], 4080);
    test.equal(this.i2cWrite.args[2][1][4], 15);

    test.equal(this.i2cWrite.args[3][1][0], 38);
    test.equal(this.i2cWrite.args[3][1][1], 0);
    test.equal(this.i2cWrite.args[3][1][2], 0);
    test.equal(this.i2cWrite.args[3][1][3], 2048);
    test.equal(this.i2cWrite.args[3][1][4], 8);
    test.done();
  },

  reverse: function(test) {
    test.expect(21);
    this.i2cWrite.reset();

    this.motor.reverse(128);

    test.equal(this.i2cWrite.args[0][0], 0x60);

    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 0);
    test.equal(this.i2cWrite.args[0][1][4], 0);

    test.equal(this.i2cWrite.args[1][1][0], 46);
    test.equal(this.i2cWrite.args[1][1][1], 0);
    test.equal(this.i2cWrite.args[1][1][2], 0);
    test.equal(this.i2cWrite.args[1][1][3], 4080);
    test.equal(this.i2cWrite.args[1][1][4], 15);

    test.equal(this.i2cWrite.args[2][1][0], 42);
    test.equal(this.i2cWrite.args[2][1][1], 0);
    test.equal(this.i2cWrite.args[2][1][2], 0);
    test.equal(this.i2cWrite.args[2][1][3], 0);
    test.equal(this.i2cWrite.args[2][1][4], 0);

    test.equal(this.i2cWrite.args[3][1][0], 38);
    test.equal(this.i2cWrite.args[3][1][1], 0);
    test.equal(this.i2cWrite.args[3][1][2], 0);
    test.equal(this.i2cWrite.args[3][1][3], 2048);
    test.equal(this.i2cWrite.args[3][1][4], 8);

    test.done();
  },

  brakeRelease: function(test) {
    test.expect(42);
    this.i2cWrite.reset();

    this.motor.rev(128);
    this.i2cWrite.reset();

    this.motor.brake();
    test.equal(this.i2cWrite.args[0][0], 0x60);

    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 0);
    test.equal(this.i2cWrite.args[0][1][4], 0);

    test.equal(this.i2cWrite.args[1][1][0], 42);
    test.equal(this.i2cWrite.args[1][1][1], 0);
    test.equal(this.i2cWrite.args[1][1][2], 0);
    test.equal(this.i2cWrite.args[1][1][3], 2032);
    test.equal(this.i2cWrite.args[1][1][4], 7);

    test.equal(this.i2cWrite.args[2][1][0], 46);
    test.equal(this.i2cWrite.args[2][1][1], 2032);
    test.equal(this.i2cWrite.args[2][1][2], 7);
    test.equal(this.i2cWrite.args[2][1][3], 4080);
    test.equal(this.i2cWrite.args[2][1][4], 15);

    test.equal(this.i2cWrite.args[3][1][0], 38);
    test.equal(this.i2cWrite.args[3][1][1], 0);
    test.equal(this.i2cWrite.args[3][1][2], 0);
    test.equal(this.i2cWrite.args[3][1][3], 4080);
    test.equal(this.i2cWrite.args[3][1][4], 15);

    this.i2cWrite.reset();

    this.motor.release();

    test.equal(this.i2cWrite.args[0][0], 0x60);

    test.equal(this.i2cWrite.args[0][1][0], 38);
    test.equal(this.i2cWrite.args[0][1][1], 0);
    test.equal(this.i2cWrite.args[0][1][2], 0);
    test.equal(this.i2cWrite.args[0][1][3], 0);
    test.equal(this.i2cWrite.args[0][1][4], 0);

    test.equal(this.i2cWrite.args[1][1][0], 46);
    test.equal(this.i2cWrite.args[1][1][1], 0);
    test.equal(this.i2cWrite.args[1][1][2], 0);
    test.equal(this.i2cWrite.args[1][1][3], 4080);
    test.equal(this.i2cWrite.args[1][1][4], 15);

    test.equal(this.i2cWrite.args[2][1][0], 42);
    test.equal(this.i2cWrite.args[2][1][1], 0);
    test.equal(this.i2cWrite.args[2][1][2], 0);
    test.equal(this.i2cWrite.args[2][1][3], 0);
    test.equal(this.i2cWrite.args[2][1][4], 0);

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
  setUp: function(done) {
    this.board = newBoard();
    this.digitalWrite = sinon.spy(MockFirmata.prototype, "digitalWrite");
    this.analogWrite = sinon.spy(MockFirmata.prototype, "analogWrite");
    this.shiftOut = sinon.spy(Board.prototype, "shiftOut");
    this.motor = new Motor({
      board: this.board,
      pins: {pwm: 11},
      register: { data: 8, clock: 4, latch: 12 },
      bits: { a: 2, b: 3 }
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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  pinList: function(test) {
    test.expect(1);

    test.equal(this.motor.pins.pwm, 11);

    test.done();
  },

  start: function(test) {
    test.expect(1);

    this.motor.start();

    test.ok(this.analogWrite.lastCall.calledWith(11, 128));

    test.done();
  },

  stop: function(test) {
    test.expect(1);

    this.motor.stop();

    test.ok(this.analogWrite.lastCall.calledWith(11, 0));

    test.done();
  },

  forward: function(test) {
    test.expect(4);

    this.motor.forward(128);

    test.ok(this.analogWrite.lastCall.calledWith(11, 128));

    test.ok(this.digitalWrite.firstCall.calledWith(12, 0)); // Latch 0
    test.ok(this.shiftOut.lastCall.calledWith(8, 4, true, 0x04));
    test.ok(this.digitalWrite.getCall(25).calledWith(12, 1)); // Latch 1

    test.done();
  },

  reverse: function(test) {
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
  setUp: function(done) {
    this.board = newBoard();

    this.ev3write = sinon.spy(EVS.prototype, "write");
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");

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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  pinList: function(test) {
    test.expect(1);

    test.equal(this.motor.pins.pwm, "BBM2");

    test.done();
  },

  start: function(test) {
    test.expect(1);

    this.motor.start();

    var expect = [
      {
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78,
      [ 50, 0, 0, 129 ]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },

  stop: function(test) {
    test.expect(1);

    this.motor.stop();

    var expect = [
      {
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

  forward: function(test) {
    test.expect(1);

    this.motor.forward(128);

    var expect = [
      {
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78,
      [ 50, 0, 0, 129 ]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },

  reverse: function(test) {
    test.expect(1);

    this.motor.reverse(128);

    var expect = [
      {
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78,
      [ -50, 0, 0, 129 ]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },
};


exports["Motor: EVS_NXT"] = {
  setUp: function(done) {
    this.board = newBoard();

    this.ev3write = sinon.spy(EVS.prototype, "write");
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");

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

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.motor[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.motor[property.name], "undefined");
    }, this);

    test.done();
  },

  pinList: function(test) {
    test.expect(1);

    test.equal(this.motor.pins.pwm, "BBM2");

    test.done();
  },

  start: function(test) {
    test.expect(1);

    this.motor.start();

    var expect = [
      {
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78,
      [ 50, 0, 0, 129 ]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },

  stop: function(test) {
    test.expect(1);

    this.motor.stop();

    var expect = [
      {
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

  forward: function(test) {
    test.expect(1);

    this.motor.forward(128);

    var expect = [
      {
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78,
      [ 50, 0, 0, 129 ]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },

  reverse: function(test) {
    test.expect(1);

    this.motor.reverse(128);

    var expect = [
      {
        analog: undefined,
        address: 27,
        bank: "b",
        mode: undefined,
        motor: 2,
        offset: undefined,
        port: 8,
        sensor: undefined
      },
      78,
      [ -50, 0, 0, 129 ]
    ];

    test.deepEqual(this.ev3write.lastCall.args, expect);

    test.done();
  },
};

exports["Motor.Array"] = {
  setUp: function(done) {
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

    this.spies.forEach(function(method) {
      this[method] = sinon.spy(Motor.prototype, method);
    }.bind(this));

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  initFromMotorNumbers: function(test) {
    test.expect(1);

    var motors = new Motor.Array([
      { pwm: 3, dir: 4 },
      { pwm: 5, dir: 6 },
      { pwm: 9, dir: 10 }
    ]);

    test.equal(motors.length, 3);
    test.done();
  },

  initFromMotors: function(test) {
    test.expect(1);

    var motors = new Motor.Array([
      this.a, this.b, this.c
    ]);

    test.equal(motors.length, 3);
    test.done();
  },

  callForwarding: function(test) {
    test.expect(3);

    var motors = new Motor.Array([
      { pwm: 3, dir: 4 },
      { pwm: 5, dir: 6 },
      { pwm: 9, dir: 10 }
    ]);

    motors.start(90);

    test.equal(this.start.callCount, motors.length);
    test.equal(this.start.getCall(0).args[0], 90);

    motors.stop();

    test.equal(this.stop.callCount, motors.length);

    test.done();
  },

  arrayOfArrays: function(test) {
    test.expect(9);

    var motors = new Motor.Array([this.a, this.b]);
    var arrayOfArrays = new Motor.Array([motors, this.c]);

    arrayOfArrays.start(90);

    test.equal(this.start.callCount, 3);
    test.equal(this.start.getCall(0).args[0], 90);
    test.equal(this.start.getCall(1).args[0], 90);
    test.equal(this.start.getCall(2).args[0], 90);

    test.equal(arrayOfArrays.length, 2);
    test.equal(arrayOfArrays[0][0], this.a);
    test.equal(arrayOfArrays[0][1], this.b);
    test.equal(arrayOfArrays[1], this.c);

    arrayOfArrays.stop();

    test.equal(this.stop.callCount, 3);

    test.done();
  }

};
