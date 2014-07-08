var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./mock-firmata"),
  Board = five.Board,
  LedControl = five.LedControl,
  LedMatrix = five.Led.Matrix;

function newBoard() {
  return new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });
}

exports["Led.Matrix => LedControl"] = {
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
      name: "on"
    }, {
      name: "off"
    }, {
      name: "shutdown"
    }, {
      name: "scanLimit"
    }, {
      name: "brightness"
    }, {
      name: "clear"
    }, {
      name: "led"
    }, {
      name: "row"
    }, {
      name: "column"
    }, {
      name: "digit"
    }, {
      name: "char"
    }, {
      name: "send"
    }];

    this.instance = [{
      name: "devices"
    }, {
      name: "isMatrix"
    }];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
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
    test.expect(1);

    var send = sinon.spy(LedControl.prototype, "send");
    var expected = [
      // this.send(device, LedControl.OP.DECODING, 0);
      // this.send(device, LedControl.OP.BRIGHTNESS, 3);
      // this.send(device, LedControl.OP.SCANLIMIT, 7);
      // this.send(device, LedControl.OP.SHUTDOWN, 1);
      // this.send(device, LedControl.OP.DISPLAYTEST, 0);

      [ 0, 9, 0 ],
      [ 0, 10, 3 ],
      [ 0, 11, 7 ],
      [ 0, 12, 1 ],
      [ 0, 15, 0 ],

      // this.clear(device);
      [ 0, 1, 0 ],
      [ 0, 2, 0 ],
      [ 0, 3, 0 ],
      [ 0, 4, 0 ],
      [ 0, 5, 0 ],
      [ 0, 6, 0 ],
      [ 0, 7, 0 ],
      [ 0, 8, 0 ],

      // this.off(device);
      [ 0, 12, 0 ]
    ];

    var lc = new LedControl({
      pins: {
        data: 2,
        clock: 3,
        cs: 4
      },
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(send.args, expected);

    send.restore();
    test.done();
  },

  onDefaultDevice: function(test) {
    test.expect(1);

    this.shiftOut.reset();
    this.lc.on();
    test.deepEqual(this.shiftOut.args, [ [ 2, 3, 12 ], [ 2, 3, 1 ] ]);

    test.done();
  },

  on: function(test) {
    test.expect(1);

    this.shiftOut.reset();
    this.lc.on(0);
    test.deepEqual(this.shiftOut.args, [ [ 2, 3, 12 ], [ 2, 3, 1 ] ]);

    test.done();
  },

  offDefaultDevice: function(test) {
    test.expect(1);

    this.shiftOut.reset();
    this.lc.off();
    test.deepEqual(this.shiftOut.args, [ [ 2, 3, 12 ], [ 2, 3, 0 ] ]);

    test.done();
  },

  off: function(test) {
    test.expect(1);

    this.shiftOut.reset();
    this.lc.off(0);
    test.deepEqual(this.shiftOut.args, [ [ 2, 3, 12 ], [ 2, 3, 0 ] ]);

    test.done();
  },

  shutdown: function(test) {
    test.expect(2);

    this.lc.shutdown(0, 1);
    test.deepEqual(this.shiftOut.args, [ [ 2, 3, 12 ], [ 2, 3, 0 ] ]);

    this.lc.shutdown(0, 0);
    test.deepEqual(this.shiftOut.args, [ [ 2, 3, 12 ], [ 2, 3, 0 ], [ 2, 3, 12 ], [ 2, 3, 1 ] ]);

    test.done();
  },

  scanLimit: function(test) {
    test.expect(1);

    this.lc.scanLimit(0, 8);
    test.deepEqual(this.shiftOut.args, [ [ 2, 3, 11 ], [ 2, 3, 8 ] ]);


    test.done();
  },

  brightness: function(test) {
    test.expect(1);

    this.lc.brightness(0, 3);
    test.deepEqual(this.shiftOut.args, [ [ 2, 3, 10 ], [ 2, 3, 3 ] ]);


    test.done();
  },

  clearDefaultDevice: function(test) {
    test.expect(1);

    var expected = [
      [ 2, 3, 1 ],
      [ 2, 3, 0 ],
      [ 2, 3, 2 ],
      [ 2, 3, 0 ],
      [ 2, 3, 3 ],
      [ 2, 3, 0 ],
      [ 2, 3, 4 ],
      [ 2, 3, 0 ],
      [ 2, 3, 5 ],
      [ 2, 3, 0 ],
      [ 2, 3, 6 ],
      [ 2, 3, 0 ],
      [ 2, 3, 7 ],
      [ 2, 3, 0 ],
      [ 2, 3, 8 ],
      [ 2, 3, 0 ]
    ];

    this.lc.clear();
    test.deepEqual(this.shiftOut.args, expected);

    test.done();
  },

  clear: function(test) {
    test.expect(1);

    var expected = [
      [ 2, 3, 1 ],
      [ 2, 3, 0 ],
      [ 2, 3, 2 ],
      [ 2, 3, 0 ],
      [ 2, 3, 3 ],
      [ 2, 3, 0 ],
      [ 2, 3, 4 ],
      [ 2, 3, 0 ],
      [ 2, 3, 5 ],
      [ 2, 3, 0 ],
      [ 2, 3, 6 ],
      [ 2, 3, 0 ],
      [ 2, 3, 7 ],
      [ 2, 3, 0 ],
      [ 2, 3, 8 ],
      [ 2, 3, 0 ]
    ];

    this.lc.clear(0);
    test.deepEqual(this.shiftOut.args, expected);

    test.done();
  },

  row: function(test) {
    test.expect(1);

    var expected = [
      [ 2, 3, 2 ],
      [ 2, 3, 255 ]
    ];

    this.lc.row(0, 1, 255);

    test.deepEqual(this.shiftOut.args, expected);

    test.done();
  },

  column: function(test) {
    test.expect(1);

    var expected = [
      [ 2, 3, 1 ], [ 2, 3, 16 ],
      [ 2, 3, 2 ], [ 2, 3, 16 ],
      [ 2, 3, 3 ], [ 2, 3, 16 ],
      [ 2, 3, 4 ], [ 2, 3, 16 ],
      [ 2, 3, 5 ], [ 2, 3, 16 ],
      [ 2, 3, 6 ], [ 2, 3, 16 ],
      [ 2, 3, 7 ], [ 2, 3, 16 ],
      [ 2, 3, 8 ], [ 2, 3, 16 ]
    ];

    this.lc.column(0, 3, 255);

    test.deepEqual(this.shiftOut.args, expected);

    test.done();
  },

  send: function(test) {
    test.expect(2);

    var expected = [
      [ 2, 3, 10 ],
      [ 2, 3, 0 ]
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

  // TODO: digit, char
  // TODO: Statics
  //  - OP
  //  - DEFAULTS
  //  - CHAR_TABLE
  //  - MATRIX_CHARS
};
