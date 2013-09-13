var five = require("../lib/johnny-five.js"),
    events = require("events"),
    Board = five.Board,
    Pin = five.Pin,
    MockFirmata = require("./mock-firmata"),
    sinon = require("sinon");

exports["Pin"] = {
  setUp: function ( done ) {
    var board = new five.Board({
          repl: false,
          firmata: new MockFirmata()
        });
    this.digital = new Pin({ pin: 11, board: board });
    this.analog = new Pin({ pin: "A1", board: board });

    this.spies = ["digitalWrite", "analogWrite", "analogRead", "digitalRead"];
    this.spies.forEach(function (value) {
      this[value] = sinon.spy( board.firmata, value );
    }.bind(this));

    this.proto = [
      { name: "query" },
      { name: "high" },
      { name: "low" },
      { name: "read" },
      { name: "write" },
      { name: "mode" }
    ];

    this.instance = [
      { name: "id" },
      { name: "pin" },
      { name: "type" },
      { name: "addr" },
      { name: "value" }
    ];

    done();
  },

  tearDown: function( done ) {
    this.spies.forEach(function (value) {
      this[value].restore();
    }.bind(this));
    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.digital[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.digital[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  emitter: function( test ) {
    test.expect( 1 );

    test.ok( this.digital instanceof events.EventEmitter );

    test.done();
  },


  digital: function( test ) {
    test.expect(1);

    test.equal( this.digital.type, "digital" );

    test.done();
  },

  analog: function( test ) {
    test.expect(1);

    test.equal( this.analog.type, "analog" );

    test.done();
  },

  high: function( test ) {
    test.expect(2);

    this.digital.high();
    test.ok(this.digitalWrite.calledWith(11, 1));

    this.analog.high();
    test.ok(this.analogWrite.calledWith(1, 255));

    test.done();
  },

  low: function( test ) {
    test.expect(2);

    this.digital.low();
    test.ok(this.digitalWrite.calledWith(11, 0));

    this.analog.low();
    test.ok(this.analogWrite.calledWith(1, 0));

    test.done();
  },

  write: function( test ) {
    test.expect(4);

    this.digital.write(1);
    test.ok(this.digitalWrite.calledWith(11, 1));

    this.digital.write(0);
    test.ok(this.digitalWrite.calledWith(11, 0));


    this.analog.write(1023);
    test.ok(this.analogWrite.calledWith(1, 1023));

    this.analog.write(0);
    test.ok(this.analogWrite.calledWith(1, 0));

    test.done();
  },

  // Read Digital/Analog are adapted from Firmata tests.
  //
  readDigital: function( test ) {
    test.expect(1);
    this.digital.read(function () {});
    test.ok(this.digitalRead.calledWith(this.digital.addr));
    test.done();
  },

  readAnalog: function( test ) {
    test.expect(1);
    var spy = sinon.spy();
    this.analog.read(function () {});
    test.ok(this.analogRead.calledWith(this.analog.addr));
    test.done();
  }
};


exports["Pin.isPrefixed"] = {
  is: function( test ) {
    test.expect(2);

    test.ok( Pin.isPrefixed("A0", [ "A", "I" ]) );
    test.ok( Pin.isPrefixed("I0", [ "A", "I" ]) );

    test.done();
  },
  not: function( test ) {
    test.expect(2);

    test.ok( !Pin.isPrefixed(9, [ "A", "I" ]) );
    test.ok( !Pin.isPrefixed("O0", [ "A", "I" ]) );

    test.done();
  }
};

exports["Pin.isAnalog"] = {
  is: function( test ) {
    test.expect(6);

    test.ok( Pin.isAnalog("A0") );
    test.ok( Pin.isAnalog("I0") );

    test.ok( Pin.isAnalog({ pin: "A0" }) );
    test.ok( Pin.isAnalog({ pin: "I0" }) );

    test.ok( Pin.isAnalog({ addr: "A0" }) );
    test.ok( Pin.isAnalog({ addr: "I0" }) );


    test.done();
  },
  not: function( test ) {
    test.expect(2);

    test.ok( !Pin.isAnalog(9) );
    test.ok( !Pin.isAnalog("O0") );

    test.done();
  }
};


// * Pin.INPUT   = 0x00
// * Pin.OUTPUT  = 0x01
// * Pin.ANALOG  = 0x02
// * Pin.PWM     = 0x03
// * Pin.SERVO   = 0x04
