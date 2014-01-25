var MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Motor = five.Motor,
  Sensor = five.Sensor;

function newBoard() {
  return new five.Board({
    io: new MockFirmata(),
    repl: false
  });
}

exports["Motor: Non-Directional"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.spy = sinon.spy(this.board.io, "analogWrite");
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
    test.equal(this.motor.opts.device, 'NONDIRECTIONAL');
    test.equal(typeof this.motor.pins.dir, "undefined");

    test.done();
  },

  start: function(test) {
    test.expect(1);

    this.motor.start();
    test.ok(this.spy.calledWith(11, 128));

    test.done();
  },

  stop: function(test) {
    test.expect(1);

    this.motor.stop();
    test.ok(this.spy.calledWith(11, 0));

    test.done();
  }
};

exports["Motor: Directional"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.analogSpy = sinon.spy(this.board.io, "analogWrite");
    this.digitalSpy = sinon.spy(this.board.io, "digitalWrite");
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
<<<<<<< HEAD
=======
    }, {
      name: "forward"
    }, {
      name: "fwd"
    }, {
      name: "reverse"
    }, {
      name: "rev"
>>>>>>> 1924cd241cb193f7a7a070fe19398522d54b26ef
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
<<<<<<< HEAD

    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.pins.dir, 12);

=======
    
    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.pins.dir, 12);
    
>>>>>>> 1924cd241cb193f7a7a070fe19398522d54b26ef
    test.done();
  },

  start: function(test) {
    test.expect(1);

    this.motor.start();
    test.ok(this.analogSpy.calledWith(11, 128));

    test.done();
  },

  stop: function(test) {
    test.expect(1);

    this.motor.stop();
    test.ok(this.analogSpy.calledWith(11, 0));

    test.done();
  },

  forward: function(test) {
    test.expect(2);

    this.motor.forward(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 1));

    test.done();
  },

  fwd: function(test) {
    test.expect(2);

    this.motor.fwd(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 1));

    test.done();
  },

  reverse: function(test) {
    test.expect(2);

    this.motor.reverse(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 0));

    test.done();
  },

  rev: function(test) {
    test.expect(2);

    this.motor.rev(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 0));

    test.done();
  }
};

<<<<<<< HEAD
exports["Motor: Directional with no speed passed"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.analogSpy = sinon.spy(this.board.io, "analogWrite");
    this.digitalSpy = sinon.spy(this.board.io, "digitalWrite");
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
    test.ok(this.analogSpy.calledWith(11, 128));
    this.motor.stop();
    test.ok(this.analogSpy.calledWith(11, 0));
    this.motor.forward(200);
    test.ok(this.analogSpy.calledWith(11, 200));
    this.motor.stop();
    test.ok(this.analogSpy.calledWith(11, 0));
    this.motor.start();
    test.ok(this.analogSpy.calledWith(11, 200));
    this.motor.stop();
    test.ok(this.analogSpy.calledWith(11, 0));
    
    test.done();
  }
};

=======
>>>>>>> 1924cd241cb193f7a7a070fe19398522d54b26ef
exports["Motor: Directional with Brake"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.analogSpy = sinon.spy(this.board.io, "analogWrite");
    this.digitalSpy = sinon.spy(this.board.io, "digitalWrite");
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
<<<<<<< HEAD

    test.equal(this.motor.pins.pwm, 3);
    test.equal(this.motor.pins.dir, 12);
    test.equal(this.motor.pins.brake, 9);

=======
    
    test.equal(this.motor.pins.pwm, 3);
    test.equal(this.motor.pins.dir, 12);
    test.equal(this.motor.pins.brake, 9);
    
>>>>>>> 1924cd241cb193f7a7a070fe19398522d54b26ef
    test.done();
  },

  start: function(test) {
    test.expect(2);

    this.motor.start();
    test.ok(this.analogSpy.calledWith(3, 128));
    test.ok(this.digitalSpy.calledWith(9, 0));

    test.done();
  },

  stop: function(test) {
    test.expect(2);

    this.motor.stop();
    test.ok(this.analogSpy.calledWith(3, 0));
    test.ok(this.digitalSpy.calledWith(9, 0));

    test.done();
  },

  forward: function(test) {
    test.expect(3);

    this.motor.forward(128);
    test.ok(this.analogSpy.calledWith(3, 128));
    test.ok(this.digitalSpy.calledWith(12, 1));
    test.ok(this.digitalSpy.calledWith(9, 0));

    test.done();
  },

  brake: function(test) {
    test.expect(1);

    this.motor.brake();
    test.ok(this.digitalSpy.calledWith(9, 1));

    test.done();
  },
<<<<<<< HEAD

  release: function(test) {
    test.expect(1);

=======
  
  release: function(test) {
    test.expect(1);
    
>>>>>>> 1924cd241cb193f7a7a070fe19398522d54b26ef
    this.motor.release();
    test.ok(this.digitalSpy.calledWith(9, 0));

    test.done();
  },

  fwd: function(test) {
    test.expect(3);

    this.motor.fwd(128);
    test.ok(this.analogSpy.calledWith(3, 128));
    test.ok(this.digitalSpy.calledWith(12, 1));
    test.ok(this.digitalSpy.calledWith(9, 0));

    test.done();
  },

  reverse: function(test) {
    test.expect(3);

    this.motor.reverse(128);
    test.ok(this.analogSpy.calledWith(3, 128));
    test.ok(this.digitalSpy.calledWith(12, 0));
    test.ok(this.digitalSpy.calledWith(9, 0));

    test.done();
  },

  rev: function(test) {
    test.expect(3);

    this.motor.rev(128);
    test.ok(this.analogSpy.calledWith(3, 128));
    test.ok(this.digitalSpy.calledWith(12, 0));
    test.ok(this.digitalSpy.calledWith(9, 0));

    test.done();
  }
};

exports["Motor: Directional with Current Sensing Pin"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.analogSpy = sinon.spy(this.board.io, "analogWrite");
    this.digitalSpy = sinon.spy(this.board.io, "digitalWrite");
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
<<<<<<< HEAD

    test.ok(this.motor.current instanceof Sensor);

=======
    
    test.ok(this.motor.current instanceof Sensor);
    
>>>>>>> 1924cd241cb193f7a7a070fe19398522d54b26ef
    test.done();
  },

  pinList: function(test) {
<<<<<<< HEAD
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
    this.analogSpy = sinon.spy(this.board.io, "analogWrite");
    this.digitalSpy = sinon.spy(this.board.io, "digitalWrite");
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
    test.expect(1);

    this.motor.start();
    test.ok(this.analogSpy.calledWith(11, 128));

    test.done();
  },

  stop: function(test) {
    test.expect(1);

    this.motor.stop();
    test.ok(this.analogSpy.calledWith(11, 0));

    test.done();
  },

  forward: function(test) {
    test.expect(3);

    this.motor.forward(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 1));
    test.ok(this.digitalSpy.calledWith(13, 0));

    test.done();
  },

  fwd: function(test) {
    test.expect(3);

    this.motor.fwd(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 1));
    test.ok(this.digitalSpy.calledWith(13, 0));

    test.done();
  },

  reverse: function(test) {
    test.expect(3);

    this.motor.reverse(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 0));
    test.ok(this.digitalSpy.calledWith(13, 1));

    test.done();
  },

  rev: function(test) {
    test.expect(3);

    this.motor.rev(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 0));
    test.ok(this.digitalSpy.calledWith(13, 1));

    test.done();
  }
=======
    test.expect(2);
    
    test.equal(this.motor.pins.pwm, 3);
    test.equal(this.motor.pins.dir, 12);
    /* this doesn't work and I don't understand why
    / this.motor.current.pin = 0
    test.equal(this.motor.current.pin, "A0");
    */
    
    test.done();
  }
  
>>>>>>> 1924cd241cb193f7a7a070fe19398522d54b26ef
};

exports["Motor: Directional - Three Pin"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.analogSpy = sinon.spy(this.board.io, "analogWrite");
    this.digitalSpy = sinon.spy(this.board.io, "digitalWrite");
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
    test.expect(1);

    this.motor.start();
    test.ok(this.analogSpy.calledWith(11, 128));

    test.done();
  },

  stop: function(test) {
    test.expect(1);

    this.motor.stop();
    test.ok(this.analogSpy.calledWith(11, 0));

    test.done();
  },

  forward: function(test) {
    test.expect(3);

    this.motor.forward(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 1));
    test.ok(this.digitalSpy.calledWith(13, 0));

    test.done();
  },

  fwd: function(test) {
    test.expect(3);

    this.motor.fwd(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 1));
    test.ok(this.digitalSpy.calledWith(13, 0));

    test.done();
  },

  reverse: function(test) {
    test.expect(3);

    this.motor.reverse(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 0));
    test.ok(this.digitalSpy.calledWith(13, 1));

    test.done();
  },

  rev: function(test) {
    test.expect(3);

    this.motor.rev(128);
    test.ok(this.analogSpy.calledWith(11, 128));
    test.ok(this.digitalSpy.calledWith(12, 0));
    test.ok(this.digitalSpy.calledWith(13, 1));

    test.done();
  }
};