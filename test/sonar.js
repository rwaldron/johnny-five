var MockFirmata = require("./mock-firmata"),
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    sinon = require("sinon"),
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
    this.sonar = new Sonar({ pin: 9, freq: 100 , board: board });

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
   
    callback(225);
    callback(255);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.done();
  },

  change: function( test ) {
    
    var callback = this.analogRead.args[0][1],
        spy = sinon.spy();

    test.expect(1);
    this.sonar.on("change", spy);

    callback(225);

    this.clock.tick(100);
    callback(255);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.done();
  },

};
