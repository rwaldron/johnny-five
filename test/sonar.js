var SerialPort = require("./mock-serial").SerialPort,
    MockFirmata = require("./mock-firmata"),
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    sinon = require("sinon"),
    serial = new SerialPort("/path/to/fake/usb"),
    Board = five.Board,
    Sonar = five.Sonar,
    board = new five.Board({
      repl: false,
      firmata: new MockFirmata()
    });
   
exports["Sonar"] = {

  setUp: function( done ) {

    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.firmata, "analogRead");
    this.sonar = new Sonar({ pin: 9, board: board });

    this.proto = [];

    this.instance = [
      { name: "inches" },
      { name: "cm" }
    ];

    done();
  },

  tearDown: function( done ) {
    this.analogRead.restore();
    this.clock.restore();
    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.sonar[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.sonar[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  data: function( test ) {
    
    var callback = this.analogRead.args[0][1],
        spy = sinon.spy();

    test.expect(1);
    this.sonar.on("data", spy);
    // this.clock.tick(250);

    callback(0);
    callback(1);

    test.ok(spy.calledOnce);
    test.done();
  },

  change: function( test ) {
    
    var callback = this.analogRead.args[0][1],
        spy = sinon.spy();

    test.expect(1);
    this.sonar.on("change", spy);
    // this.clock.tick(250);

    callback(0);
    callback(1);

    test.ok(spy.calledOnce);
    test.done();
  },

};
