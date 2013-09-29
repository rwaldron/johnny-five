var five = require("../lib/johnny-five.js"),
    sinon = require("sinon"),
    MockFirmata = require("./mock-firmata"),
    Led = five.Led;

function newBoard() {
  return new five.Board({
    firmata: new MockFirmata(),
    repl: false
  });
}

exports["Led - Digital"] = {
  setUp: function( done ) {
    this.board = newBoard();
    this.spy = sinon.spy( this.board.firmata, "digitalWrite" );

    this.led = new Led({ pin: 13, board: this.board });

    this.proto = [
      { name: "on" },
      { name: "off" },
      { name: "toggle" },
      { name: "brightness" },
      { name: "pulse" },
      { name: "fade" },
      { name: "fadeIn" },
      { name: "fadeOut" },
      { name: "strobe" },
      { name: "blink" },
      { name: "stop" }
    ];

    this.instance = [
      { name: "id" },
      { name: "pin" },
      { name: "value" },
      { name: "interval" }
    ];

    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.led[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.led[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  on: function( test ) {
    test.expect(1);

    this.led.on();
    test.ok(this.spy.calledWith(13, 1));

    test.done();
  },

  off: function( test ) {
    test.expect(1);

    this.led.off();
    test.ok(this.spy.calledWith(13, 0));

    test.done();
  },

  toggle: function( test ) {
    test.expect(2);

    this.led.off();
    this.led.toggle();

    test.ok(this.spy.calledWith(13, 1));

    this.led.toggle();
    test.ok(this.spy.calledWith(13, 0));

    test.done();
  },

  strobe: function( test ) {
    var clock = sinon.useFakeTimers();

    test.expect(3);

    this.led.off();
    this.led.strobe(100);

    clock.tick(100);
    test.ok(this.spy.calledWith(13, 1));
    clock.tick(100);
    test.ok(this.spy.calledWith(13, 0));
    this.led.stop();
    clock.tick(100);
    test.equal(this.spy.callCount, 3);
    clock.restore();
    test.done();
  },

  blink: function( test ) {
    test.expect(1);
    test.equal( this.led.blink, this.led.strobe );
    test.done();
  }
};


exports["Led - PWM (Analog)"] = {
  setUp: function( done ) {
    this.board = newBoard();
    this.spy = sinon.spy(this.board.firmata, "analogWrite");

    this.led = new Led({ pin: 11, board: this.board });

    this.proto = [
      { name: "on" },
      { name: "off" },
      { name: "toggle" },
      { name: "brightness" },
      { name: "pulse" },
      { name: "fade" },
      { name: "fadeIn" },
      { name: "fadeOut" },
      { name: "strobe" },
      { name: "blink" },
      { name: "stop" }
    ];

    this.instance = [
      { name: "id" },
      { name: "pin" },
      { name: "value" },
      { name: "interval" }
    ];

    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.led[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.led[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  on: function( test ) {
    test.expect(1);

    this.led.on();
    test.ok( this.spy.calledWith(11, 255) );

    test.done();
  },

  off: function( test ) {
    test.expect(1);

    this.led.off();
    test.ok( this.spy.calledWith(11, 0) );

    test.done();
  },

  toggle: function( test ) {
    test.expect(2);

    this.led.off();
    this.led.toggle();

    test.ok( this.spy.calledWith(11, 255) );

    this.led.toggle();
    test.ok( this.spy.calledWith(11, 0) );

    test.done();
  },

  brightness: function( test ) {
    test.expect(3);

    this.led.off();
    this.led.brightness(255);
    test.ok( this.spy.calledWith(11, 255) );

    this.led.brightness(100);
    test.ok( this.spy.calledWith(11, 100) );

    this.led.brightness(0);
    test.ok( this.spy.calledWith(11, 0) );

    test.done();
  },

  pulse: function( test ) {
    sinon.spy(global, "clearInterval");
    sinon.spy(global, "setInterval");
    test.expect(3);

    this.led.off();
    test.equal( this.led.interval, null );

    this.led.pulse();
    test.equal( setInterval.callCount, 1);

    this.led.stop();
    test.equal( clearInterval.callCount, 1);

    clearInterval.restore();
    setInterval.restore();
    test.done();
  }

};


// TODO
// exports["Led.Array"] = {


// };

exports["Led.RGB"] = {

  setUp: function( done ) {
    this.board = newBoard();

    this.ledRgb = new Led.RGB({
      pins: {
        red: 9,
        green: 10,
        blue: 11,
      },
      board: this.board
    });

    this.proto = [
      { name: "on" },
      { name: "off" },
      { name: "toggle" },
      { name: "brightness" },
      { name: "pulse" },
      { name: "fade" },
      { name: "fadeIn" },
      { name: "fadeOut" },
      { name: "strobe" },
      { name: "stop" }
    ];

    this.instance = [
      { name: "red" },
      { name: "green" },
      { name: "blue" },
    ];

    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.ledRgb[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.ledRgb[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  color: function( test ) {
    var redPin = 9, greenPin = 10, bluePin = 11;
    var spy = sinon.spy(this.board.firmata, "analogWrite");

    test.expect(9);

    this.ledRgb.color("#0000ff");
    test.ok(spy.calledWith(redPin, 0x00));
    test.ok(spy.calledWith(greenPin, 0x00));
    test.ok(spy.calledWith(bluePin, 0xff));

    this.ledRgb.color("#ffff00");
    test.ok(spy.calledWith(redPin, 0xff));
    test.ok(spy.calledWith(greenPin, 0xff));
    test.ok(spy.calledWith(bluePin, 0x00));

    this.ledRgb.color("#bbccaa");
    test.ok(spy.calledWith(redPin, 0xbb));
    test.ok(spy.calledWith(greenPin, 0xcc));
    test.ok(spy.calledWith(bluePin, 0xaa));

    test.done();
  }

};

exports["Led - Default Pin"] = {
  shape: function( test ) {
    test.expect(2);
    test.equal(new Led().pin, 9);
    test.equal(new Led(0).pin, 0);
    test.done();
  }
};

exports["Led - Pulse"] = {
  setUp: function( done ) {
    this.clock = sinon.useFakeTimers();

    this.board = newBoard();
    this.spy = sinon.spy(this.board.firmata, "analogWrite");

    this.led = new Led({ pin: 11, board: this.board });

    done();
  },

  tearDown: function ( done ) {
    this.clock.restore();

    done();
  },

  pulse: function( test ) {
    test.expect(1);

    // pulse length 1s
    this.led.pulse(1000);

    // move the clock forwards 1001 ms so we have a complete set of values
    this.clock.tick(1001);

    // stop pulsing
    this.led.stop();

    // make sure NaN was not passed to firmata
    test.ok( ! isNaN( this.spy.firstCall.args[1] ) );

    test.done();
  }
};
