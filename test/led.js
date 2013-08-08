var SerialPort = require("./mock-serial").SerialPort,
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    serial = new SerialPort("/path/to/fake/usb"),
    Board = five.Board,
    Led = five.Led,
    board = new five.Board({
      repl: false,
      debug: true,
      mock: serial
    }),
    sinon = require("sinon");

board.firmata.pins = pins.UNO;
board.firmata.analogPins = [ 14, 15, 16, 17, 18, 19 ];
board.pins = Board.Pins( board );


// END

exports["Led - Digital"] = {
  setUp: function( done ) {

    this.led = new Led({ pin: 13, board: board });

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
    test.deepEqual( serial.lastWrite, [ 145, 96, 1 ] );

    test.done();
  },

  off: function( test ) {
    test.expect(2);

    this.led.off();
    test.deepEqual( serial.lastWrite, [ 145, 64, 1 ] );

    this.led.on();
    test.deepEqual( serial.lastWrite, [ 145, 96, 1 ] );

    test.done();
  },

  toggle: function( test ) {
    test.expect(2);

    this.led.off();
    this.led.toggle();

    test.deepEqual( serial.lastWrite, [ 145, 96, 1 ] );

    this.led.toggle();
    test.deepEqual( serial.lastWrite, [ 145, 64, 1 ] );

    test.done();
  },

  strobe: function( test ) {
    var captured = [];
    var startAt = Date.now();

    test.expect(1);

    this.led.off();
    this.led.strobe(100);

    var interval = setInterval(function() {

      captured.push( serial.lastWrite.slice() );

      if ( Date.now() > startAt + 500 ) {
        clearInterval( interval );

        test.deepEqual( captured, [
          [ 145, 96, 1 ],
          [ 145, 64, 1 ],
          [ 145, 96, 1 ],
          [ 145, 64, 1 ],
          [ 145, 96, 1 ]
        ]);

        test.done();
      }
    }, 100);
  },

  blink: function( test ) {
    test.expect(1);
    test.equal( this.led.blink, this.led.strobe );
    test.done();
  }
};


exports["Led - PWM (Analog)"] = {
  setUp: function( done ) {

    this.led = new Led({ pin: 11, board: board });

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
    test.deepEqual( serial.lastWrite, [ 235, 127, 1 ] );

    test.done();
  },

  off: function( test ) {
    test.expect(2);

    this.led.off();
    test.deepEqual( serial.lastWrite, [ 235, 0, 0 ] );

    this.led.on();
    test.deepEqual( serial.lastWrite, [ 235, 127, 1 ] );

    test.done();
  },

  toggle: function( test ) {
    test.expect(2);

    this.led.off();
    this.led.toggle();

    test.deepEqual( serial.lastWrite, [ 235, 127, 1 ] );

    this.led.toggle();
    test.deepEqual( serial.lastWrite, [ 235, 0, 0 ] );

    test.done();
  },

  brightness: function( test ) {
    test.expect(3);

    this.led.off();
    this.led.brightness(255);

    test.deepEqual( serial.lastWrite, [ 235, 127, 1 ] );

    this.led.brightness(100);
    test.deepEqual( serial.lastWrite, [ 235, 100, 0 ] );

    this.led.brightness(0);
    test.deepEqual( serial.lastWrite, [ 235, 0, 0 ] );

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
  },

  strobe: function( test ) {
    var captured = [];
    var startAt = Date.now();

    test.expect(1);

    this.led.off();
    this.led.strobe(100);

    var interval = setInterval(function() {

      captured.push( serial.lastWrite.slice() );

      if ( Date.now() > startAt + 500 ) {
        clearInterval( interval );

        // NOTE: Strobe will always switch to digital!!
        test.deepEqual( captured, [
          [ 145, 72, 1 ],
          [ 145, 96, 1 ],
          [ 145, 72, 1 ],
          [ 145, 96, 1 ],
          [ 145, 72, 1 ]
        ]);

        test.done();
      }
    }, 100);
  }
};


// TODO
// exports["Led.Array"] = {


// };

// exports["Led.RGB"] = {


// };
