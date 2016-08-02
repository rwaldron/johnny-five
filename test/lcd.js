require("./common/bootstrap");

var lcdChars = require("../lib/lcd-chars.js");
var util = require("util");

exports["LCD.Characters"] = {
  exists: function(test) {
    test.expect(1);
    test.deepEqual(LCD.Characters, lcdChars);
    test.done();
  },
};

exports["LCD"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");

    this.lcd = new LCD({
      pins: [7, 8, 9, 10, 11, 12],
      board: this.board
    });

    this.proto = [{
      name: "autoscroll"
    }, {
      name: "blink"
    }, {
      name: "clear"
    }, {
      name: "command"
    }, {
      name: "createChar"
    }, {
      name: "cursor"
    }, {
      name: "hilo"
    }, {
      name: "home"
    }, {
      name: "noAutoscroll"
    }, {
      name: "noBlink"
    }, {
      name: "noCursor"
    }, {
      name: "on"
    }, {
      name: "off"
    }, {
      name: "print"
    }, {
      name: "setCursor"
    }, {
      name: "useChar"
    }, {
      name: "write"
    }, {
      name: "send"
    }];

    this.instance = [{
      name: "bitMode"
    }, {
      name: "cols"
    }, {
      name: "dots"
    }, {
      name: "id"
    }, {
      name: "lines"
    }, {
      name: "pins"
    }, {
      name: "rows"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.lcd[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.lcd[property.name], "undefined");
    }, this);

    test.done();
  },

  send: function(test) {
    test.expect(4);

    this.digitalWrite.reset();
    this.lcd.send(10);

    test.deepEqual(this.digitalWrite.args[0], [12, 1]);
    test.deepEqual(this.digitalWrite.args[1], [11, 0]);
    test.deepEqual(this.digitalWrite.args[2], [10, 1]);
    test.deepEqual(this.digitalWrite.args[3], [9, 0]);

    test.done();
  },

  command: function(test) {
    test.expect(10);

    var wbStub = this.sandbox.stub(this.lcd, "send");

    this.lcd.command(15);
    test.ok(wbStub.calledTwice);

    test.deepEqual(wbStub.args[0], [0]);
    test.deepEqual(wbStub.args[1], [15]);

    wbStub.reset();
    this.lcd.command(32);
    test.ok(wbStub.calledTwice);
    test.deepEqual(wbStub.args[0], [2]);
    test.deepEqual(wbStub.args[1], [32]);

    this.lcd.bitMode = 8;

    wbStub.reset();
    this.lcd.command(15);
    test.ok(wbStub.calledOnce);
    test.deepEqual(wbStub.args[0], [15]);

    wbStub.reset();
    this.lcd.command(32);
    test.ok(wbStub.calledOnce);
    test.deepEqual(wbStub.args[0], [32]);

    test.done();
  },

  write: function(test) {
    test.expect(3);

    var cSpy = this.sandbox.spy(this.lcd, "command");
    var hiloSpy = this.sandbox.spy(this.lcd, "hilo");

    this.lcd.write(42);
    test.ok(hiloSpy.calledOn(this.lcd));
    test.ok(cSpy.calledOnce);
    test.deepEqual(cSpy.args[0], [0x40, 42]);

    hiloSpy.restore();

    test.done();
  },

  cursor: function(test) {
    test.expect(6);

    var scSpy = this.sandbox.stub(this.lcd, "setCursor");
    var cSpy = this.sandbox.stub(this.lcd, "command");

    this.lcd.cursor();
    test.ok(!scSpy.called);
    test.ok(cSpy.calledOnce);
    test.ok(cSpy.firstCall.args[0] & this.lcd.REGISTER.CURSORON, "command not called with this.lcd.REGISTER.CURSORON bit high");

    cSpy.reset();
    this.lcd.cursor(1, 1);
    test.ok(scSpy.calledOnce);
    test.deepEqual(scSpy.args[0], [1, 1]);
    test.ok(!cSpy.called);

    test.done();
  },

  noCursor: function(test) {
    test.expect(2);

    var cSpy = this.sandbox.stub(this.lcd, "command");

    this.lcd.noCursor();
    test.ok(cSpy.calledOnce);
    test.ok(0 === (cSpy.firstCall.args[0] & this.lcd.REGISTER.CURSORON), "command not called with this.lcd.REGISTER.CURSORON bit low");

    test.done();
  },

  createChar: function(test) {
    test.expect(143);

    // Numbers capped to 7, direct addresses, proper commands
    var cSpy = this.sandbox.spy(this.lcd, "command");
    var charMap = [0, 1, 2, 3, 4, 5, 6, 7];

    for (var num = 0; num <= 8; ++num) {
      cSpy.reset();
      test.strictEqual(this.lcd.createChar(num, charMap), num & 7, "Incorrect returned address");

      test.strictEqual(cSpy.callCount, 9, "Improper command call count");
      test.ok(cSpy.firstCall.calledWith(this.lcd.REGISTER.DATA | ((num > 7 ? num & 7 : num) << 3)),
        "DATA mask is incorrect");
      for (var i = 0, l = charMap.length; i < l; ++i) {
        test.ok(cSpy.getCall(i + 1).calledWith(0x40, charMap[i]), "CharMap call #" + (i + 1) + " incorrect");
      }
    }

    // Named-based: rotating addresses (from this.lcd.REGISTER.MEMORYLIMIT -1 down), ignores existing name
    ["foo", "bar", "baz", "bar"].forEach(function(name, index) {
      cSpy.reset();
      var addr = this.lcd.REGISTER.MEMORYLIMIT - (1 + index % this.lcd.REGISTER.MEMORYLIMIT);
      test.strictEqual(this.lcd.createChar(name, charMap), addr, "Incorrect returned address");

      test.strictEqual(cSpy.callCount, 9, "Improper command call count");
      test.ok(cSpy.firstCall.calledWith(this.lcd.REGISTER.DATA | (addr << 3)),
        "DATA mask is incorrect");
      for (var i = 0, l = charMap.length; i < l; ++i) {
        test.ok(cSpy.getCall(i + 1).calledWith(0x40, charMap[i]), "CharMap call #" + (i + 1) + " incorrect");
      }
    }, this);

    test.done();
  },

  useChar: function(test) {
    test.expect(3);

    var ccSpy = this.sandbox.spy(this.lcd, "createChar");

    this.lcd.useChar("heart");
    test.ok(ccSpy.firstCall.calledWith("heart"));

    ccSpy.reset();
    this.lcd.useChar("heart");
    test.strictEqual(ccSpy.callCount, 0, "createChar should not have been called on an existing name");

    test.equal(this.lcd, this.lcd.useChar("heart"));
    test.done();
  },

  printRegularTexts: function(test) {
    // No test.expect() as these are a bit cumbersome/coupled to obtain

    var sentences = ["hello world", "", "   ", " hello ", " hello  "];
    var cSpy = this.sandbox.spy(this.lcd, "command");

    sentences.forEach(function(text) {
      var comparison = text;
      cSpy.reset();

      this.lcd.print(text);

      test.strictEqual(cSpy.callCount, comparison.length, "Unexpected amount of #command calls");
      for (var i = 0, l = comparison.length; i < l; ++i) {
        test.strictEqual(cSpy.getCall(i).args[1], comparison.charCodeAt(i),
          "Unexpected byte #" + i + " on " + util.inspect(text) + " (comparing with " +
          util.inspect(comparison) + ")");
      }
    }, this);
    test.done();
  },

  printSpecialTexts: function(test) {
    // No test.expect() as these are a bit cumbersome/coupled to obtain

    // These assume this.lcd.REGISTER.MEMORYLIMIT is 8, for readability
    var sentences = [
      [":heart:", "\07"],

      [":heart: JS", "\07 JS"],
      [":heart:JS", "\07JS"],
      ["JS :heart:", "JS \07"],
      ["JS:heart:", "JS\07"],
      ["I  :heart:  JS", "I  \07  JS"],
      ["I:heart:JS", "I\07JS"],

      ["I :heart: JS :smile:", "I \07 JS \06"],
      ["I:heart:JS :smile:", "I\07JS \06"],
      ["I :heart::heart::heart: JS :smile: !", "I \07\07\07 JS \06 !"],

      ["I :heart: :unknown: symbols", "I \07 :unknown: symbols"]
    ];

    sentences.forEach(function(pair) {
      var text = pair[0],
        comparison = pair[1];

      (text.match(/:\w+?:/g) || []).forEach(function(match) {
        if (":unknown:" !== match) {
          this.lcd.useChar(match.slice(1, -1));
        }
      }, this);
      var cSpy = this.sandbox.spy(this.lcd, "command");
      this.lcd.print(text);

      test.strictEqual(cSpy.callCount, comparison.length,
        "Unexpected amount of #command calls for " + util.inspect(text));
      var i, output = "";
      for (i = 0; i < cSpy.callCount; ++i) {
        output += String.fromCharCode(cSpy.getCall(i).args[1]);
      }
      for (i = 0; i < cSpy.callCount; ++i) {
        test.strictEqual(cSpy.getCall(i).args[1], comparison.charCodeAt(i),
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

exports["LCD - I2C (JHD1313M1)"] = {
  // TODO: Move all stubs and spies into setup
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new LCD({
      controller: "JHD1313M1",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    // This controller will actually forward 2 addresses
    // as an object of addresses.
    test.deepEqual(forwarded.address, { lcd: 0xff, rgb: 0x62 });
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },


  initialization: function(test) {
    test.expect(1);
    // TODO:
    // This needs to more thoroughly test
    // the expected initialization for the
    // specified device.
    //

    new LCD({
      controller: "JHD1313M1",
      board: this.board
    });

    test.equal(this.i2cWrite.callCount, 14);
    test.done();
  },

  command: function(test) {
    test.expect(2);

    var lcd = new LCD({
      controller: "JHD1313M1",
      board: this.board
    });

    lcd.command(15);
    test.equal(this.i2cWrite.called, 1);
    test.deepEqual(this.i2cWrite.lastCall.args, [62, [128, 15]]);

    test.done();
  },

  send: function(test) {
    test.expect(2);

    var lcd = new LCD({
      controller: "JHD1313M1",
      board: this.board
    });

    lcd.send(15);
    test.equal(this.i2cWrite.called, 1);
    test.deepEqual(this.i2cWrite.lastCall.args, [62, [64, 15]]);

    test.done();
  },

  bgColor: function(test) {
    test.expect(8);

    var lcd = new LCD({
      controller: "JHD1313M1",
      board: this.board
    });

    this.hexRgb = this.sandbox.spy(converter.hex, "rgb");
    this.keyRgb = this.sandbox.spy(converter.keyword, "rgb");

    lcd.bgColor([0, 0, 0]);

    test.equal(this.keyRgb.callCount, 0);
    test.equal(this.hexRgb.callCount, 0);

    lcd.bgColor("blue");

    test.equal(this.keyRgb.callCount, 1);
    test.equal(this.hexRgb.callCount, 0);


    lcd.bgColor("ff0000");

    test.equal(this.keyRgb.callCount, 2);
    test.equal(this.hexRgb.callCount, 1);

    lcd.bgColor("#ff0000");

    test.equal(this.keyRgb.callCount, 3);
    test.equal(this.hexRgb.callCount, 2);


    test.done();
  },
};

exports["LCD - I2C (LCD2004)"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new LCD({
      controller: "LCD2004",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  initialization: function(test) {
    test.expect(1);
    // TODO:
    // This needs to more thoroughly test
    // the expected initialization for the
    // specified device.
    //
    new LCD({
      controller: "LCD2004",
      board: this.board
    });

    test.equal(this.i2cWrite.callCount, 30);
    test.done();
  },

  command: function(test) {
    test.expect(7);

    var lcd = new LCD({
      controller: "LCD2004",
      board: this.board
    });


    var send = this.sandbox.spy(lcd, "send");
    var writeBits = this.sandbox.spy(lcd, "writeBits");
    var pulse = this.sandbox.spy(lcd, "pulse");

    // Prevent inclusion of initialization-related writes.
    this.i2cWrite.reset();

    lcd.command(15);

    test.equal(send.callCount, 1);
    test.deepEqual(send.getCall(0).args, [0, 15]);

    test.equal(writeBits.callCount, 2);

    test.ok(pulse.called);
    test.equal(pulse.callCount, 2);

    test.equal(this.i2cWrite.callCount, 4);
    test.deepEqual(this.i2cWrite.args, [
      [39, 12],
      [39, 8],
      [39, 252],
      [39, 248]
    ]);

    test.done();
  },

  send: function(test) {
    test.expect(6);

    var lcd = new LCD({
      controller: "LCD2004",
      board: this.board
    });

    var send = this.sandbox.spy(lcd, "send");
    var writeBits = this.sandbox.spy(lcd, "writeBits");
    var pulse = this.sandbox.spy(lcd, "pulse");

    // Prevent inclusion of initialization-related writes.
    this.i2cWrite.reset();

    lcd.send(0, 15);

    test.equal(send.callCount, 1);
    test.deepEqual(send.getCall(0).args, [0, 15]);

    test.equal(writeBits.callCount, 2);

    test.equal(pulse.callCount, 2);

    test.equal(this.i2cWrite.callCount, 4);
    test.deepEqual(this.i2cWrite.args, [
      [39, 12],
      [39, 8],
      [39, 252],
      [39, 248]
    ]);

    test.done();
  }
};

exports["LCD - I2C (LCM1602)"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new LCD({
      controller: "LCM1602",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  initialization: function(test) {
    test.expect(1);
    // TODO:
    // This needs to more thoroughly test
    // the expected initialization for the
    // specified device.
    //
    new LCD({
      controller: "LCM1602",
      board: this.board
    });

    test.equal(this.i2cWrite.callCount, 30);
    test.done();
  },

  command: function(test) {
    test.expect(6);

    var lcd = new LCD({
      controller: "LCM1602",
      board: this.board
    });

    var send = this.sandbox.spy(lcd, "send");
    var writeBits = this.sandbox.spy(lcd, "writeBits");
    var pulse = this.sandbox.spy(lcd, "pulse");

    // Prevent inclusion of initialization-related writes.
    this.i2cWrite.reset();

    lcd.command(15);

    test.equal(send.callCount, 1);
    test.deepEqual(send.getCall(0).args, [0, 15]);

    test.equal(writeBits.callCount, 2);

    test.equal(pulse.callCount, 2);

    test.equal(this.i2cWrite.callCount, 4);
    test.deepEqual(this.i2cWrite.args, [
      [39, 12],
      [39, 8],
      [39, 252],
      [39, 248]
    ]);

    test.done();
  },

  send: function(test) {
    test.expect(6);

    var lcd = new LCD({
      controller: "LCM1602",
      board: this.board
    });

    var send = this.sandbox.spy(lcd, "send");
    var writeBits = this.sandbox.spy(lcd, "writeBits");
    var pulse = this.sandbox.spy(lcd, "pulse");

    // Prevent inclusion of initialization-related writes.
    this.i2cWrite.reset();

    lcd.send(0, 15);

    test.equal(send.callCount, 1);
    test.deepEqual(send.getCall(0).args, [0, 15]);

    test.equal(writeBits.callCount, 2);

    test.equal(pulse.callCount, 2);

    test.equal(this.i2cWrite.callCount, 4);
    test.deepEqual(this.i2cWrite.args, [
      [39, 12],
      [39, 8],
      [39, 252],
      [39, 248]
    ]);

    test.done();
  }
};


exports["LCD - PCF8574"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new LCD({
      controller: "PCF8574",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  initialization: function(test) {
    test.expect(2);
    // TODO:
    // This needs to more thoroughly test
    // the expected initialization for the
    // specified device.
    //
    new LCD({
      controller: "PCF8574",
      board: this.board
    });

    test.equal(this.i2cWrite.callCount, 30);

    // This is the expected write sequence.
    // If this changes, the controller will not function.
    var sequence = [
      [39, 0],
      [39, 48],
      [39, 52],
      [39, 48],
      [39, 48],
      [39, 52],
      [39, 48],
      [39, 48],
      [39, 52],
      [39, 48],
      [39, 32],
      [39, 36],
      [39, 32],
      [39, 36],
      [39, 32],
      [39, 132],
      [39, 128],
      [39, 4],
      [39, 0],
      [39, 196],
      [39, 192],
      [39, 4],
      [39, 0],
      [39, 20],
      [39, 16],
      [39, 4],
      [39, 0],
      [39, 100],
      [39, 96],
      [39, 8]
    ];

    test.deepEqual(this.i2cWrite.args, sequence);
    test.done();
  },

  command: function(test) {
    test.expect(6);

    var lcd = new LCD({
      controller: "PCF8574",
      board: this.board
    });

    var send = this.sandbox.spy(lcd, "send");
    var writeBits = this.sandbox.spy(lcd, "writeBits");
    var pulse = this.sandbox.spy(lcd, "pulse");

    // Prevent inclusion of initialization-related writes.
    this.i2cWrite.reset();

    lcd.command(15);

    test.equal(send.callCount, 1);
    test.deepEqual(send.getCall(0).args, [0, 15]);

    test.equal(writeBits.callCount, 2);

    test.equal(pulse.callCount, 2);

    test.equal(this.i2cWrite.callCount, 4);
    test.deepEqual(this.i2cWrite.args, [
      [39, 12],
      [39, 8],
      [39, 252],
      [39, 248]
    ]);

    test.done();
  },

  send: function(test) {
    test.expect(6);

    var lcd = new LCD({
      controller: "PCF8574",
      board: this.board
    });

    var send = this.sandbox.spy(lcd, "send");
    var writeBits = this.sandbox.spy(lcd, "writeBits");
    var pulse = this.sandbox.spy(lcd, "pulse");

    // Prevent inclusion of initialization-related writes.
    this.i2cWrite.reset();

    lcd.send(0, 15);

    test.equal(send.callCount, 1);
    test.deepEqual(send.getCall(0).args, [0, 15]);

    test.equal(writeBits.callCount, 2);

    test.equal(pulse.callCount, 2);

    test.equal(this.i2cWrite.callCount, 4);
    test.deepEqual(this.i2cWrite.args, [
      [39, 12],
      [39, 8],
      [39, 252],
      [39, 248]
    ]);

    test.done();
  }
};


exports["LCD - MJKDZ"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new LCD({
      controller: "MJKDZ",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  initialization: function(test) {
    test.expect(2);
    // TODO:
    // This needs to more thoroughly test
    // the expected initialization for the
    // specified device.
    //
    new LCD({
      controller: "MJKDZ",
      board: this.board
    });

    test.equal(this.i2cWrite.callCount, 30);

    // This is the expected write sequence.
    // If this changes, the controller will not function.
    var sequence = [
      [39, 0],
      [39, 3],
      [39, 19],
      [39, 3],
      [39, 3],
      [39, 19],
      [39, 3],
      [39, 3],
      [39, 19],
      [39, 3],
      [39, 2],
      [39, 18],
      [39, 2],
      [39, 18],
      [39, 2],
      [39, 24],
      [39, 8],
      [39, 16],
      [39, 0],
      [39, 28],
      [39, 12],
      [39, 16],
      [39, 0],
      [39, 17],
      [39, 1],
      [39, 16],
      [39, 0],
      [39, 22],
      [39, 6],
      [39, 8]
    ];

    test.deepEqual(this.i2cWrite.args, sequence);
    test.done();
  },

  command: function(test) {
    test.expect(6);

    var lcd = new LCD({
      controller: "MJKDZ",
      board: this.board
    });

    var send = this.sandbox.spy(lcd, "send");
    var writeBits = this.sandbox.spy(lcd, "writeBits");
    var pulse = this.sandbox.spy(lcd, "pulse");

    // Prevent inclusion of initialization-related writes.
    this.i2cWrite.reset();

    lcd.command(15);

    test.equal(send.callCount, 1);
    test.deepEqual(send.getCall(0).args, [0, 15]);

    test.equal(writeBits.callCount, 2);

    test.equal(pulse.callCount, 2);

    test.equal(this.i2cWrite.callCount, 4);
    test.deepEqual(this.i2cWrite.args, [
      [39, 24],
      [39, 8],
      [39, 31],
      [39, 15]
    ]);

    test.done();
  },

  send: function(test) {
    test.expect(6);

    var lcd = new LCD({
      controller: "MJKDZ",
      board: this.board
    });

    var send = this.sandbox.spy(lcd, "send");
    var writeBits = this.sandbox.spy(lcd, "writeBits");
    var pulse = this.sandbox.spy(lcd, "pulse");

    // Prevent inclusion of initialization-related writes.
    this.i2cWrite.reset();

    lcd.send(0, 15);

    test.equal(send.callCount, 1);
    test.deepEqual(send.getCall(0).args, [0, 15]);

    test.equal(writeBits.callCount, 2);

    test.equal(pulse.callCount, 2);

    test.equal(this.i2cWrite.callCount, 4);
    test.deepEqual(this.i2cWrite.args, [
      [39, 24],
      [39, 8],
      [39, 31],
      [39, 15]
    ]);

    test.done();
  }
};
