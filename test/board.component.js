require("./common/bootstrap");

exports["Board.Component"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    done();
  },

  tearDown(done) {
    Board.purge();
    Serial.purge();
    Expander.purge();
    this.sandbox.restore();
    done();
  },

  callThroughs(test) {
    test.expect(5);

    const a = this.sandbox.spy(Board, "mount");
    const b = this.sandbox.spy(Board.Pins, "normalize");
    const opts = {};

    Board.purge();

    const board = newBoard();

    Board.Component.call({}, opts);

    test.equal(a.calledOnce, true);
    test.equal(a.getCall(0).args[0], opts);

    test.equal(b.calledOnce, true);
    test.equal(b.getCall(0).args[0], opts);
    test.equal(b.getCall(0).args[1].id, board.id);


    a.restore();
    b.restore();

    test.done();
  },

  emptyOptsInitialization(test) {
    test.expect(3);

    const component = new Board.Component();

    test.equal(typeof component.id, "string");
    test.equal(component.board, this.board);
    test.equal(component.io, this.board.io);

    test.done();
  },

  callEmptyOptsInitialization(test) {
    test.expect(3);

    const component = {};

    Board.Component.call(component);

    test.equal(typeof component.id, "string");
    test.equal(component.board, this.board);
    test.equal(component.io, this.board.io);

    test.done();
  },

  explicitIdInitialization(test) {
    test.expect(1);

    const component = new Board.Component({
      id: "foo"
    });

    test.equal(component.id, "foo");

    test.done();
  },

  callExplicitIdInitialization(test) {
    test.expect(1);

    const component = {};

    Board.Component.call(component, {
      id: "foo"
    });

    test.equal(component.id, "foo");

    test.done();
  },

  singlePinInitialization(test) {
    test.expect(1);

    const component = new Board.Component({
      pin: 1
    });

    test.equal(component.pin, 1);

    test.done();
  },

  multiPinInitialization(test) {
    test.expect(1);

    const component = new Board.Component({
      pins: [1, 2, 3]
    });

    test.deepEqual(component.pins, [1, 2, 3]);

    test.done();
  },

  noPinNormalization(test) {
    test.expect(3);

    const hasController = this.sandbox.stub(Expander, "hasController", () => true);

    const normalize = this.sandbox.spy(Board.Pins, "normalize");

    const component = new Board.Component({
      pin: 2,
      controller: "FOO"
    });

    test.equal(component.pin, 2);
    test.equal(hasController.callCount, 1);
    test.equal(normalize.callCount, 0);

    test.done();
  },

  explicitPinNormalized(test) {
    test.expect(1);

    this.board.io.name = "Foo";
    this.board.io.normalize = pin => pin ** 2;

    const component = new Board.Component({
      pin: 2
    });

    test.equal(component.pin, 4);

    test.done();
  },

  componentRegistered(test) {
    test.expect(2);

    test.equal(this.board.register.length, 0);

    new Board.Component({
      pin: 2
    });

    test.equal(this.board.register.length, 1);

    test.done();
  },

  componentOptionsForInitialization(test) {
    test.expect(1);

    const component = Board.Component.initialization({});

    test.deepEqual(component, {
      requestPin: true,
      normalizePin: true,
    });

    test.done();
  },

  // componentDoesNotDirectlyRequestPinOccupancy: function(test) {
  //   test.expect(2);

  //   var component = {};

  //   Board.Component.call(component, {
  //     pin: 1
  //   }, {
  //     requestPin: false
  //   });

  //   var spy = this.sandbox.spy(component.board, "warn");

  //   Board.Component.call(component, {
  //     pin: 1
  //   });

  //   test.equal(component.board.occupied.length, 1);
  //   test.equal(spy.notCalled, true);

  //   test.done();
  // },

  // componentPinOccupiedWarning: function(test) {
  //   test.expect(5);

  //   var component = {};

  //   Board.Component.call(component, {
  //     pin: 1
  //   });

  //   var spy = this.sandbox.spy(component.board, "warn");

  //   test.equal(component.board.occupied.length, 1);
  //   test.deepEqual(component.board.occupied[0], {
  //     value: 1,
  //     type: "pin"
  //   });

  //   Board.Component.call(component, {
  //     pin: 1
  //   });

  //   test.equal(spy.calledOnce, true);
  //   test.deepEqual(spy.getCall(0).args, ["Component", "pin: 1 is already in use"]);
  //   test.equal(component.board.occupied.length, 1);

  //   test.done();
  // },

  // componentPinAnalogDigitalNormalizedValueNoConflict: function(test) {
  //   test.expect(1);

  //   var component = {};

  //   Board.Component.call(component, Board.Options(2));
  //   Board.Component.call(component, Board.Options("A2"));

  //   test.equal(component.board.occupied.length, 2);

  //   test.done();
  // },
  // componentPinAnalogDigitalNormalizedValueArrayNoConflict: function(test) {
  //   test.expect(1);

  //   var component = {};

  //   Board.Component.call(component, Board.Options(2));
  //   Board.Component.call(component, Board.Options(["A2"]));

  //   test.equal(component.board.occupied.length, 2);

  //   test.done();
  // },
  // componentPinAnalogDigitalNormalizedValueSinglePinObjectNoConflict: function(test) {
  //   test.expect(1);

  //   var component = {};

  //   Board.Component.call(component, Board.Options(2));
  //   Board.Component.call(component, Board.Options({
  //     pin: "A2"
  //   }));

  //   test.equal(component.board.occupied.length, 2);

  //   test.done();
  // },

  // componentPinAnalogDigitalNormalizedValueMultiPinObjectNoConflict: function(test) {
  //   test.expect(1);

  //   var component = {};

  //   Board.Component.call(component, Board.Options(2));
  //   Board.Component.call(component, Board.Options({
  //     pins: {
  //       a: "A2",
  //       b: "A3"
  //     }
  //   }));

  //   test.equal(component.board.occupied.length, 3);

  //   test.done();
  // },
  // componentPinAnalogDigitalNormalizedArraySinglePinObjectNoConflict: function(test) {
  //   test.expect(1);

  //   var component = {};

  //   Board.Component.call(component, Board.Options([2]));
  //   Board.Component.call(component, Board.Options({
  //     pin: "A2"
  //   }));

  //   test.equal(component.board.occupied.length, 2);

  //   test.done();
  // },

  // componentPinAnalogDigitalNormalizedArrayMultiPinObjectNoConflict: function(test) {
  //   test.expect(1);

  //   var component = {};

  //   Board.Component.call(component, Board.Options([2]));
  //   Board.Component.call(component, Board.Options({
  //     pins: {
  //       a: "A2"
  //     }
  //   }));

  //   test.equal(component.board.occupied.length, 2);

  //   test.done();
  // },

  // componentPinAnalogDigitalNormalizedMultiPinObjectConflict: function(test) {
  //   test.expect(1);

  //   var component = {};

  //   Board.Component.call(component, Board.Options({
  //     pins: {
  //       a: "A2",
  //       b: "A2"
  //     }
  //   }));

  //   test.equal(component.board.occupied.length, 1);

  //   test.done();
  // },

  // componentPinAnalogDigitalNormalizedMultiPinObjectConflictNoConflictSameComponent: function(test) {
  //   test.expect(1);

  //   var component = {};

  //   Board.Component.call(component, Board.Options({
  //     pins: {
  //       a: "A2",
  //       b: 2
  //     }
  //   }));

  //   test.equal(component.board.occupied.length, 2);

  //   test.done();
  // },

  // componentPinAddressOccupiedWarning: function(test) {
  //   test.expect(7);

  //   var component = {};

  //   Board.Component.call(component, {
  //     pin: 2,
  //     address: 0x00
  //   });

  //   var spy = this.sandbox.spy(component.board, "warn");

  //   test.equal(component.board.occupied.length, 1);
  //   test.deepEqual(component.board.occupied[0], {
  //     value: 2,
  //     type: "pin",
  //     address: 0x00
  //   });

  //   // This SHOULD NOT interfere with the above pin request,
  //   // as it's a controller specific pin
  //   Board.Component.call(component, {
  //     pin: 2
  //   });

  //   test.equal(spy.called, false);
  //   test.equal(component.board.occupied.length, 2);

  //   // This will be rejected since the pin is already
  //   // occupied for this address.
  //   Board.Component.call(component, {
  //     pin: 2,
  //     address: 0x00
  //   });

  //   test.equal(spy.calledOnce, true);
  //   test.deepEqual(spy.getCall(0).args, ["Component", "pin: 2, address: 0 is already in use"]);
  //   test.equal(component.board.occupied.length, 2);

  //   test.done();
  // },

  // componentPinControllerOccupiedWarning: function(test) {
  //   test.expect(7);

  //   var component = {};

  //   Board.Component.call(component, {
  //     pin: 3,
  //     controller: "FOO"
  //   });

  //   var spy = this.sandbox.spy(component.board, "warn");

  //   test.equal(component.board.occupied.length, 1);
  //   test.deepEqual(component.board.occupied[0], {
  //     value: 3,
  //     type: "pin",
  //     controller: "FOO"
  //   });

  //   // This SHOULD NOT interfere with the above pin request,
  //   // as it's a controller specific pin
  //   Board.Component.call(component, {
  //     pin: 3
  //   });

  //   test.equal(spy.called, false);
  //   test.equal(component.board.occupied.length, 2);

  //   // This will be rejected since the pin is already
  //   // occupied for this controller.
  //   Board.Component.call(component, {
  //     pin: 3,
  //     controller: "FOO"
  //   });

  //   test.equal(spy.calledOnce, true);
  //   test.deepEqual(spy.getCall(0).args, ["Component", "pin: 3, controller: FOO is already in use"]);
  //   test.equal(component.board.occupied.length, 2);

  //   test.done();
  // },

  // componentPinAddressControllerOccupiedWarning: function(test) {
  //   test.expect(7);

  //   var component = {};

  //   Board.Component.call(component, {
  //     pin: 4,
  //     controller: "FOO",
  //     address: 0x01
  //   });

  //   var spy = this.sandbox.spy(component.board, "warn");

  //   test.equal(component.board.occupied.length, 1);
  //   test.deepEqual(component.board.occupied[0], {
  //     value: 4,
  //     type: "pin",
  //     controller: "FOO",
  //     address: 0x01
  //   });

  //   // This SHOULD NOT interfere with the above pin request,
  //   // as it's a controller specific pin
  //   Board.Component.call(component, {
  //     pin: 4
  //   });

  //   test.equal(spy.called, false);
  //   test.equal(component.board.occupied.length, 2);

  //   // This will be rejected since the pin is already
  //   // occupied for this controller.
  //   Board.Component.call(component, {
  //     pin: 4,
  //     controller: "FOO",
  //     address: 0x01
  //   });

  //   test.equal(spy.calledOnce, true);
  //   test.deepEqual(spy.getCall(0).args, ["Component", "pin: 4, controller: FOO, address: 1 is already in use"]);
  //   test.equal(component.board.occupied.length, 2);

  //   test.done();
  // },

  // componentAddressControllerNoWarning: function(test) {
  //   test.expect(3);

  //   var component = {};

  //   Board.Component.call(component, {
  //     controller: "FOO",
  //     address: 0x01
  //   });

  //   var spy = this.sandbox.spy(component.board, "warn");

  //   // No pins to occupy
  //   test.equal(component.board.occupied.length, 0);

  //   Board.Component.call(component, {
  //     controller: "FOO",
  //     address: 0x01
  //   });

  //   test.equal(spy.called, false);
  //   test.equal(component.board.occupied.length, 0);
  //   test.done();
  // },

  // componentPinsOccupiedWarning: function(test) {
  //   test.expect(12);

  //   var component = {};

  //   Board.Component.call(component, {
  //     pins: {
  //       a: 1,
  //       b: 2,
  //       c: 3
  //     }
  //   });

  //   var spy = this.sandbox.spy(component.board, "warn");

  //   test.equal(component.board.occupied.length, 3);
  //   test.deepEqual(component.board.occupied[0], {
  //     value: 1,
  //     type: "pin"
  //   });

  //   test.deepEqual(component.board.occupied[1], {
  //     value: 2,
  //     type: "pin"
  //   });

  //   test.deepEqual(component.board.occupied[2], {
  //     value: 3,
  //     type: "pin"
  //   });

  //   // This will be rejected since the pin is already
  //   // occupied for this controller.
  //   Board.Component.call(component, {
  //     pin: 1
  //   });

  //   // This will be rejected since the pin is already
  //   // occupied for this controller.
  //   Board.Component.call(component, {
  //     pin: 2
  //   });

  //   // This will be rejected since the pin is already
  //   // occupied for this controller.
  //   Board.Component.call(component, {
  //     pin: 3
  //   });

  //   // This will be rejected since the pin is already
  //   // occupied for this controller.
  //   Board.Component.call(component, {
  //     pins: {
  //       a: 1,
  //       b: 2,
  //       c: 3
  //     }
  //   });

  //   // 1, 2, 3 + 3
  //   test.equal(spy.callCount, 6);
  //   test.deepEqual(spy.getCall(0).args, ["Component", "pin: 1 is already in use"]);
  //   test.deepEqual(spy.getCall(1).args, ["Component", "pin: 2 is already in use"]);
  //   test.deepEqual(spy.getCall(2).args, ["Component", "pin: 3 is already in use"]);
  //   test.deepEqual(spy.getCall(3).args, ["Component", "pin: 1 is already in use"]);
  //   test.deepEqual(spy.getCall(4).args, ["Component", "pin: 2 is already in use"]);
  //   test.deepEqual(spy.getCall(5).args, ["Component", "pin: 3 is already in use"]);

  //   test.equal(component.board.occupied.length, 3);

  //   test.done();
  // },

  componentCustomReservedSpace(test) {
    test.expect(8);

    const a = {};

    Board.Component.call(a, {
      controller: "FOO",
      address: 0x01,
      custom: {
        x: 1,
        y: 2,
      }
    });

    test.equal(a.custom.x, 1);
    test.equal(a.custom.y, 2);

    const b = {};

    Board.Component.call(b, {
      pin: 2,
      custom: {
        x: 1,
        y: 2,
      }
    });

    test.equal(b.custom.x, 1);
    test.equal(b.custom.y, 2);


    const c = {};

    Board.Component.call(c, {
      pins: [3, 4, 5],
      custom: {
        x: 1,
        y: 2,
      }
    });

    test.equal(c.custom.x, 1);
    test.equal(c.custom.y, 2);


    const d = {};

    Board.Component.call(d, {
      pins: { mosi: 11, miso: 12, ss: 10 },
      custom: {
        x: 1,
        y: 2,
      }
    });

    test.equal(d.custom.x, 1);
    test.equal(d.custom.y, 2);

    test.done();
  },

  componentControllerWithDash(test) {
    test.expect(1);

    const d = {};
    Board.Component.call(d, {
      controller: "FOO-BAR-BAZ"
    });

    test.equal(d.controller, "FOOBARBAZ");
    test.done();
  },

};
