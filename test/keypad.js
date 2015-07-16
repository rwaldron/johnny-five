var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Keypad = five.Keypad;


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

exports["Keypad: Analog"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.keypad = new Keypad({
      pin: "A1",
      length: 16,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  invalid: function(test) {
    test.expect(1);

    // Missing both a length and keys
    test.throws(function() {
      new Keypad({
        pin: "A1",
        board: this.board
      });
    });
    test.done();
  },

  keysDefault: function(test) {
    test.expect(12);

    var keys = Array.from({ length: 12 }, function(_, index) {
      return index;
    });
    var keypad = new five.Keypad({
      board: this.board,
      pin: "A0",
      length: 12
    });
    var callback = this.analogRead.getCall(1).args[1];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback(0);
    callback(61);
    callback(125);
    callback(189);
    callback(252);
    callback(315);
    callback(379);
    callback(445);
    callback(508);
    callback(573);
    callback(639);
    callback(700);
    callback(763);
    callback(830);
    callback(896);
    callback(960);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  keysRowsCols: function(test) {
    test.expect(16);

    var keys = ["1", "!", "@", "#", "2", "$", "%", "^", "3", "&", "-", "+", "4", "<", ">", "?"];
    var keypad = new five.Keypad({
      board: this.board,
      pin: "A0",
      keys: [
        ["1", "!", "@", "#"],
        ["2", "$", "%", "^"],
        ["3", "&", "-", "+"],
        ["4", "<", ">", "?"],
      ]
    });
    var callback = this.analogRead.getCall(1).args[1];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback(0);
    callback(61);
    callback(125);
    callback(189);
    callback(252);
    callback(315);
    callback(379);
    callback(445);
    callback(508);
    callback(573);
    callback(639);
    callback(700);
    callback(763);
    callback(830);
    callback(896);
    callback(960);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  keysList: function(test) {
    test.expect(16);

    var keys = ["1", "!", "@", "#", "2", "$", "%", "^", "3", "&", "-", "+", "4", "<", ">", "?"];
    var keypad = new five.Keypad({
      board: this.board,
      pin: "A0",
      keys: keys
    });
    var callback = this.analogRead.getCall(1).args[1];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback(0);
    callback(61);
    callback(125);
    callback(189);
    callback(252);
    callback(315);
    callback(379);
    callback(445);
    callback(508);
    callback(573);
    callback(639);
    callback(700);
    callback(763);
    callback(830);
    callback(896);
    callback(960);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },
  press: function(test) {
    test.expect(1);

    var callback = this.analogRead.getCall(0).args[1];
    var spy = sinon.spy();

    this.keypad.on("down", spy);

    callback(0);
    callback(61);
    callback(125);
    callback(189);
    callback(252);
    callback(315);
    callback(379);
    callback(445);
    callback(508);
    callback(573);
    callback(639);
    callback(700);
    callback(763);
    callback(830);
    callback(896);
    callback(960);

    test.equal(spy.callCount, 16);
    test.done();
  },

  hold: function(test) {
    test.expect(1);

    var callback = this.analogRead.getCall(0).args[1];
    var spy = sinon.spy();

    this.keypad.on("hold", spy);

    callback(403);
    this.clock.tick(600);
    callback(403);

    test.equal(spy.callCount, 1);
    test.done();
  },

  release: function(test) {
    test.expect(1);

    var callback = this.analogRead.getCall(0).args[1];
    var spy = sinon.spy();

    this.keypad.on("release", spy);

    callback(403);
    callback(0);

    test.equal(spy.callCount, 1);
    test.done();
  },

  context: function(test) {
    test.expect(1);

    var callback = this.analogRead.getCall(0).args[1];
    var keypad = this.keypad;

    this.keypad.on("press", function() {
      test.equal(this, keypad);
      test.done();
    });
    callback(403);

  }
};

exports["Keypad: VKey"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(MockFirmata.prototype, "analogRead");
    this.keypad = new Keypad({
      controller: "VKEY",
      pin: "A1",
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  keysDefault: function(test) {
    test.expect(12);

    var keys = Array.from({ length: 12 }, function(_, index) {
      return index + 1;
    });
    var keypad = new five.Keypad({
      board: this.board,
      controller: "VKEY",
      pin: "A0",
    });
    var callback = this.analogRead.getCall(1).args[1];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback(487);
    callback(444);
    callback(404);
    callback(365);
    callback(323);
    callback(282);
    callback(242);
    callback(201);
    callback(160);
    callback(119);
    callback(79);
    callback(38);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  keysRowsCols: function(test) {
    test.expect(12);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "<", ">", "?"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "VKEY",
      pin: "A0",
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&", "-", "+"],
        ["<", ">", "?"],
      ]
    });
    var callback = this.analogRead.getCall(1).args[1];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback(487);
    callback(444);
    callback(404);
    callback(365);
    callback(323);
    callback(282);
    callback(242);
    callback(201);
    callback(160);
    callback(119);
    callback(79);
    callback(38);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  keysList: function(test) {
    test.expect(12);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "<", ">", "?"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "VKEY",
      pin: "A0",
      keys: keys
    });
    var callback = this.analogRead.getCall(1).args[1];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback(485);
    callback(444);
    callback(404);
    callback(365);
    callback(323);
    callback(282);
    callback(242);
    callback(201);
    callback(160);
    callback(119);
    callback(79);
    callback(38);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  press: function(test) {
    test.expect(1);

    var callback = this.analogRead.getCall(0).args[1];
    var spy = sinon.spy();

    this.keypad.on("down", spy);

    // Only 3 are valid.
    callback(403);
    callback(322);
    callback(11);
    callback(38);
    callback(512);

    test.equal(spy.callCount, 3);
    test.done();
  },

  hold: function(test) {
    test.expect(1);

    var callback = this.analogRead.getCall(0).args[1];
    var spy = sinon.spy();

    this.keypad.on("hold", spy);

    callback(403);
    this.clock.tick(600);
    callback(403);

    test.equal(spy.callCount, 1);
    test.done();
  },

  release: function(test) {
    test.expect(1);

    var callback = this.analogRead.getCall(0).args[1];
    var spy = sinon.spy();

    this.keypad.on("release", spy);

    callback(403);
    callback(0);

    test.equal(spy.callCount, 1);
    test.done();
  },

  context: function(test) {
    test.expect(1);

    var callback = this.analogRead.getCall(0).args[1];
    var keypad = this.keypad;

    this.keypad.on("press", function() {
      test.equal(this, keypad);
      test.done();
    });
    callback(403);

  }
};

exports["Keypad: MPR121QR2"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");

    this.keypad = new Keypad({
      controller: "MPR121QR2",
      address: 0x5A,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Keypad({
      controller: "MPR121QR2",
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

  initialize: function(test) {
    test.expect(2);

    test.equal(this.i2cConfig.callCount, 1);
    // 10 settings
    // 24 Thresholds
    test.equal(this.i2cWrite.callCount, 34);

    test.done();
  },

  keysDefault: function(test) {
    test.expect(9);

    var keys = Array.from({ length: 9 }, function(_, index) {
      return index + 1;
    });
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121QR2",
      address: 0x5A
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([ 0, 1 ]);
    callback([ 32, 0 ]);
    callback([ 4, 0 ]);
    callback([ 128, 0 ]);
    callback([ 16, 0 ]);
    callback([ 2, 0 ]);
    callback([ 64, 0 ]);
    callback([ 8, 0 ]);
    callback([ 1, 0 ]);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  keysRowsCols: function(test) {
    test.expect(9);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121QR2",
      address: 0x5A,
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&", "-", "+"],
      ]
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([ 0, 1 ]);
    callback([ 32, 0 ]);
    callback([ 4, 0 ]);
    callback([ 128, 0 ]);
    callback([ 16, 0 ]);
    callback([ 2, 0 ]);
    callback([ 64, 0 ]);
    callback([ 8, 0 ]);
    callback([ 1, 0 ]);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  keysList: function(test) {
    test.expect(9);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121QR2",
      address: 0x5A,
      keys: keys
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([ 0, 1 ]);
    callback([ 32, 0 ]);
    callback([ 4, 0 ]);
    callback([ 128, 0 ]);
    callback([ 16, 0 ]);
    callback([ 2, 0 ]);
    callback([ 64, 0 ]);
    callback([ 8, 0 ]);
    callback([ 1, 0 ]);


    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  press: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("down", spy);

    // Only 3 are valid.
    callback([ 64, 0 ]);
    callback([ 2, 0 ]);
    callback([ 4, 0, 0 ]);
    callback([ 4 ]);
    callback([ 4, 0 ]);

    test.equal(spy.callCount, 3);
    test.done();
  },

  hold: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("hold", spy);

    callback([ 64, 0 ]);
    this.clock.tick(600);
    callback([ 64, 0 ]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  release: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("release", spy);

    callback([ 64, 0 ]);
    callback([ 0, 0 ]);

    test.equal(spy.callCount, 1);
    test.done();
  },
};


exports["Keypad: MPR121"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");

    this.keypad = new Keypad({
      controller: "MPR121",
      address: 0x5A,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
    done();
  },

  fwdOptionsToi2cConfig: function(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Keypad({
      controller: "MPR121",
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

  initialize: function(test) {
    test.expect(2);

    test.equal(this.i2cConfig.callCount, 1);
    // 10 settings
    // 24 Thresholds
    test.equal(this.i2cWrite.callCount, 34);

    test.done();
  },

  keysDefault: function(test) {
    test.expect(12);

    var keys = Array.from({ length: 12 }, function(_, index) {
      return index + 1;
    });
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121",
      address: 0x5A
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([ 8, 0 ]);
    callback([ 128, 0 ]);
    callback([ 0, 8 ]);
    callback([ 4, 0 ]);
    callback([ 64, 0 ]);
    callback([ 0, 4 ]);
    callback([ 2, 0 ]);
    callback([ 32, 0 ]);
    callback([ 0, 2 ]);
    callback([ 1, 0 ]);
    callback([ 16, 0 ]);
    callback([ 0, 1 ]);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  keysRowsCols: function(test) {
    test.expect(12);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121",
      address: 0x5A,
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&", "-", "+"],
        ["_", "=", ":"]
      ]
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([ 8, 0 ]);
    callback([ 128, 0 ]);
    callback([ 0, 8 ]);
    callback([ 4, 0 ]);
    callback([ 64, 0 ]);
    callback([ 0, 4 ]);
    callback([ 2, 0 ]);
    callback([ 32, 0 ]);
    callback([ 0, 2 ]);
    callback([ 1, 0 ]);
    callback([ 16, 0 ]);
    callback([ 0, 1 ]);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  keysList: function(test) {
    test.expect(12);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121",
      address: 0x5A,
      keys: keys
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([ 8, 0 ]);
    callback([ 128, 0 ]);
    callback([ 0, 8 ]);
    callback([ 4, 0 ]);
    callback([ 64, 0 ]);
    callback([ 0, 4 ]);
    callback([ 2, 0 ]);
    callback([ 32, 0 ]);
    callback([ 0, 2 ]);
    callback([ 1, 0 ]);
    callback([ 16, 0 ]);
    callback([ 0, 1 ]);

    keys.forEach(function(key, index) {
      test.equal(spy.args[index][0].which, key);
    });

    test.done();
  },

  press: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("down", spy);

    // Only 3 are valid.
    callback([ 64, 0 ]);
    callback([ 2, 0 ]);
    callback([ 4, 0, 0 ]);
    callback([ 4 ]);
    callback([ 4, 0 ]);

    test.equal(spy.callCount, 3);
    test.done();
  },

  hold: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("hold", spy);

    callback([ 64, 0 ]);
    this.clock.tick(600);
    callback([ 64, 0 ]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  release: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("release", spy);

    callback([ 64, 0 ]);
    callback([ 0, 0 ]);

    test.equal(spy.callCount, 1);
    test.done();
  },
};
