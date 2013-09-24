var MockFirmata = require("./mock-firmata"),
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    Board = five.Board,
    sinon = require("sinon"),
    Switch = five.Switch,
    board = new five.Board({
      repl: false,
      firmata: new MockFirmata()
    });

exports["Switch"] = {
  setUp: function( done ) {
    
    this.digitalRead = sinon.spy(board.firmata, "digitalRead");
    this.switch = new Switch({ pin: 8, freq: 5, board: board });

    this.proto = [];

    this.instance = [
      { name: "isClosed" }
    ];

    done();
  },

  tearDown: function( done ) {
    this.digitalRead.restore();
 
    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.switch[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.switch[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  closed: function( test ) {
    
    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.switch.on("closed",function(){

      test.ok(true);
      test.done();
    });
    
    callback(1);
  },

  open: function( test ) {
    
    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.switch.on("open",function(){

      test.ok(true);
      test.done();
    });
    callback(1);
    callback(null);
  }

};
