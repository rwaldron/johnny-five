var mocks = require("mock-firmata"),
  MockFirmata = mocks.Firmata,
  five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  Board = five.Board,
  Keypad = five.Keypad;


var mpr121 = require("../lib/definitions/mpr121");


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

    var keys = Array.from({
      length: 12
    }, function(_, index) {
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
      test.deepEqual(spy.args[index][0].which, [key]);
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
      test.deepEqual(spy.args[index][0].which, [key]);
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
      test.deepEqual(spy.args[index][0].which, [key]);
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

    var keys = Array.from({
      length: 12
    }, function(_, index) {
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
      test.deepEqual(spy.args[index][0].which, [key]);
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
      test.deepEqual(spy.args[index][0].which, [key]);
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
      test.deepEqual(spy.args[index][0].which, [key]);
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
    test.expect(11);

    test.equal(this.i2cConfig.callCount, 1);
    // 16 settings
    // 24 Thresholds
    test.equal(this.i2cWrite.callCount, 40);

    test.deepEqual(this.i2cWrite.getCall(0).args, [0x5A, mpr121.MPR121_SOFTRESET, 0x63]);
    test.deepEqual(this.i2cWrite.getCall(1).args, [0x5A, mpr121.MHD_RISING, 0x01]);
    test.deepEqual(this.i2cWrite.getCall(2).args, [0x5A, mpr121.NHD_AMOUNT_RISING, 0x01]);
    test.deepEqual(this.i2cWrite.getCall(3).args, [0x5A, mpr121.NCL_RISING, 0x00]);
    test.deepEqual(this.i2cWrite.getCall(4).args, [0x5A, mpr121.FDL_RISING, 0x00]);
    test.deepEqual(this.i2cWrite.getCall(5).args, [0x5A, mpr121.MHD_FALLING, 0x01]);
    test.deepEqual(this.i2cWrite.getCall(6).args, [0x5A, mpr121.NHD_AMOUNT_FALLING, 0x01]);
    test.deepEqual(this.i2cWrite.getCall(7).args, [0x5A, mpr121.NCL_FALLING, 0xFF]);
    test.deepEqual(this.i2cWrite.getCall(8).args, [0x5A, mpr121.FDL_FALLING, 0x02]);

    test.done();
  },

  keysDefault: function(test) {
    test.expect(9);

    var keys = Array.from({
      length: 9
    }, function(_, index) {
      return index;
    });
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121",
      address: 0x5A
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([1, 0]);
    callback([2, 0]);
    callback([4, 0]);
    callback([8, 0]);
    callback([16, 0]);
    callback([32, 0]);
    callback([64, 0]);
    callback([128, 0]);
    callback([256, 0]);
    callback([512, 0]);
    callback([1024, 0]);
    callback([2048, 0]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols: function(test) {
    test.expect(9);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121",
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

    // callback([ 0, 1 ]);
    // callback([ 32, 0 ]);
    // callback([ 4, 0 ]);
    // callback([ 128, 0 ]);
    // callback([ 16, 0 ]);
    // callback([ 2, 0 ]);
    // callback([ 64, 0 ]);
    // callback([ 8, 0 ]);
    // callback([ 1, 0 ]);

    callback([1, 0]);
    callback([2, 0]);
    callback([4, 0]);
    callback([8, 0]);
    callback([16, 0]);
    callback([32, 0]);
    callback([64, 0]);
    callback([128, 0]);
    callback([256, 0]);
    callback([512, 0]);
    callback([1024, 0]);
    callback([2048, 0]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList: function(test) {
    test.expect(9);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121",
      address: 0x5A,
      keys: keys
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    // callback([ 0, 1 ]);
    // callback([ 32, 0 ]);
    // callback([ 4, 0 ]);
    // callback([ 128, 0 ]);
    // callback([ 16, 0 ]);
    // callback([ 2, 0 ]);
    // callback([ 64, 0 ]);
    // callback([ 8, 0 ]);
    // callback([ 1, 0 ]);

    callback([1, 0]);
    callback([2, 0]);
    callback([4, 0]);
    callback([8, 0]);
    callback([16, 0]);
    callback([32, 0]);
    callback([64, 0]);
    callback([128, 0]);
    callback([256, 0]);
    callback([512, 0]);
    callback([1024, 0]);
    callback([2048, 0]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  press: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("down", spy);

    // Only 3 are valid.
    callback([64, 0]);
    callback([2, 0]);
    callback([0, 0]);
    callback([4, 0]);
    callback([0, 0]);

    test.equal(spy.callCount, 3);
    test.done();
  },

  multiPress: function(test) {
    test.expect(3);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("down", spy);

    callback([192, 0]);
    callback([48, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [6, 7]);
    test.deepEqual(spy.lastCall.args[0].which, [4, 5]);

    test.done();
  },

  hold: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("hold", spy);

    callback([64, 0]);
    this.clock.tick(600);
    callback([64, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiHold: function(test) {
    test.expect(3);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("hold", spy);

    callback([192, 0]);
    this.clock.tick(600);
    callback([192, 0]);
    this.clock.tick(600);
    callback([128, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [6, 7]);
    test.deepEqual(spy.lastCall.args[0].which, [7]);

    test.done();
  },

  release: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("release", spy);

    callback([64, 0]);
    callback([0, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiRelease: function(test) {
    test.expect(3);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("release", spy);

    callback([192, 0]);
    callback([128, 0]);
    callback([0, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [6]);
    test.deepEqual(spy.lastCall.args[0].which, [7]);

    test.done();
  },

  sensitivityDefault: function(test) {
    test.expect(26);

    // Defaults
    test.deepEqual(this.keypad.sensitivity.press, Array(12).fill(0.95));
    test.deepEqual(this.keypad.sensitivity.release, Array(12).fill(0.975));

    var register = 0x41;

    for (var i = 0; i < 12; i++) {
      var p = (i * 2) + 9;
      var r = (i * 2) + 9 + 1;
      test.deepEqual(this.i2cWrite.getCall(p).args, [0x5A, register++, 12]);
      test.deepEqual(this.i2cWrite.getCall(r).args, [0x5A, register++, 6]);
    }

    test.done();
  },

  sensitivityFillLow: function(test) {
    test.expect(28);

    // Defaults
    test.deepEqual(this.keypad.sensitivity.press, Array(12).fill(0.95));
    test.deepEqual(this.keypad.sensitivity.release, Array(12).fill(0.975));

    this.i2cWrite.reset();

    // Set custom
    this.keypad = new Keypad({
      board: this.board,
      controller: "MPR121",
      sensitivity: {
        press: 0.5,
        release: 0,
      },
    });

    test.deepEqual(this.keypad.sensitivity.press, Array(12).fill(0.5));
    test.deepEqual(this.keypad.sensitivity.release, Array(12).fill(0));

    var register = 0x41;

    for (var i = 0; i < 12; i++) {
      var p = (i * 2) + 9;
      var r = (i * 2) + 9 + 1;
      test.deepEqual(this.i2cWrite.getCall(p).args, [0x5A, register++, 127]);
      test.deepEqual(this.i2cWrite.getCall(r).args, [0x5A, register++, 255]);
    }

    test.done();
  },

  sensitivityFillHigh: function(test) {
    test.expect(28);

    // Defaults
    test.deepEqual(this.keypad.sensitivity.press, Array(12).fill(0.95));
    test.deepEqual(this.keypad.sensitivity.release, Array(12).fill(0.975));

    this.i2cWrite.reset();

    // Set custom
    this.keypad = new Keypad({
      board: this.board,
      controller: "MPR121",
      sensitivity: {
        press: 1,
        release: 0.9,
      },
    });

    test.deepEqual(this.keypad.sensitivity.press, Array(12).fill(1));
    test.deepEqual(this.keypad.sensitivity.release, Array(12).fill(0.9));

    var register = 0x41;

    for (var i = 0; i < 12; i++) {
      var p = (i * 2) + 9;
      var r = (i * 2) + 9 + 1;
      test.deepEqual(this.i2cWrite.getCall(p).args, [0x5A, register++, 0]);
      test.deepEqual(this.i2cWrite.getCall(r).args, [0x5A, register++, 25]);
    }

    test.done();
  },

  sensitivityExplicit: function(test) {
    test.expect(28);

    // Defaults
    test.deepEqual(this.keypad.sensitivity.press, Array(12).fill(0.95));
    test.deepEqual(this.keypad.sensitivity.release, Array(12).fill(0.975));

    this.i2cWrite.reset();

    // Set a custom
    this.keypad = new Keypad({
      board: this.board,
      controller: "MPR121",
      sensitivity: [{
        press: 1,
        release: 0.5,
      }, {
        press: 1,
        release: 0.5,
      }, ],
    });

    test.deepEqual(
      this.keypad.sensitivity.press, [1, 1, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95, 0.95]
    );
    test.deepEqual(
      this.keypad.sensitivity.release, [0.5, 0.5, 0.975, 0.975, 0.975, 0.975, 0.975, 0.975, 0.975, 0.975, 0.975, 0.975]
    );

    var register = 0x41;

    for (var i = 0; i < 12; i++) {
      var p = (i * 2) + 9;
      var r = (i * 2) + 9 + 1;

      if (i < 2) {
        test.deepEqual(this.i2cWrite.getCall(p).args, [0x5A, register++, 0]);
        test.deepEqual(this.i2cWrite.getCall(r).args, [0x5A, register++, 127]);
      } else {
        test.deepEqual(this.i2cWrite.getCall(p).args, [0x5A, register++, 12]);
        test.deepEqual(this.i2cWrite.getCall(r).args, [0x5A, register++, 6]);
      }
    }

    test.done();
  },

};


exports["Keypad: MPR121_KEYPAD"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = sinon.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");

    this.keypad = new Keypad({
      controller: "MPR121_KEYPAD",
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
      controller: "MPR121_KEYPAD",
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
    test.expect(11);

    test.equal(this.i2cConfig.callCount, 1);
    // 16 settings
    // 24 Thresholds
    test.equal(this.i2cWrite.callCount, 40);

    test.deepEqual(this.i2cWrite.getCall(0).args, [0x5A, mpr121.MPR121_SOFTRESET, 0x63]);
    test.deepEqual(this.i2cWrite.getCall(1).args, [0x5A, mpr121.MHD_RISING, 0x01]);
    test.deepEqual(this.i2cWrite.getCall(2).args, [0x5A, mpr121.NHD_AMOUNT_RISING, 0x01]);
    test.deepEqual(this.i2cWrite.getCall(3).args, [0x5A, mpr121.NCL_RISING, 0x00]);
    test.deepEqual(this.i2cWrite.getCall(4).args, [0x5A, mpr121.FDL_RISING, 0x00]);
    test.deepEqual(this.i2cWrite.getCall(5).args, [0x5A, mpr121.MHD_FALLING, 0x01]);
    test.deepEqual(this.i2cWrite.getCall(6).args, [0x5A, mpr121.NHD_AMOUNT_FALLING, 0x01]);
    test.deepEqual(this.i2cWrite.getCall(7).args, [0x5A, mpr121.NCL_FALLING, 0xFF]);
    test.deepEqual(this.i2cWrite.getCall(8).args, [0x5A, mpr121.FDL_FALLING, 0x02]);

    test.done();
  },

  keysDefault: function(test) {
    test.expect(12);

    var keys = Array.from({
      length: 12
    }, function(_, index) {
      return index + 1;
    });
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121_KEYPAD",
      address: 0x5A
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([8, 0]);
    callback([128, 0]);
    callback([2048, 0]);
    callback([4, 0]);
    callback([64, 0]);
    callback([1024, 0]);
    callback([2, 0]);
    callback([32, 0]);
    callback([512, 0]);
    callback([1, 0]);
    callback([16, 0]);
    callback([256, 0]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols: function(test) {
    test.expect(12);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121_KEYPAD",
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

    callback([8, 0]);
    callback([128, 0]);
    callback([0, 8]);
    callback([4, 0]);
    callback([64, 0]);
    callback([0, 4]);
    callback([2, 0]);
    callback([32, 0]);
    callback([0, 2]);
    callback([1, 0]);
    callback([16, 0]);
    callback([0, 1]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList: function(test) {
    test.expect(12);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "MPR121_KEYPAD",
      address: 0x5A,
      keys: keys
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([8, 0]);
    callback([128, 0]);
    callback([0, 8]);
    callback([4, 0]);
    callback([64, 0]);
    callback([0, 4]);
    callback([2, 0]);
    callback([32, 0]);
    callback([0, 2]);
    callback([1, 0]);
    callback([16, 0]);
    callback([0, 1]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  press: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("down", spy);

    // Only 3 are valid.
    callback([64, 0]);
    callback([2, 0]);
    callback([0, 0]);
    callback([4, 0]);
    callback([0, 0]);

    test.equal(spy.callCount, 3);
    test.done();
  },

  multiPress: function(test) {
    test.expect(3);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("down", spy);

    callback([65, 0]);
    callback([7, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [5, 10]);
    test.deepEqual(spy.lastCall.args[0].which, [4, 7]);

    test.done();
  },

  hold: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("hold", spy);

    callback([64, 0]);
    this.clock.tick(600);
    callback([64, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiHold: function(test) {
    test.expect(3);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("hold", spy);

    callback([3, 0]);
    this.clock.tick(600);
    callback([3, 0]);
    this.clock.tick(600);
    callback([2, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [7, 10]);
    test.deepEqual(spy.lastCall.args[0].which, [7]);

    test.done();
  },

  release: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("release", spy);

    callback([64, 0]);
    callback([0, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiRelease: function(test) {
    // test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("release", spy);

    callback([3, 0]);
    callback([2, 0]);
    callback([1, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [10]);
    test.deepEqual(spy.lastCall.args[0].which, [7]);

    test.done();
  },

};


exports["Keypad: QTOUCH"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = sinon.spy(MockFirmata.prototype, "i2cRead");

    this.keypad = new Keypad({
      controller: "QTOUCH",
      address: 0x1B,
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
      controller: "QTOUCH",
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
    test.equal(this.i2cRead.callCount, 1);

    test.done();
  },

  keysDefault: function(test) {
    test.expect(7);

    var keys = Array.from({
      length: 7
    }, function(_, index) {
      return index;
    });
    var keypad = new five.Keypad({
      board: this.board,
      controller: "QTOUCH",
      address: 0x1B
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([1]);
    callback([2]);
    callback([4]);
    callback([8]);
    callback([16]);
    callback([32]);
    callback([64]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols: function(test) {
    test.expect(7);

    var keys = ["!", "@", "#", "$", "%", "^", "&"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "QTOUCH",
      address: 0x1B,
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&"],
      ]
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([1]);
    callback([2]);
    callback([4]);
    callback([8]);
    callback([16]);
    callback([32]);
    callback([64]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList: function(test) {
    test.expect(7);

    var keys = ["!", "@", "#", "$", "%", "^", "&"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "QTOUCH",
      address: 0x1B,
      keys: keys
    });
    var callback = this.i2cRead.getCall(1).args[3];
    var spy = sinon.spy();

    keypad.on("down", spy);

    callback([1]);
    callback([2]);
    callback([4]);
    callback([8]);
    callback([16]);
    callback([32]);
    callback([64]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  press: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("down", spy);

    // Only 3 are valid.
    callback([64]);
    callback([2]);
    callback([4]);
    callback([4]);
    callback([4]);

    test.equal(spy.callCount, 3);
    test.done();
  },

  hold: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("hold", spy);

    callback([64]);
    this.clock.tick(600);
    callback([64]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  release: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[3];
    var spy = sinon.spy();

    this.keypad.on("release", spy);

    callback([64]);
    callback([0]);

    test.equal(spy.callCount, 1);
    test.done();
  },
};


exports["Keypad: 3X4_I2C_NANO_BACKPACK"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.keypad = new Keypad({
      controller: "3X4_I2C_NANO_BACKPACK",
      address: 0x0A,
      board: this.board
    });

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

    new Keypad({
      controller: "3X4_I2C_NANO_BACKPACK",
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
    test.equal(this.i2cRead.callCount, 1);

    test.done();
  },

  keysDefault: function(test) {
    test.expect(12);

    var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "3X4_I2C_NANO_BACKPACK",
      address: 0x0A
    });
    var callback = this.i2cRead.getCall(1).args[2];
    var spy = this.sandbox.spy();

    keypad.on("down", spy);

    callback([0, 1]);
    callback([0, 2]);
    callback([0, 4]);
    callback([0, 8]);
    callback([0, 16]);
    callback([0, 32]);
    callback([0, 64]);
    callback([0, 128]);
    callback([1, 0]);
    callback([2, 0]);
    callback([4, 0]);
    callback([8, 0]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols: function(test) {
    test.expect(12);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "3X4_I2C_NANO_BACKPACK",
      address: 0x0A,
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&", "-", "+"],
        ["_", "=", ":"]
      ]
    });
    var callback = this.i2cRead.getCall(1).args[2];
    var spy = this.sandbox.spy();

    keypad.on("down", spy);

    callback([0, 1]);
    callback([0, 2]);
    callback([0, 4]);
    callback([0, 8]);
    callback([0, 16]);
    callback([0, 32]);
    callback([0, 64]);
    callback([0, 128]);
    callback([1, 0]);
    callback([2, 0]);
    callback([4, 0]);
    callback([8, 0]);


    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList: function(test) {
    test.expect(12);

    var keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"];
    var keypad = new five.Keypad({
      board: this.board,
      controller: "3X4_I2C_NANO_BACKPACK",
      address: 0x0A,
      keys: keys
    });
    var callback = this.i2cRead.getCall(1).args[2];
    var spy = this.sandbox.spy();

    keypad.on("down", spy);

    callback([0, 1]);
    callback([0, 2]);
    callback([0, 4]);
    callback([0, 8]);
    callback([0, 16]);
    callback([0, 32]);
    callback([0, 64]);
    callback([0, 128]);
    callback([1, 0]);
    callback([2, 0]);
    callback([4, 0]);
    callback([8, 0]);

    keys.forEach(function(key, index) {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  press: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[2];
    var spy = this.sandbox.spy();

    this.keypad.on("down", spy);


    // Only 3 are valid.
    callback([0, 1]);
    callback([0, 20]);
    callback([0, 4]);
    callback([0, 10]);
    callback([0, 8]);

    test.equal(spy.callCount, 3);
    test.done();
  },

  multiPress: function(test) {
    test.expect(3);

    var callback = this.i2cRead.getCall(0).args[2];
    var spy = sinon.spy();

    this.keypad.on("down", spy);

    callback([0, 3]);
    callback([12, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [1, 2]);
    test.deepEqual(spy.lastCall.args[0].which, [0, "#"]);

    test.done();
  },


  hold: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[2];
    var spy = this.sandbox.spy();

    this.keypad.on("hold", spy);

    callback([0, 8]);
    this.clock.tick(600);
    callback([0, 8]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiHold: function(test) {
    test.expect(3);

    var callback = this.i2cRead.getCall(0).args[2];
    var spy = this.sandbox.spy();

    this.keypad.on("hold", spy);

    callback([0, 3]);
    this.clock.tick(600);
    callback([0, 3]);
    this.clock.tick(600);
    callback([0, 1]);


    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [1, 2]);
    test.deepEqual(spy.lastCall.args[0].which, [1]);

    test.done();
  },

  release: function(test) {
    test.expect(1);

    var callback = this.i2cRead.getCall(0).args[2];
    var spy = this.sandbox.spy();

    this.keypad.on("release", spy);

    callback([0, 1]);
    callback([0, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiRelease: function(test) {
    test.expect(3);

    var callback = this.i2cRead.getCall(0).args[2];
    var spy = this.sandbox.spy();

    this.keypad.on("release", spy);

    callback([0, 3]);
    callback([0, 1]);
    callback([0, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [2]);
    test.deepEqual(spy.lastCall.args[0].which, [1]);

    test.done();
  },
};
