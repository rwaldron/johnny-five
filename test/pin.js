var five = require("../lib/johnny-five.js"),
  MockFirmata = require("./util/mock-firmata"),
  sinon = require("sinon"),
  events = require("events"),
  Board = five.Board,
  Pin = five.Pin;

function newBoard() {
  var io = new MockFirmata();
  var board = new Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("ready");

  return board;
}
exports["Pin"] = {
  setUp: function(done) {

    this.spies = [
      "analogWrite", "digitalWrite",
      "analogRead", "digitalRead",
      "queryPinState"
    ];

    this.spies.forEach(function(method) {
      this[method] = sinon.spy(MockFirmata.prototype, method);
    }.bind(this));

    var board = newBoard();

    this.clock = sinon.useFakeTimers();

    this.digital = new Pin({
      pin: 11,
      board: board
    });

    this.analog = new Pin({
      pin: "A1",
      board: board
    });

    this.dtoa = new Pin({
      pin: 14,
      board: board
    });


    this.proto = [{
      name: "query"
    }, {
      name: "high"
    }, {
      name: "low"
    }, {
      name: "read"
    }, {
      name: "write"
    }];

    this.instance = [{
      name: "id"
    }, {
      name: "pin"
    }, {
      name: "type"
    }, {
      name: "addr"
    }, {
      name: "value"
    }, {
      name: "mode"
    }];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.spies.forEach(function(value) {
      this[value].restore();
    }.bind(this));
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.digital[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.digital[property.name], "undefined");
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);

    test.ok(this.digital instanceof events.EventEmitter);

    test.done();
  },

  addr: function(test) {
    test.expect(2);

    test.equal(this.digital.addr, 11, "11 -> 11");
    test.equal(this.analog.addr, 1, "A1 -> 1");

    test.done();
  },

  digital: function(test) {
    test.expect(2);

    test.equal(this.digital.type, "digital");
    test.equal(this.digital.mode, 1);

    test.done();
  },

  analog: function(test) {
    test.expect(2);

    test.equal(this.analog.type, "analog");
    test.equal(this.analog.mode, 2);

    test.done();
  },

  dtoa: function(test) {
    test.expect(2);

    test.equal(this.dtoa.type, "digital");
    test.equal(this.dtoa.mode, 1);

    test.done();
  },

  high: function(test) {
    test.expect(2);

    this.digital.high();
    test.ok(this.digitalWrite.calledWith(11, 1));

    this.analog.high();
    test.ok(this.analogWrite.calledWith(1, 255));

    test.done();
  },

  low: function(test) {
    test.expect(2);

    this.digital.low();
    test.ok(this.digitalWrite.calledWith(11, 0));

    this.analog.low();
    test.ok(this.analogWrite.calledWith(1, 0));

    test.done();
  },

  write: function(test) {
    test.expect(8);

    this.digital.write(1);
    test.ok(this.digitalWrite.calledWith(11, 1));
    test.equal(this.digital.value, 1);

    this.digital.write(0);
    test.ok(this.digitalWrite.calledWith(11, 0));
    test.equal(this.digital.value, 0);

    this.analog.write(1023);
    test.ok(this.analogWrite.calledWith(1, 1023));
    test.equal(this.analog.value, 1023);

    this.analog.write(0);
    test.ok(this.analogWrite.calledWith(1, 0));
    test.equal(this.analog.value, 0);

    test.done();
  },

  readDigital: function(test) {
    test.expect(22);

    this.digitalRead.reset();

    var pin = new Pin({
      pin: 8,
      mode: Pin.INPUT,
      board: newBoard()
    });

    var readHandler = this.digitalRead.args[0][1];
    var spy = sinon.spy();


    pin.read(spy);

    this.clock.tick(25);
    test.ok(spy.called);

    spy.reset();

    for (var i = 0; i < 10; i++) {
      readHandler(1);
    }

    this.clock.tick(200);
    test.equal(spy.callCount, 10);

    spy.args.forEach(function(args) {
      test.equal(args[0], null);
      test.equal(args[1], 1);
    });

    test.done();
  },

  readDigitalUpdateMode: function(test) {
    test.expect(3);

    var pin = new Pin({
      pin: 11,
      mode: Pin.OUTPUT,
      board: newBoard()
    });

    var spy = sinon.spy();

    test.equal(pin.mode, 1);

    pin.read(spy);

    test.equal(pin.mode, 0);

    this.clock.tick(200);
    test.equal(spy.callCount, 10);

    test.done();
  },

  readAnalog: function(test) {
    test.expect(22);

    this.analogRead.reset();

    var pin = new Pin({
      pin: "A0",
      mode: Pin.ANALOG,
      board: newBoard()
    });

    var readHandler = this.analogRead.args[0][1];
    var spy = sinon.spy();

    pin.read(spy);

    this.clock.tick(25);
    test.ok(spy.called);

    spy.reset();

    for (var i = 0; i < 10; i++) {
      readHandler(1023);
    }

    this.clock.tick(200);
    test.equal(spy.callCount, 10);

    spy.args.forEach(function(args) {
      test.equal(args[0], null);
      test.equal(args[1], 1023);
    });

    test.done();
  },

  readAnalogUpdateMode: function(test) {
    /*
    An analog pin will only be type="analog"
     */

    test.expect(3);

    var pin = new Pin({
      pin: "A0",
      board: newBoard()
    });

    var spy = sinon.spy();

    test.equal(pin.mode, 2);

    pin.read(spy);

    test.equal(pin.mode, 2);

    this.clock.tick(200);
    test.equal(spy.callCount, 10);


    test.done();
  },

  query: function(test) {
    test.expect(2);

    this.analog.query(function() {});
    this.digital.query(function() {});

    // A1 => 15
    test.ok(this.queryPinState.calledWith(15));
    // 11 => 11
    test.ok(this.queryPinState.calledWith(11));

    test.done();
  }
};

exports["Pin.Array"] = {
  setUp: function(done) {
    var board = new Board({
      io: new MockFirmata(),
      debug: false,
      repl: false
    });

    Pin.purge();

    this.digital = new Pin({
      pin: 11,
      board: board
    });

    this.analog = new Pin({
      pin: "A1",
      board: board
    });

    this.dtoa = new Pin({
      pin: 14,
      board: board
    });

    this.spies = [
      "write", "low"
    ];

    this.spies.forEach(function(method) {
      this[method] = sinon.spy(Pin.prototype, method);
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

    var pins = new Pin.Array();

    test.equal(pins.length, 3);
    test.equal(pins[0], this.digital);
    test.equal(pins[1], this.analog);
    test.equal(pins[2], this.dtoa);

    test.done();
  },

  initFromPinNumbers: function(test) {
    test.expect(1);

    var pins = new Pin.Array([3, 7, 9]);

    test.equal(pins.length, 3);
    test.done();
  },

  initFromPins: function(test) {
    test.expect(1);

    var pins = new Pin.Array([
      this.digital, this.analog, this.dtoa
    ]);

    test.equal(pins.length, 3);
    test.done();
  },

  callForwarding: function(test) {
    test.expect(3);

    var pins = new Pin.Array();

    pins.write(1);

    test.equal(this.write.callCount, pins.length);
    test.equal(this.write.getCall(0).args[0], 1);

    pins.low();

    test.equal(this.low.callCount, pins.length);

    test.done();
  },
};

exports["Pin.isPrefixed"] = {
  is: function(test) {
    test.expect(2);

    test.ok(Pin.isPrefixed("A0", ["A", "I"]));
    test.ok(Pin.isPrefixed("I0", ["A", "I"]));

    test.done();
  },
  not: function(test) {
    test.expect(2);

    test.ok(!Pin.isPrefixed(9, ["A", "I"]));
    test.ok(!Pin.isPrefixed("O0", ["A", "I"]));

    test.done();
  }
};

exports["Pin.isAnalog"] = {
  is: function(test) {
    test.expect(6);

    test.ok(Pin.isAnalog("A0"));
    test.ok(Pin.isAnalog("I0"));

    test.ok(Pin.isAnalog({
      pin: "A0"
    }));
    test.ok(Pin.isAnalog({
      pin: "I0"
    }));

    test.ok(Pin.isAnalog({
      addr: "A0"
    }));
    test.ok(Pin.isAnalog({
      addr: "I0"
    }));


    test.done();
  },
  not: function(test) {
    test.expect(2);

    test.ok(!Pin.isAnalog(9));
    test.ok(!Pin.isAnalog("O0"));

    test.done();
  }
};


// * Pin.INPUT   = 0x00
// * Pin.OUTPUT  = 0x01
// * Pin.ANALOG  = 0x02
// * Pin.PWM     = 0x03
// * Pin.SERVO   = 0x04
