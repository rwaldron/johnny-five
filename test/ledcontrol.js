var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./util/mock-firmata"),
  Board = five.Board,
  LedControl = five.LedControl,
  LedMatrix = five.Led.Matrix;

function newBoard() {
  var io = new MockFirmata();
  var board = new Board({
    io: io,
    debug: false,
    repl: false
  });

  io.emit("connect");
  io.emit("ready");

  return board;
}

function restore(target) {
  for (var prop in target) {

    if (Array.isArray(target[prop])) {
      continue;
    }

    if (target[prop] != null && typeof target[prop].restore === "function") {
      target[prop].restore();
    }

    if (typeof target[prop] === "object") {
      restore(target[prop]);
    }
  }
}

exports["Led.Matrix => LedControl"] = {
  setUp: function(done) {
    this.board = newBoard();
    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    LedControl.reset();
    done();
  },

  wrapper: function(test) {
    test.expect(2);

    var matrix = new LedMatrix({
      pins: {
        data: 2,
        clock: 3,
        cs: 4
      },
      board: this.board
    });

    test.ok(matrix instanceof LedControl);
    test.ok(matrix.isMatrix);
    test.done();
  },

  statics: function(test) {
    var keys = Object.keys(LedControl);

    test.expect(keys.length);

    keys.forEach(function(key) {
      test.equal(LedMatrix[key], LedControl[key]);
    });

    test.done();
  }
};

exports["LedControl - I2C Matrix Initialization"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    LedControl.reset();
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new LedControl({
      controller: "HT16K33",
      address: 0x70,
      bus: "i2c-1",
      board: this.board
    });

    var forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0x70);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },


  addressSingle: function(test) {
    test.expect(1);

    var matrix = new LedControl({
      address: 0x70,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(matrix.addresses, [0x70]);

    test.done();
  },
  addressesSingle: function(test) {
    test.expect(1);

    var matrix = new LedControl({
      addresses: [0x70],
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(matrix.addresses, [0x70]);

    test.done();
  },
  addressesMultiple: function(test) {
    test.expect(1);

    var matrix = new LedControl({
      addresses: [0x70, 0x71],
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(matrix.addresses, [0x70, 0x71]);

    test.done();
  },
  addressesMultipleInferredByDeviceCount: function(test) {
    test.expect(1);

    var matrix = new LedControl({
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(matrix.addresses, [0x70, 0x71]);

    test.done();
  },

  addressesExhaustAvailability: function(test) {
    test.expect(5);

    var a = new LedControl({
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(a.addresses, [0x70, 0x71]);

    var b = new LedControl({
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(b.addresses, [0x72, 0x73]);

    var c = new LedControl({
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(c.addresses, [0x74, 0x75]);

    var d = new LedControl({
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(d.addresses, [0x76, 0x77]);

    test.throws(function() {
      new LedControl({
        devices: 1,
        controller: "HT16K33",
        isMatrix: true,
        board: this.board
      });
    }.bind(this));

    test.done();
  },

  addressesInvalid: function(test) {
    test.expect(2);

    test.throws(function() {
      new LedControl({
        address: 0xff,
        controller: "HT16K33",
        isMatrix: true,
        board: this.board
      });
    });

    test.throws(function() {
      new LedControl({
        addresses: [0x00, 0xff],
        controller: "HT16K33",
        isMatrix: true,
        board: this.board
      });
    });

    test.done();
  },

  addressesAvailableByDeviceCount: function(test) {
    test.expect(1);

    new LedControl({
      devices: 8,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.throws(function() {
      new LedControl({
        devices: 1,
        controller: "HT16K33",
        isMatrix: true,
        board: this.board
      });
    });

    test.done();
  },

  addressesAvailableByAddressList: function(test) {
    test.expect(2);

    new LedControl({
      addresses: [0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77],
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.throws(function() {
      new LedControl({
        address: [0x70],
        controller: "HT16K33",
        isMatrix: true,
        board: this.board
      });
    });

    test.throws(function() {
      new LedControl({
        addresses: [0x70],
        controller: "HT16K33",
        isMatrix: true,
        board: this.board
      });
    });

    test.done();
  },

  addressesAndDevicesMissingImpliesOne: function(test) {
    test.expect(1);

    var a = new LedControl({
      // No "address"
      // No "addresses"
      // No "devices"
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(a.addresses, [0x70]);

    test.done();
  }
};

exports["LedControl - I2C Matrix"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();

    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");

    this.lc = new LedControl({
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    this.each = sinon.spy(this.lc, "each");
    this.row = sinon.spy(this.lc, "row");
    done();
  },
  tearDown: function(done) {
    Board.purge();
    restore(this);
    LedControl.reset();
    done();
  },
  initialize: function(test) {
    var expected = [
      // oscillator on
      [0x70, [0x21]],
      // blink off
      [0x70, [0x81]],
      // brightness at max
      [0x70, [0xEF]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    ];
    test.deepEqual(this.i2cWrite.args, expected);
    test.done();
  },
  clearAll: function(test) {
    test.expect(2);

    var expected = [
      // oscillator on
      [0x70, [0x21]],
      // blink off
      [0x70, [0x81]],
      // brightness at max
      [0x70, [0xEF]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    ];

    this.lc.clear();
    test.deepEqual(this.i2cWrite.args, expected);
    test.equal(this.each.callCount, 1);

    test.done();
  },
  on: function(test) {
    test.expect(1);
    var expected = [
      // oscillator on
      [ 0x70, [ 0x21 ]],
      // blink off
      [ 0x70, [ 0x81 ]],
      // brightness at max
      [ 0x70, [ 0xEF ]],
      // clear
      [ 0x70,[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      // oscillator on
      [ 0x70, [ 0x21 ]]
    ];
    this.lc.on(0);
    test.deepEqual(this.i2cWrite.args, expected);

    test.done();
  },
  off: function(test) {
    test.expect(1);
    var expected = [
      // oscillator on
      [ 0x70, [ 0x21 ]],
      // blink off
      [ 0x70, [ 0x81 ]],
      // brightness at max
      [ 0x70, [ 0xEF ]],
      // clear
      [ 0x70,[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      // oscillator off
      [ 0x70, [ 0x20 ]]
    ];
    this.lc.off(0);
    test.deepEqual(this.i2cWrite.args, expected);

    test.done();
  },
  brightness: function(test) {
    test.expect(1);
    var expected = [
      // oscillator on
      [ 0x70, [ 0x21 ]],
      // blink off
      [ 0x70, [ 0x81 ]],
      // brightness at max
      [ 0x70, [ 0xEF ]],
      // clear
      [ 0x70,[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      // min brightness
      [ 0x70, [ 0xE0 ]],
      // max brightness
      [ 0x70, [ 0xEF ]]
    ];
    this.lc.brightness(0); // set min brightness
    this.lc.brightness(100); // set max brightness
    test.deepEqual(this.i2cWrite.args, expected);

    test.done();
  },
  row: function(test) {
    test.expect(1);

    var expected = [
       // oscillator on
      [ 0x70, [ 0x21 ] ],
      // blink off
      [ 0x70, [ 0x81 ] ],
      // brightness at max
      [ 0x70, [ 0xEF ] ],
      // clear
      [ 0x70,[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      // setting the values
      [ 0x70, [ 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 32, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 32, 0, 32, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 32, 0, 32, 0, 32, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 0, 0 ]],
      [ 0x70, [ 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0 ]]
    ];

    this.lc.row(0, 1, 255);

    test.deepEqual(this.i2cWrite.args, expected);

    test.done();
  },
  column: function(test) {
    test.expect(1);

    var expected = [
      // oscillator on
      [ 0x70, [ 0x21 ] ],
      // blink off
      [ 0x70, [ 0x81 ] ],
      // brightness at max
      [ 0x70, [ 0xEF ] ],
      // clear
      [ 0x70, [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      // setting the values
      [ 0x70, [ 0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 0, 0, 0, 0, 0, 0, 112, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 0, 0, 0, 0, 0, 0, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 0, 0, 0, 0, 0, 0, 124, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 0, 0, 0, 0, 0, 0, 126, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 0, 0, 0, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]],
      [ 0x70, [ 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]]
    ];

    this.lc.column(0, 3, 255);

    test.deepEqual(this.i2cWrite.args, expected);

    test.done();
  },

  draw: function(test) {
    test.expect(2);

    test.doesNotThrow(function() {
      this.lc.draw([
        "00111100",
        "01000010",
        "10100101",
        "10000001",
        "10100101",
        "10011001",
        "01000010",
        "00111100"
      ]);
    }.bind(this));

    test.throws(function() {
      this.lc.draw([
        "00111100",
      ]);
    }.bind(this));

    test.done();
  },

  drawStringArray: function(test) {
    test.expect(2);

    var expected = [
     [ 0, 0, "00111100" ],
     [ 0, 1, "01000010" ],
     [ 0, 2, "10100101" ],
     [ 0, 3, "10000001" ],
     [ 0, 4, "10100101" ],
     [ 0, 5, "10011001" ],
     [ 0, 6, "01000010" ],
     [ 0, 7, "00111100" ]
    ];

    this.lc.draw(0, [
      "00111100",
      "01000010",
      "10100101",
      "10000001",
      "10100101",
      "10011001",
      "01000010",
      "00111100"
    ]);

    test.deepEqual(this.row.args, expected);
    test.equal(this.row.callCount, 8);

    test.done();
  }
};

exports["LedControl - I2C Matrix 16x8"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();

    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");

    this.lc = new LedControl({
      controller: "HT16K33",
      isMatrix: true,
      is16x8: true,
      isBicolor: false,
      board: this.board
    });
    this.each = sinon.spy(this.lc, "each");
    this.row = sinon.spy(this.lc, "row");
    done();
  },
  tearDown: function(done) {
    Board.purge();
    restore(this);
    LedControl.reset();
    done();
  },
  clearAll: function(test) {
    test.expect(2);
    var expected = [
      // oscillator on
      [0x70, [0x21]],
      // blink off
      [0x70, [0x81]],
      // brightness at max
      [0x70, [0xEF]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]

    ];

    this.lc.clear();
    test.deepEqual(this.i2cWrite.args, expected);
    test.equal(this.each.callCount, 1);

    test.done();
  },
  drawStringArray: function(test) {
    test.expect(2);

    var expected = [
     [ 0, 0, "0110011001100110" ],
     [ 0, 1, "1001100110011001" ],
     [ 0, 2, "1000000110000001" ],
     [ 0, 3, "1000000110000001" ],
     [ 0, 4, "0100001001000010" ],
     [ 0, 5, "0010010000100100" ],
     [ 0, 6, "0001100000011000" ],
     [ 0, 7, "0000000000000000" ]
    ];

    this.lc.draw(0, [
    "0110011001100110",
    "1001100110011001",
    "1000000110000001",
    "1000000110000001",
    "0100001001000010",
    "0010010000100100",
    "0001100000011000",
    "0000000000000000"
    ]);

    test.deepEqual(this.row.args, expected);
    test.equal(this.row.callCount, 8);

    test.done();
  },
  row: function(test) {
    test.expect(1);

    var expected = [
       // oscillator on
      [ 0x70, [ 0x21 ] ],
      // blink off
      [ 0x70, [ 0x81 ] ],
      // brightness at max
      [ 0x70, [ 0xEF ] ],
      // clear

      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      // setting the values

      [ 0x70,  [ 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ],
      [ 0x70,  [ 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ],
      [ 0x70,  [ 0, 64, 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ],
      [ 0x70,  [ 0, 64, 0, 64, 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ],
      [ 0x70,  [ 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 0 ] ],
      [ 0x70,  [ 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 0, 0, 0, 0 ] ],
      [ 0x70,  [ 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 0, 0 ] ],
      [ 0x70,  [ 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0 ] ]
    ];

    this.lc.row(0, 0, 0xffff);

    test.deepEqual(this.i2cWrite.args, expected);
    test.done();
  },
};

exports["LedControl - Matrix"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();

    this.lc = new LedControl({
      pins: {
        data: 2,
        clock: 3,
        cs: 4
      },
      isMatrix: true,
      board: this.board
    });

    this.digitalWrite = sinon.spy(this.board, "digitalWrite");
    this.shiftOut = sinon.spy(this.board, "shiftOut");

    this.proto = [{
        name: "column",
        args: [0, 255]
      }, {
        name: "digit",
        args: [1, 1, true]
      }, {
        name: "draw",
        args: [1]
      }, {
        name: "send",
        args: [0, 1, 1]
      }
    ];

    this.instance = [{
      name: "on",
      args: []
    }, {
      name: "off",
      args: []
    }, {
      name: "scanLimit",
      args: [0]
    }, {
      name: "brightness",
      args: [0]
    }, {
      name: "clear",
      args: []
    }, {
      name: "led",
      args: [0, 0, 1]
    }, {
      name: "row",
      args: [0, 255]
    }, {
      name: "devices"
    }, {
      name: "isMatrix"
    }];


    this.each = sinon.spy(this.lc, "each");
    this.row = sinon.spy(this.lc, "row");
    this.column = sinon.spy(this.lc, "column");
    this.draw = sinon.spy(this.lc, "draw");
    this.on = sinon.spy(this.lc, "on");
    this.off = sinon.spy(this.lc, "off");
    this.scanLimit = sinon.spy(this.lc, "scanLimit");
    this.brightness = sinon.spy(this.lc, "brightness");
    this.clear = sinon.spy(this.lc, "clear");
    this.led = sinon.spy(this.lc, "led");
    this.initialize = sinon.spy(this.lc,"initialize");
    this.send = sinon.spy(this.lc, "send");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    LedControl.reset();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.lc[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.lc[property.name], "undefined");
    }, this);

    test.done();
  },

  initialization: function(test) {
    test.expect(2);

    var expected = [
      // this.send(device, LedControl.OP.DECODING, 0);
      // this.send(device, LedControl.OP.BRIGHTNESS, 3);
      // this.send(device, LedControl.OP.SCANLIMIT, 7);
      // this.send(device, LedControl.OP.SHUTDOWN, 1);
      // this.send(device, LedControl.OP.DISPLAYTEST, 0);

      [0, 9, 0],
      [0, 10, 3],
      [0, 11, 7],
      [0, 12, 1],
      [0, 15, 0],

      // this.clear(device);
      [0, 1, 0],
      [0, 2, 0],
      [0, 3, 0],
      [0, 4, 0],
      [0, 5, 0],
      [0, 6, 0],
      [0, 7, 0],
      [0, 8, 0],

      // this.on(device);
      [0, 12, 1]
    ];

    this.lc.initialize({
      pins: {
        data: 2,
        clock: 3,
        cs: 4
      },
      isMatrix: true,
      board: this.board
    });

    test.ok(this.initialize.called);
    test.deepEqual(this.send.args, expected);

    test.done();
  },

  returns: function(test) {
    test.expect(this.proto.length);

    this.proto.forEach(function(proto) {
      test.equal(this[proto.name].apply(this, proto.args), this);
    }, this.lc);

    test.done();
  },

  on: function(test) {
    test.expect(1);

    this.lc.on(0);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 12],
      [2, 3, 1]
    ]);

    test.done();
  },

  onAll: function(test) {
    test.expect(2);


    this.lc.on();
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 12],
      [2, 3, 1]
    ]);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  off: function(test) {
    test.expect(1);

    this.lc.off(0);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 12],
      [2, 3, 0]
    ]);

    test.done();
  },

  offAll: function(test) {
    test.expect(2);

    this.lc.off();
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 12],
      [2, 3, 0]
    ]);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  scanLimit: function(test) {
    test.expect(1);

    this.lc.scanLimit(0, 8);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 11],
      [2, 3, 8]
    ]);

    test.done();
  },

  scanLimitAll: function(test) {
    test.expect(2);

    this.lc.scanLimit(8);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 11],
      [2, 3, 8]
    ]);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  brightness: function(test) {
    test.expect(1);

    this.lc.brightness(0, 100);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 10],
      [2, 3, 15]
    ]);


    test.done();
  },

  brightnessAll: function(test) {
    test.expect(2);

    this.lc.brightness(100);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 10],
      [2, 3, 15]
    ]);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  clear: function(test) {
    test.expect(1);

    var expected = [
      [2, 3, 1],
      [2, 3, 0],
      [2, 3, 2],
      [2, 3, 0],
      [2, 3, 3],
      [2, 3, 0],
      [2, 3, 4],
      [2, 3, 0],
      [2, 3, 5],
      [2, 3, 0],
      [2, 3, 6],
      [2, 3, 0],
      [2, 3, 7],
      [2, 3, 0],
      [2, 3, 8],
      [2, 3, 0]
    ];

    this.lc.clear(0);
    test.deepEqual(this.shiftOut.args, expected);

    test.done();
  },

  clearAll: function(test) {
    test.expect(2);

    var expected = [
      [2, 3, 1],
      [2, 3, 0],
      [2, 3, 2],
      [2, 3, 0],
      [2, 3, 3],
      [2, 3, 0],
      [2, 3, 4],
      [2, 3, 0],
      [2, 3, 5],
      [2, 3, 0],
      [2, 3, 6],
      [2, 3, 0],
      [2, 3, 7],
      [2, 3, 0],
      [2, 3, 8],
      [2, 3, 0]
    ];

    this.lc.clear();
    test.deepEqual(this.shiftOut.args, expected);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  row: function(test) {
    test.expect(1);

    var expected = [
      [2, 3, 2],
      [2, 3, 255]
    ];

    this.lc.row(0, 1, 255);

    test.deepEqual(this.shiftOut.args, expected);

    test.done();
  },

  rowAll: function(test) {
    test.expect(2);

    var expected = [
      [2, 3, 2],
      [2, 3, 255]
    ];

    this.lc.row(1, 255);

    test.deepEqual(this.shiftOut.args, expected);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  column: function(test) {
    test.expect(1);

    var expected = [
      [2, 3, 1],
      [2, 3, 16],
      [2, 3, 2],
      [2, 3, 16],
      [2, 3, 3],
      [2, 3, 16],
      [2, 3, 4],
      [2, 3, 16],
      [2, 3, 5],
      [2, 3, 16],
      [2, 3, 6],
      [2, 3, 16],
      [2, 3, 7],
      [2, 3, 16],
      [2, 3, 8],
      [2, 3, 16]
    ];

    this.lc.column(0, 3, 255);

    test.deepEqual(this.shiftOut.args, expected);

    test.done();
  },

  columnAll: function(test) {
    test.expect(2);

    var expected = [
      [2, 3, 1],
      [2, 3, 16],
      [2, 3, 2],
      [2, 3, 16],
      [2, 3, 3],
      [2, 3, 16],
      [2, 3, 4],
      [2, 3, 16],
      [2, 3, 5],
      [2, 3, 16],
      [2, 3, 6],
      [2, 3, 16],
      [2, 3, 7],
      [2, 3, 16],
      [2, 3, 8],
      [2, 3, 16]
    ];

    this.lc.column(3, 255);

    test.deepEqual(this.shiftOut.args, expected);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  drawSingleChar: function(test) {
    test.expect(2);

    var expected = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 2, 0],
      [0, 3, 0],
      [0, 4, 0],
      [0, 5, 0],
      [0, 6, 0],
      [0, 7, 0]
    ];

    this.lc.draw(0, " ");

    test.deepEqual(this.row.args, expected);
    test.equal(this.row.callCount, 8);

    test.done();
  },

  drawByteArray: function(test) {
    test.expect(2);

    var expected = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 2, 0],
      [0, 3, 0],
      [0, 4, 0],
      [0, 5, 0],
      [0, 6, 0],
      [0, 7, 0]
    ];

    this.lc.draw(0, [0, 0, 0, 0, 0, 0, 0, 0]);

    test.deepEqual(this.row.args, expected);
    test.equal(this.row.callCount, 8);

    test.done();
  },

  drawStringArray: function(test) {
    test.expect(2);

    var expected = [
      [0, 0, 0],
      [0, 1, 0],
      [0, 2, 0],
      [0, 3, 0],
      [0, 4, 0],
      [0, 5, 0],
      [0, 6, 0],
      [0, 7, 0]
    ];

    this.lc.draw(0, [
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000",
      "00000000"
    ]);

    test.deepEqual(this.row.args, expected);
    test.equal(this.row.callCount, 8);

    test.done();
  },


  send: function(test) {
    test.expect(2);

    var expected = [
      [2, 3, 10],
      [2, 3, 0]
    ];

    this.digitalWrite.reset();

    this.lc.send(0, LedControl.OP.BRIGHTNESS, 0);
    test.deepEqual(this.shiftOut.args, expected);

    // 3 calls in write
    // 8 writes per shiftOut
    // 2 shiftOuts per send
    //
    // 3 * (8 * 2) = 48
    //
    //  48
    // + 2 digitalWrite calls in send
    // -------
    //  50
    test.equal(this.digitalWrite.callCount, 50);

    test.done();
  },

  sendError: function(test) {
    test.expect(1);

    try {
      this.lc.send();
    } catch (e) {
      test.equal(e.message, "`send` expects three arguments: device, opcode, data");
    }

    test.done();
  },

  // TODO: digit, char
  // TODO: Statics
  //  - OP
  //  - DEFAULTS
  //  - CHAR_TABLE
  //  - MATRIX_CHARS
};


exports["LedControl - Digits"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();

    this.lc = new LedControl({
      pins: {
        data: 2,
        clock: 3,
        cs: 4
      },
      board: this.board
    });

    this.digitalWrite = sinon.spy(this.board, "digitalWrite");
    this.shiftOut = sinon.spy(this.board, "shiftOut");
    this.each = sinon.spy(this.lc, "each");
    this.send = sinon.spy(this.lc, "send");

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    LedControl.reset();
    done();
  },

  initialization: function(test) {
    test.expect(3);

    var expected = [
      // this.send(device, LedControl.OP.DECODING, 0);
      // this.send(device, LedControl.OP.BRIGHTNESS, 3);
      // this.send(device, LedControl.OP.SCANLIMIT, 7);
      // this.send(device, LedControl.OP.SHUTDOWN, 1);
      // this.send(device, LedControl.OP.DISPLAYTEST, 0);

      [0, 10, 3],
      [0, 11, 7],
      [0, 12, 1],
      [0, 15, 0],

      // this.clear(device);
      [0, 1, 0],
      [0, 2, 0],
      [0, 3, 0],
      [0, 4, 0],
      [0, 5, 0],
      [0, 6, 0],
      [0, 7, 0],
      [0, 8, 0],

      // this.on(device);
      [0, 12, 1]
    ];

    this.lc.initialize({
      pins: {
        data: 2,
        clock: 3,
        cs: 4
      }
    });
    test.deepEqual(this.send.args, expected);
    test.equal(this.lc.isMatrix, false);
    test.equal(this.lc.devices, 1);

    test.done();
  },

  digit: function(test) {
    test.expect(1);

    this.lc.digit(0, 0, 1);
    test.deepEqual(this.send.args, [
      [0, 8, 48]
    ]);

    test.done();
  },
  digitDigitWithDecimal: function(test) {
    test.expect(1);

    this.lc.digit(0, 0, "1.");
    test.deepEqual(this.send.args, [
      [0, 8, 176]
    ]);

    test.done();
  },
  draw: function(test) {
    test.expect(1);

    this.lc.draw(0, 0, 1);
    test.deepEqual(this.send.args, [
      [0, 8, 48]
    ]);

    test.done();
  },
  drawAlphaWithDecimal: function(test) {
    test.expect(1);

    this.lc.draw(0, 0, "1.");
    test.deepEqual(this.send.args, [
      [0, 8, 176]
    ]);

    test.done();
  },
  digitAll: function(test) {
    test.expect(1);

    this.lc.digit(0, 1);
    test.deepEqual(this.send.args, [
      [0, 8, 48]
    ]);

    test.done();
  },
  digitDigitWithDecimalAll: function(test) {
    test.expect(1);

    this.lc.digit(0, "1.");
    test.deepEqual(this.send.args, [
      [0, 8, 176]
    ]);

    test.done();
  },
  drawAll: function(test) {
    test.expect(1);

    this.lc.draw(0, 1);
    test.deepEqual(this.send.args, [
      [0, 8, 48]
    ]);

    test.done();
  },
  drawAlphaWithDecimalAll: function(test) {
    test.expect(1);

    this.lc.draw(0, "1.");
    test.deepEqual(this.send.args, [
      [0, 8, 176]
    ]);

    test.done();
  }
};
