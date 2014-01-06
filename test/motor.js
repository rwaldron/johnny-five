var MockFirmata = require("./mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Motor = five.Motor;
  
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
    test.expect(2);
    
    test.equal(this.motor.pins.pwm, 11);
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
    test.expect(2);
    
    test.equal(this.motor.pins.pwm, 11);
    test.equal(this.motor.pins.dir, 12);
    
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