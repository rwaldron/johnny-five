var MockFirmata = require("./mock-firmata"),
    five = require("../lib/johnny-five.js"),
    Board = five.Board,
    ShiftRegister = five.ShiftRegister,
    board = new five.Board({
      repl: false,
      firmata: new MockFirmata()
    }),
    sinon = require("sinon");

exports["ShiftRegister"] = {

  setUp: function( done ) {

    this.shiftRegister = new ShiftRegister({
      pins: {
        data: 2,
        clock: 3,
        latch: 4
      },
      board: board
    });

    this.proto = [
      { name: "send" }
    ];

    this.instance = [
      { name: "pins" }
    ];

    this.pins = [
      { name: "data" },
      { name: "clock" },
      { name: "latch" }
    ];

    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length + this.pins.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.shiftRegister[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.shiftRegister[ property.name ], "undefined" );
    }, this);

    this.pins.forEach(function( property ) {
      test.notEqual( typeof this.shiftRegister.pins[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  send: function( test ){
    var spy = sinon.spy(board.firmata, 'digitalWrite');
    var shiftOutSpy = sinon.spy(board, 'shiftOut');
    test.expect(6);

    this.shiftRegister.send(0x01);
    test.ok(spy.getCall(0).calledWith(4, 0)); // latch, low
    test.ok(shiftOutSpy.calledWith(2, 3, true, 1));
    test.ok(spy.getCall(25).calledWith(4, 1)); // latch, high

    this.shiftRegister.send(0x10);
    test.ok(spy.getCall(26).calledWith(4, 0)); // latch, low
    test.ok(shiftOutSpy.calledWith(2, 3, true, 16));
    test.ok(spy.getCall(51).calledWith(4, 1)); // latch, high

    shiftOutSpy.restore();
    spy.restore();
    test.done();
  }

};
