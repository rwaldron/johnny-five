require("./common/bootstrap");

exports["Pin"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.spies = [
      "analogWrite", "digitalWrite",
      "analogRead", "digitalRead",
      "queryPinState"
    ];

    this.spies.forEach(method => {
      this[method] = this.sandbox.spy(MockFirmata.prototype, method);
    });

    this.board = newBoard();

    this.clock = this.sandbox.useFakeTimers();

    this.digital = new Pin({
      pin: 11,
      board: this.board
    });

    this.analog = new Pin({
      pin: "A1",
      board: this.board
    });

    this.dtoa = new Pin({
      pin: 14,
      board: this.board
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

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);
    this.proto.forEach(({name}) => test.equal(typeof this.digital[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.digital[name], 0));
    test.done();
  },

  emitter(test) {
    test.expect(1);

    test.ok(this.digital instanceof Emitter);

    test.done();
  },

  addr(test) {
    test.expect(2);

    test.equal(this.digital.addr, 11, "11 -> 11");
    test.equal(this.analog.addr, 1, "A1 -> 1");

    test.done();
  },

  digital(test) {
    test.expect(2);

    test.equal(this.digital.type, "digital");
    test.equal(this.digital.mode, 1);

    test.done();
  },

  analog(test) {
    test.expect(2);

    test.equal(this.analog.type, "analog");
    test.equal(this.analog.mode, 2);

    test.done();
  },

  dtoa(test) {
    test.expect(2);

    test.equal(this.dtoa.type, "digital");
    test.equal(this.dtoa.mode, 1);

    test.done();
  },

  high(test) {
    test.expect(3);

    this.digital.high();
    test.ok(this.digitalWrite.calledWith(11, 1));
    test.equal(this.digital.isHigh, true);

    this.analog.high();
    test.ok(this.analogWrite.calledWith(1, 255));

    test.done();
  },

  low(test) {
    test.expect(3);

    this.digital.low();
    test.ok(this.digitalWrite.calledWith(11, 0));
    test.equal(this.digital.isLow, true);

    this.analog.low();
    test.ok(this.analogWrite.calledWith(1, 0));

    test.done();
  },

  write(test) {
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

  readDigital(test) {
    test.expect(22);

    this.digitalRead.reset();

    const pin = new Pin({
      pin: 8,
      mode: Pin.INPUT,
      board: newBoard()
    });

    const readHandler = this.digitalRead.args[0][1];
    const spy = this.sandbox.spy();


    pin.read(spy);

    this.clock.tick(25);
    test.ok(spy.called);

    spy.reset();

    for (let i = 0; i < 10; i++) {
      readHandler(1);
    }

    this.clock.tick(200);
    test.equal(spy.callCount, 10);

    spy.args.forEach(args => {
      test.equal(args[0], null);
      test.equal(args[1], 1);
    });

    test.done();
  },

  readDigitalUpdateMode(test) {
    test.expect(3);

    const pin = new Pin({
      pin: 11,
      mode: Pin.OUTPUT,
      board: newBoard()
    });

    const spy = this.sandbox.spy();

    test.equal(pin.mode, 1);

    pin.read(spy);

    test.equal(pin.mode, 0);

    this.clock.tick(200);
    test.equal(spy.callCount, 10);

    test.done();
  },

  readAnalog(test) {
    test.expect(22);

    this.analogRead.reset();

    const pin = new Pin({
      pin: "A0",
      mode: Pin.ANALOG,
      board: newBoard()
    });

    const readHandler = this.analogRead.args[0][1];
    const spy = this.sandbox.spy();

    pin.read(spy);

    this.clock.tick(25);
    test.ok(spy.called);

    spy.reset();

    for (let i = 0; i < 10; i++) {
      readHandler(1023);
    }

    this.clock.tick(200);
    test.equal(spy.callCount, 10);

    spy.args.forEach(args => {
      test.equal(args[0], null);
      test.equal(args[1], 1023);
    });

    test.done();
  },

  readAnalogUpdateMode(test) {
    /*
    An analog pin will only be type="analog"
     */

    test.expect(3);

    const pin = new Pin({
      pin: "A0",
      board: newBoard()
    });

    const spy = this.sandbox.spy();

    test.equal(pin.mode, 2);

    pin.read(spy);

    test.equal(pin.mode, 2);

    this.clock.tick(200);
    test.equal(spy.callCount, 10);


    test.done();
  },

  query(test) {
    test.expect(2);

    this.analog.query(() => {});
    this.digital.query(() => {});

    // A1 => 15
    test.ok(this.queryPinState.calledWith(15));
    // 11 => 11
    test.ok(this.queryPinState.calledWith(11));

    test.done();
  }
};

exports["10 Bit Pin"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.spies = [
      "analogWrite", "digitalWrite",
      "analogRead", "digitalRead",
      "queryPinState"
    ];

    this.spies.forEach(method => {
      this[method] = this.sandbox.spy(MockFirmata.prototype, method);
    });

    this.board = newBoard();

    // Override board resolution
    this.board.RESOLUTION.PWM = 1023;

    this.analog = new Pin({
      pin: "A1",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  analog(test) {
    test.expect(2);

    test.equal(this.analog.type, "analog");
    test.equal(this.analog.mode, 2);

    test.done();
  },

  high(test) {
    test.expect(1);

    this.analog.high();
    test.ok(this.analogWrite.calledWith(1, 1023));

    test.done();
  },

  low(test) {
    test.expect(1);

    this.analog.low();
    test.ok(this.analogWrite.calledWith(1, 0));

    test.done();
  },

  write(test) {
    test.expect(4);

    this.analog.write(1023);
    test.ok(this.analogWrite.calledWith(1, 1023));
    test.equal(this.analog.value, 1023);

    this.analog.write(0);
    test.ok(this.analogWrite.calledWith(1, 0));
    test.equal(this.analog.value, 0);

    test.done();
  }
};

exports["Pin.Collection"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();

    Pin.purge();

    this.digital = new Pin({
      pin: 11,
      board: this.board
    });

    this.analog = new Pin({
      pin: "A1",
      board: this.board
    });

    this.dtoa = new Pin({
      pin: 14,
      board: this.board
    });

    this.spies = [
      "write", "low"
    ];

    this.spies.forEach(method => {
      this[method] = this.sandbox.spy(Pin.prototype, method);
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  initFromPinNumbers(test) {
    test.expect(1);

    const pins = new Pin.Collection([3, 7, 9]);

    test.equal(pins.length, 3);
    test.done();
  },

  initFromPins(test) {
    test.expect(1);

    const pins = new Pin.Collection([
      this.digital, this.analog, this.dtoa
    ]);

    test.equal(pins.length, 3);
    test.done();
  },

  callForwarding(test) {
    test.expect(3);

    const pins = new Pin.Collection([3, 7, 9]);

    pins.write(1);

    test.equal(this.write.callCount, pins.length);
    test.equal(this.write.getCall(0).args[0], 1);

    pins.low();

    test.equal(this.low.callCount, pins.length);

    test.done();
  },
};

exports["Pin.isPrefixed"] = {
  is(test) {
    test.expect(2);

    test.ok(Pin.isPrefixed("A0", ["A", "I"]));
    test.ok(Pin.isPrefixed("I0", ["A", "I"]));

    test.done();
  },
  not(test) {
    test.expect(2);

    test.ok(!Pin.isPrefixed(9, ["A", "I"]));
    test.ok(!Pin.isPrefixed("O0", ["A", "I"]));

    test.done();
  }
};

exports["Pin.isAnalog"] = {
  is(test) {
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
  not(test) {
    test.expect(2);

    test.ok(!Pin.isAnalog(9));
    test.ok(!Pin.isAnalog("O0"));

    test.done();
  }
};

exports["PinShape"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    // This will put a board in the cache
    newBoard();
    // Pins to test

    // default Pin instances passing only the pin number
    this.dig2Def = new Pin(2);
    this.dig19Def = new Pin(19);
    this.ana0Def = new Pin("A0");
    this.ana1Def = new Pin("A1");
    //CODE
    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  defaultPinShape(test) {
    // test.expect(23);

    // Check for cases that should throw an exception
    test.throws(() => {
      new Pin();
    }, function(msg) {
      // Changing this function to an arrow produces an error:
      // TypeError: Function has non-object prototype 'undefined' in instanceof check
      return msg.toString() === "Error: Pins must have a pin number";
    });

    test.throws(() => {
      new Pin({});
    }, function(msg) {
      // Changing this function to an arrow produces an error:
      // TypeError: Function has non-object prototype 'undefined' in instanceof check
      return msg.toString() === "Error: Pins must have a pin number";
    });

    test.throws(() => {
      new Pin({
        id: "No Pin number"
      });
    }, function(msg) {
      // Changing this function to an arrow produces an error:
      // TypeError: Function has non-object prototype 'undefined' in instanceof check
      return msg.toString() === "Error: Pins must have a pin number";
    });

    // default digital pin : new Pin(2)
    test.equal(this.dig2Def.mode, 1, "pin(2) mode --> 1 (output)");
    test.equal(typeof this.dig2Def.id, "string", "pin(2) id --> a string");
    test.equal(this.dig2Def.type, "digital", "pin(2) type");
    test.equal(this.dig2Def.pin, 2, "pin(2) pin number");
    test.equal(this.dig2Def.addr, 2, "pin(2) address");

    // default DToA pin : new Pin(19)
    test.equal(this.dig19Def.mode, 1, "pin(19) mode --> 1 (output)");
    test.equal(typeof this.dig19Def.id, "string", "pin(19) id --> a string");
    test.equal(this.dig19Def.type, "digital", "pin(19) type");
    test.equal(this.dig19Def.pin, 5, "pin(19) pin number");
    test.equal(this.dig19Def.addr, 19, "pin(19) address");

    // default analog pin : new Pin("A0")
    test.equal(this.ana0Def.mode, 2, "pin('A0') mode --> 2 (analog)");
    test.equal(typeof this.ana0Def.id, "string", "pin('A0') id --> a string");
    test.equal(this.ana0Def.type, "analog", "pin('A0') type");
    test.equal(this.ana0Def.pin, 0, "pin('A0') pin");
    test.equal(this.ana0Def.addr, 0, "pin('A0') address");

    // default analog pin : new Pin("A1")
    test.equal(this.ana1Def.mode, 2, "pin('A1') mode --> 2 (analog)");
    test.equal(typeof this.ana1Def.id, "string", "pin('A1') id --> a string");
    test.equal(this.ana1Def.type, "analog", "pin('A1') type");
    test.equal(this.ana1Def.pin, 1, "pin('A1') pin");
    test.equal(this.ana1Def.addr, 1, "pin('A1') address");

    test.done();
  }
};

exports["PinMode"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    newBoard();

    // Pins to test
    this.modeD0 = new Pin({
      pin: 4,
      mode: 0
    });
    this.modeD1 = new Pin({
      pin: 7,
      mode: 1
    });
    this.modeD2 = new Pin({
      pin: 14,
      mode: 2
    });
    this.modeD3 = new Pin({
      pin: 3,
      mode: 3
    });
    this.modeD4 = new Pin({
      pin: 5,
      mode: 4
    });
    this.modeA0 = new Pin({
      pin: 15,
      mode: 0
    });
    this.modeA1 = new Pin({
      pin: 16,
      mode: 1
    });
    this.modeA2 = new Pin({
      pin: 17,
      mode: 2
    });
    this.modeA3 = new Pin({
      pin: 18,
      mode: 3
    });
    this.modeA4 = new Pin({
      pin: 19,
      mode: 4
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  specifiedMode(test) {
    test.expect(15);

    test.equal(this.modeD0.mode, 0, "mode 0 (input) specified");
    test.equal(this.modeD1.mode, 1, "mode 1 (output) specified");
    test.equal(this.modeD2.mode, 2, "mode 2 (analog) specified");
    test.equal(this.modeD3.mode, 3, "mode 3 (pwm) specified");
    test.equal(this.modeD4.mode, 4, "mode 4 (servo) specified");

    test.equal(this.modeA0.mode, 0, "mode 0 (input) specified");
    test.equal(this.modeA1.mode, 1, "mode 1 (input) specified");
    test.equal(this.modeA2.mode, 2, "mode 2 (analog) specified");
    test.equal(this.modeA3.mode, 3, "mode 3 (pwm) specified");
    test.equal(this.modeA4.mode, 4, "mode 4 (servo) specified");

    // Double check that the provided class constants exist and match
    test.equal(this.modeD0.mode, Pin.INPUT, "mode 0 (input) specified");
    test.equal(this.modeD1.mode, Pin.OUTPUT, "mode 1 (output) specified");
    test.equal(this.modeD2.mode, Pin.ANALOG, "mode 2 (analog) specified");
    test.equal(this.modeD3.mode, Pin.PWM, "mode 3 (pwm) specified");
    test.equal(this.modeD4.mode, Pin.SERVO, "mode 4 (servo) specified");

    test.done();
  }
};


// * Pin.INPUT   = 0x00
// * Pin.OUTPUT  = 0x01
// * Pin.ANALOG  = 0x02
// * Pin.PWM     = 0x03
// * Pin.SERVO   = 0x04
