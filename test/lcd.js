var SerialPort = require("./mock-serial").SerialPort,
    pins = require("./mock-pins"),
    five = require("../lib/johnny-five.js"),
    Board = five.Board,
    LCD = five.LCD,
    sinon = require("sinon"),
    util = require("util");

function createNewBoard() {
  var serial = new SerialPort("/path/to/fake/usb"),
      board = new five.Board({
        repl: false,
        debug: true,
        mock: serial
      });

  board.firmata.pins = pins.UNO;
  board.firmata.analogPins = [ 14, 15, 16, 17, 18, 19 ];
  board.pins = Board.Pins( board );
  return board;
}

// END

exports["LCD"] = {
  setUp: function( done ) {
    this.board = createNewBoard();
    this.spy = sinon.spy( this.board.firmata, "digitalWrite" );

    this.lcd = new LCD({ pins: [7, 8, 9, 10, 11, 12], board: this.board });

    this.proto = [
      { name: "autoscroll" },
      { name: "blink" },
      { name: "clear" },
      { name: "command" },
      { name: "createChar" },
      { name: "cursor" },
      { name: "display" },
      { name: "home" },
      { name: "noAutoscroll" },
      { name: "noBlink" },
      { name: "noCursor" },
      { name: "noDisplay" },
      { name: "print" },
      { name: "pulse" },
      { name: "setCursor" },
      { name: "useChar" },
      { name: "write" },
      { name: "writeBits" }
    ];

    this.instance = [
      { name: "bitMode" },
      { name: "cols" },
      { name: "dots" },
      { name: "id" },
      { name: "lines" },
      { name: "pins" },
      { name: "rows" }
    ];

    done();
  },

  shape: function( test ) {
    test.expect( this.proto.length + this.instance.length );

    this.proto.forEach(function( method ) {
      test.equal( typeof this.lcd[ method.name ], "function" );
    }, this);

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.lcd[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  writeBits: function(test) {
    test.expect(4);

    this.lcd.writeBits(10);
    test.ok(this.spy.calledWith(12, 1));
    test.ok(this.spy.calledWith(11, 0));
    test.ok(this.spy.calledWith(10, 1));
    test.ok(this.spy.calledWith(9, 0));

    test.done();
  },

  command: function(test) {
    test.expect(10);

    var wbStub = sinon.stub(this.lcd, "writeBits");

    this.lcd.command(15);
    test.ok(wbStub.calledTwice);
    test.ok(wbStub.calledWith(0));
    test.ok(wbStub.calledWith(15));

    wbStub.reset();
    this.lcd.command(32);
    test.ok(wbStub.calledTwice);
    test.ok(wbStub.firstCall.calledWith(2));
    test.ok(wbStub.secondCall.calledWith(32));

    this.lcd.bitMode = 8;

    wbStub.reset();
    this.lcd.command(15);
    test.ok(wbStub.calledOnce);
    test.ok(wbStub.calledWith(15));

    wbStub.reset();
    this.lcd.command(32);
    test.ok(wbStub.calledOnce);
    test.ok(wbStub.calledWith(32));

    test.done();
  },

  write: function(test) {
    test.expect(3);

    var cSpy = sinon.spy(this.lcd, "command");
    var hiloSpy = sinon.spy(LCD, "hilo");

    this.lcd.write(42);
    test.ok(hiloSpy.calledOn(this.lcd));
    test.ok(cSpy.calledOnce);
    test.ok(cSpy.calledWith(42));

    hiloSpy.restore();

    test.done();
  },

  cursor: function(test) {
    test.expect(6);

    var scSpy = sinon.stub(this.lcd, "setCursor");
    var cSpy = sinon.stub(this.lcd, "command");

    this.lcd.cursor();
    test.ok(!scSpy.called);
    test.ok(cSpy.calledOnce);
    test.ok(cSpy.firstCall.args[0] & LCD.CURSORON, "command not called with LCD.CURSORON bit high");

    cSpy.reset();
    this.lcd.cursor(1, 1);
    test.ok(scSpy.calledOnce);
    test.ok(scSpy.calledWith(1, 1));
    test.ok(!cSpy.called);

    test.done();
  },

  noCursor: function(test) {
    test.expect(2);

    var cSpy = sinon.stub(this.lcd, "command");

    this.lcd.noCursor();
    test.ok(cSpy.calledOnce);
    test.ok(0 === (cSpy.firstCall.args[0] & LCD.CURSORON), "command not called with LCD.CURSORON bit low");

    test.done();
  },

  createChar: function(test) {
    test.expect(143);

    // Numbers capped to 7, direct addresses, proper commands
    var cSpy = sinon.spy(this.lcd, "command");
    var charMap = [0, 1, 2, 3, 4, 5, 6, 7];

    for (var num = 0; num <= 8; ++num) {
      cSpy.reset();
      test.strictEqual(this.lcd.createChar(num, charMap), num & 7, "Incorrect returned address");

      test.strictEqual(cSpy.callCount, 9, "Improper command call count");
      test.ok(cSpy.firstCall.calledWith(LCD.SETCGRAMADDR | ((num > 7 ? num & 7 : num) << 3)),
        "SETCGRAMADDR mask is incorrect");
      for (var i = 0, l = charMap.length; i < l; ++i) {
        test.ok(cSpy.getCall(i + 1).calledWith(charMap[i]), "CharMap call #" + (i + 1) + " incorrect");
      }
    }

    // Named-based: rotating addresses (from LCD.MEMORYLIMIT -1 down), ignores existing name
    ["foo", "bar", "baz", "bar"].forEach(function(name, index) {
      cSpy.reset();
      var addr = LCD.MEMORYLIMIT - (1 + index % LCD.MEMORYLIMIT);
      test.strictEqual(this.lcd.createChar(name, charMap), addr, "Incorrect returned address");

      test.strictEqual(cSpy.callCount, 9, "Improper command call count");
      test.ok(cSpy.firstCall.calledWith(LCD.SETCGRAMADDR | (addr << 3)),
        "SETCGRAMADDR mask is incorrect");
      for (var i = 0, l = charMap.length; i < l; ++i) {
        test.ok(cSpy.getCall(i + 1).calledWith(charMap[i]), "CharMap call #" + (i + 1) + " incorrect");
      }
    }, this);

    test.done();
  },

  useChar: function(test) {
    test.expect(2);

    var ccSpy = sinon.spy(this.lcd, "createChar");

    this.lcd.useChar("heart");
    test.ok(ccSpy.calledWith("heart"));

    ccSpy.reset();
    this.lcd.useChar("heart");
    test.strictEqual(ccSpy.callCount, 0, "createChar should not have been called on an existing name");

    test.done();
  },

  printRegularTexts: function(test) {
    // No test.expect() as these are a bit cumbersome/coupled to obtain

    var sentences = ["hello world", "", "   ", " hello ", " hello  "];
    var cSpy = sinon.spy(this.lcd, "command");

    sentences.forEach(function(text) {
      var comparison = text;
      cSpy.reset();

      this.lcd.print(text);

      test.strictEqual(cSpy.callCount, comparison.length, "Unexpected amount of #command calls");
      for (var i = 0, l = comparison.length; i < l; ++i) {
        test.strictEqual(cSpy.getCall(i).args[0], comparison.charCodeAt(i),
          "Unexpected byte #" + i + " on " + util.inspect(text) + " (comparing with " +
          util.inspect(comparison) + ")");
      }
    }, this);
    test.done();
  },

  printSpecialTexts: function(test) {
    // No test.expect() as these are a bit cumbersome/coupled to obtain

    // These assume LCD.MEMORYLIMIT is 8, for readability
    var sentences = [
      [":heart:",         "\07"],

      [":heart: JS",      "\07 JS"],
      [":heart:JS",       "\07JS"],
      ["JS :heart:",      "JS \07"],
      ["JS:heart:",       "JS\07"],
      ["I  :heart:  JS",  "I  \07  JS"],
      ["I:heart:JS",      "I\07JS"],

      ["I :heart: JS :smile:",                 "I \07 JS \06"],
      ["I:heart:JS :smile:",                   "I\07JS \06"],
      ["I :heart::heart::heart: JS :smile: !", "I \07\07\07 JS \06 !"],

      ["I :heart: :unknown: symbols",          "I \07 :unknown: symbols"]
    ];

    sentences.forEach(function(pair) {
      var text = pair[0], comparison = pair[1];

      (text.match(/:\w+?:/g) || []).forEach(function(match) {
        if (":unknown:" !== match) {
          this.lcd.useChar(match.slice(1, -1));
        }
      }, this);
      var cSpy = sinon.spy(this.lcd, "command");
      this.lcd.print(text);

      test.strictEqual(cSpy.callCount, comparison.length,
        "Unexpected amount of #command calls for " + util.inspect(text));
      var i, output = "";
      for (i = 0; i < cSpy.callCount; ++i) {
        output += String.fromCharCode(cSpy.getCall(i).args[0]);
      }
      for (i = 0; i < cSpy.callCount; ++i) {
        test.strictEqual(cSpy.getCall(i).args[0], comparison.charCodeAt(i),
          "Unexpected byte #" + i + " on " + util.inspect(text) +
          " (comparing " + util.inspect(output) + " with " +
          util.inspect(comparison) + ")");
      }
      cSpy.restore();
    }, this);

    test.done();
  }

  // TODO: Remaining tests: clear, home, display/noDisplay, blink/noBlink, setCursor, pulse, autoscroll/noAutoscroll
};
