require("./common/bootstrap");

const mpr121 = require("../lib/definitions/mpr121");

exports["Keypad: Analog"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", fn => fn);
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.keypad = new Keypad({
      pin: "A1",
      length: 16,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  invalid(test) {
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

  keysDefault(test) {
    test.expect(12);

    const keys = Array.from({
      length: 12
    }, (_, index) => index);
    const keypad = new Keypad({
      board: this.board,
      pin: "A0",
      length: 12
    });
    const callback = this.analogRead.getCall(1).args[1];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols(test) {
    test.expect(16);

    const keys = ["1", "!", "@", "#", "2", "$", "%", "^", "3", "&", "-", "+", "4", "<", ">", "?"];
    const keypad = new Keypad({
      board: this.board,
      pin: "A0",
      keys: [
        ["1", "!", "@", "#"],
        ["2", "$", "%", "^"],
        ["3", "&", "-", "+"],
        ["4", "<", ">", "?"],
      ]
    });
    const callback = this.analogRead.getCall(1).args[1];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList(test) {
    test.expect(16);

    const keys = ["1", "!", "@", "#", "2", "$", "%", "^", "3", "&", "-", "+", "4", "<", ">", "?"];
    const keypad = new Keypad({
      board: this.board,
      pin: "A0",
      keys
    });
    const callback = this.analogRead.getCall(1).args[1];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },
  press(test) {
    test.expect(1);

    const callback = this.analogRead.getCall(0).args[1];
    const spy = this.sandbox.spy();

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

  hold(test) {
    test.expect(1);

    const callback = this.analogRead.getCall(0).args[1];
    const spy = this.sandbox.spy();

    this.keypad.on("hold", spy);

    callback(403);
    this.clock.tick(600);
    callback(403);

    test.equal(spy.callCount, 1);
    test.done();
  },

  release(test) {
    test.expect(1);

    const callback = this.analogRead.getCall(0).args[1];
    const spy = this.sandbox.spy();

    this.keypad.on("release", spy);

    callback(403);
    callback(0);

    test.equal(spy.callCount, 1);
    test.done();
  },

  context(test) {
    test.expect(1);

    const callback = this.analogRead.getCall(0).args[1];
    const keypad = this.keypad;

    this.keypad.on("press", function() {
      test.equal(this, keypad);
      test.done();
    });

    callback(403);
  },

};

exports["Keypad: VKey"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", fn => fn);
    this.clock = this.sandbox.useFakeTimers();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.keypad = new Keypad({
      controller: "VKEY",
      pin: "A1",
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  validOperatingVoltage(test) {
    test.expect(16);

    const priv = this.sandbox.spy(Map.prototype, "set");
    let state;

    // Defaults to 5V, does not throw
    test.doesNotThrow(() => {
      new Keypad({
        board: this.board,
        controller: "VKEY",
        pin: "A0",
      });
    });

    state = priv.getCall(0).args[1];

    test.equal(priv.callCount, 1);
    test.deepEqual(state.scale, [ 17, 40, 496 ]);

    // Explicitly 5V, does not throw
    test.doesNotThrow(() => {
      new Keypad({
        board: this.board,
        controller: "VKEY",
        pin: "A0",
        aref: 5,
      });
    });

    state = priv.getCall(1).args[1];

    test.equal(priv.callCount, 2);
    test.deepEqual(state.scale, [ 17, 40, 496 ]);


    // Explicitly 3.3V, does not throw
    test.doesNotThrow(() => {
      new Keypad({
        board: this.board,
        controller: "VKEY",
        pin: "A0",
        aref: 3.3,
      });
    });

    state = priv.getCall(2).args[1];

    test.equal(priv.callCount, 3);
    test.deepEqual(state.scale, [ 26, 58, 721 ]);


    // Provided by plugin 3.3V, does not throw
    test.doesNotThrow(() => {
      this.board.io.aref = 3.3;
      new Keypad({
        board: this.board,
        controller: "VKEY",
        pin: "A0"
      });

      delete this.board.io.aref;
    });

    state = priv.getCall(3).args[1];

    test.equal(priv.callCount, 4);
    test.deepEqual(state.scale, [ 26, 58, 721 ]);


    // Explicitly out of range, throws
    test.doesNotThrow(() => {
      new Keypad({
        board: this.board,
        controller: "VKEY",
        pin: "A0",
        aref: 3,
      });
    }, RangeError);

    // Explicitly out of range, throws
    test.doesNotThrow(() => {
      new Keypad({
        board: this.board,
        controller: "VKEY",
        pin: "A0",
        aref: 4,
      });
    }, RangeError);

    // Explicitly out of range, throws
    test.doesNotThrow(() => {
      new Keypad({
        board: this.board,
        controller: "VKEY",
        pin: "A0",
        aref: 6,
      });
    }, RangeError);


    // Explicitly out of range from Plugin, throws
    test.doesNotThrow(() => {
      this.board.io.aref = 6;
      new Keypad({
        board: this.board,
        controller: "VKEY",
        pin: "A0",
      });
      delete this.board.io.aref;
    }, RangeError);

    test.done();
  },

  keysDefault(test) {
    test.expect(12);

    const keys = Array.from({
      length: 12
    }, (_, index) => index + 1);
    const keypad = new Keypad({
      board: this.board,
      controller: "VKEY",
      pin: "A0",
    });
    const callback = this.analogRead.getCall(1).args[1];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols(test) {
    test.expect(12);

    const keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "<", ">", "?"];
    const keypad = new Keypad({
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
    const callback = this.analogRead.getCall(1).args[1];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList(test) {
    test.expect(12);

    const keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "<", ">", "?"];
    const keypad = new Keypad({
      board: this.board,
      controller: "VKEY",
      pin: "A0",
      keys
    });
    const callback = this.analogRead.getCall(1).args[1];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  press(test) {
    test.expect(1);

    const callback = this.analogRead.getCall(0).args[1];
    const spy = this.sandbox.spy();

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

  hold(test) {
    test.expect(1);

    const callback = this.analogRead.getCall(0).args[1];
    const spy = this.sandbox.spy();

    this.keypad.on("hold", spy);

    callback(403);
    this.clock.tick(600);
    callback(403);

    test.equal(spy.callCount, 1);
    test.done();
  },

  release(test) {
    test.expect(1);

    const callback = this.analogRead.getCall(0).args[1];
    const spy = this.sandbox.spy();

    this.keypad.on("release", spy);

    callback(403);
    callback(0);

    test.equal(spy.callCount, 1);
    test.done();
  },

  context(test) {
    test.expect(1);

    const callback = this.analogRead.getCall(0).args[1];
    const keypad = this.keypad;

    this.keypad.on("press", function() {
      test.equal(this, keypad);
      test.done();
    });
    callback(403);

  }
};

exports["Keypad: MPR121"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", fn => fn);
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.keypad = new Keypad({
      controller: "MPR121",
      address: 0x5A,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Keypad({
      controller: "MPR121",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  initialize(test) {
    test.expect(18);

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


    test.deepEqual(this.i2cWrite.getCall(33).args, [0x5A, mpr121.FILTER_CONFIG, 0x13]);
    test.deepEqual(this.i2cWrite.getCall(34).args, [0x5A, mpr121.AFE_CONFIGURATION, 0x80]);

    // Bypassing auto calibration by setting Vdd range and target manually
    test.deepEqual(this.i2cWrite.getCall(35).args, [0x5A, mpr121.AUTO_CONFIG_CONTROL_0, 0x8F]);
    test.deepEqual(this.i2cWrite.getCall(36).args, [0x5A, mpr121.AUTO_CONFIG_USL, 0xE4]);
    test.deepEqual(this.i2cWrite.getCall(37).args, [0x5A, mpr121.AUTO_CONFIG_LSL, 0x94]);
    test.deepEqual(this.i2cWrite.getCall(38).args, [0x5A, mpr121.AUTO_CONFIG_TARGET_LEVEL, 0xCD]);

    // Electrode sensor "run mode"
    test.deepEqual(this.i2cWrite.getCall(39).args, [0x5A, mpr121.ELECTRODE_CONFIG, 0xCC]);

    test.done();
  },

  keysDefault(test) {
    test.expect(9);

    const keys = Array.from({
      length: 9
    }, (_, index) => index);
    const keypad = new Keypad({
      board: this.board,
      controller: "MPR121",
      address: 0x5A
    });
    const callback = this.i2cRead.getCall(1).args[3];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols(test) {
    test.expect(9);

    const keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+"];
    const keypad = new Keypad({
      board: this.board,
      controller: "MPR121",
      address: 0x5A,
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&", "-", "+"],
      ]
    });
    const callback = this.i2cRead.getCall(1).args[3];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList(test) {
    test.expect(9);

    const keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+"];
    const keypad = new Keypad({
      board: this.board,
      controller: "MPR121",
      address: 0x5A,
      keys
    });
    const callback = this.i2cRead.getCall(1).args[3];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  press(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

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

  multiPress(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

    this.keypad.on("down", spy);

    callback([192, 0]);
    callback([48, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [6, 7]);
    test.deepEqual(spy.lastCall.args[0].which, [4, 5]);

    test.done();
  },

  hold(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

    this.keypad.on("hold", spy);

    callback([64, 0]);
    this.clock.tick(600);
    callback([64, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiHold(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

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

  release(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

    this.keypad.on("release", spy);

    callback([64, 0]);
    callback([0, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiRelease(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

    this.keypad.on("release", spy);

    callback([192, 0]);
    callback([128, 0]);
    callback([0, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [6]);
    test.deepEqual(spy.lastCall.args[0].which, [7]);

    test.done();
  },

  sensitivityDefault(test) {
    test.expect(26);

    // Defaults
    test.deepEqual(this.keypad.sensitivity.press, Array(12).fill(0.95));
    test.deepEqual(this.keypad.sensitivity.release, Array(12).fill(0.975));

    let register = 0x41;

    for (let i = 0; i < 12; i++) {
      const p = (i * 2) + 9;
      const r = (i * 2) + 9 + 1;
      test.deepEqual(this.i2cWrite.getCall(p).args, [0x5A, register++, 12]);
      test.deepEqual(this.i2cWrite.getCall(r).args, [0x5A, register++, 6]);
    }

    test.done();
  },

  sensitivityFillLow(test) {
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

    let register = 0x41;

    for (let i = 0; i < 12; i++) {
      const p = (i * 2) + 9;
      const r = (i * 2) + 9 + 1;
      test.deepEqual(this.i2cWrite.getCall(p).args, [0x5A, register++, 127]);
      test.deepEqual(this.i2cWrite.getCall(r).args, [0x5A, register++, 255]);
    }

    test.done();
  },

  sensitivityFillHigh(test) {
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

    let register = 0x41;

    for (let i = 0; i < 12; i++) {
      const p = (i * 2) + 9;
      const r = (i * 2) + 9 + 1;
      test.deepEqual(this.i2cWrite.getCall(p).args, [0x5A, register++, 0]);
      test.deepEqual(this.i2cWrite.getCall(r).args, [0x5A, register++, 25]);
    }

    test.done();
  },

  sensitivityExplicit(test) {
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

    let register = 0x41;

    for (let i = 0; i < 12; i++) {
      const p = (i * 2) + 9;
      const r = (i * 2) + 9 + 1;

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
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", fn => fn);
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.keypad = new Keypad({
      controller: "MPR121_KEYPAD",
      address: 0x5A,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Keypad({
      controller: "MPR121_KEYPAD",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  initialize(test) {
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

  keysDefault(test) {
    test.expect(12);

    const keys = Array.from({
      length: 12
    }, (_, index) => index + 1);
    const keypad = new Keypad({
      board: this.board,
      controller: "MPR121_KEYPAD",
      address: 0x5A
    });
    const callback = this.i2cRead.getCall(1).args[3];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols(test) {
    test.expect(12);

    const keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"];
    const keypad = new Keypad({
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
    const callback = this.i2cRead.getCall(1).args[3];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList(test) {
    test.expect(12);

    const keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"];
    const keypad = new Keypad({
      board: this.board,
      controller: "MPR121_KEYPAD",
      address: 0x5A,
      keys
    });
    const callback = this.i2cRead.getCall(1).args[3];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  press(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

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

  multiPress(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

    this.keypad.on("down", spy);

    callback([65, 0]);
    callback([7, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [5, 10]);
    test.deepEqual(spy.lastCall.args[0].which, [4, 7]);

    test.done();
  },

  hold(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

    this.keypad.on("hold", spy);

    callback([64, 0]);
    this.clock.tick(600);
    callback([64, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiHold(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

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

  release(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

    this.keypad.on("release", spy);

    callback([64, 0]);
    callback([0, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiRelease(test) {
    // test.expect(1);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

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
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", fn => fn);
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.keypad = new Keypad({
      controller: "QTOUCH",
      address: 0x1B,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Keypad({
      controller: "QTOUCH",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  initialize(test) {
    test.expect(2);

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(this.i2cRead.callCount, 1);

    test.done();
  },

  keysDefault(test) {
    test.expect(7);

    const keys = Array.from({
      length: 7
    }, (_, index) => index);
    const keypad = new Keypad({
      board: this.board,
      controller: "QTOUCH",
      address: 0x1B
    });
    const callback = this.i2cRead.getCall(1).args[3];
    const spy = this.sandbox.spy();

    keypad.on("down", spy);

    callback([1]);
    callback([2]);
    callback([4]);
    callback([8]);
    callback([16]);
    callback([32]);
    callback([64]);

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols(test) {
    test.expect(7);

    const keys = ["!", "@", "#", "$", "%", "^", "&"];
    const keypad = new Keypad({
      board: this.board,
      controller: "QTOUCH",
      address: 0x1B,
      keys: [
        ["!", "@", "#"],
        ["$", "%", "^"],
        ["&"],
      ]
    });
    const callback = this.i2cRead.getCall(1).args[3];
    const spy = this.sandbox.spy();

    keypad.on("down", spy);

    callback([1]);
    callback([2]);
    callback([4]);
    callback([8]);
    callback([16]);
    callback([32]);
    callback([64]);

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList(test) {
    test.expect(7);

    const keys = ["!", "@", "#", "$", "%", "^", "&"];
    const keypad = new Keypad({
      board: this.board,
      controller: "QTOUCH",
      address: 0x1B,
      keys
    });
    const callback = this.i2cRead.getCall(1).args[3];
    const spy = this.sandbox.spy();

    keypad.on("down", spy);

    callback([1]);
    callback([2]);
    callback([4]);
    callback([8]);
    callback([16]);
    callback([32]);
    callback([64]);

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  press(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

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

  hold(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

    this.keypad.on("hold", spy);

    callback([64]);
    this.clock.tick(600);
    callback([64]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  release(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[3];
    const spy = this.sandbox.spy();

    this.keypad.on("release", spy);

    callback([64]);
    callback([0]);

    test.equal(spy.callCount, 1);
    test.done();
  },
};


exports["Keypad: 3X4_I2C_NANO_BACKPACK"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", fn => fn);
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

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Keypad({
      controller: "3X4_I2C_NANO_BACKPACK",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  initialize(test) {
    test.expect(2);

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(this.i2cRead.callCount, 1);

    test.done();
  },

  keysDefault(test) {
    test.expect(12);

    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"];
    const keypad = new Keypad({
      board: this.board,
      controller: "3X4_I2C_NANO_BACKPACK",
      address: 0x0A
    });
    const callback = this.i2cRead.getCall(1).args[2];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols(test) {
    test.expect(12);

    const keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"];
    const keypad = new Keypad({
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
    const callback = this.i2cRead.getCall(1).args[2];
    const spy = this.sandbox.spy();

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


    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList(test) {
    test.expect(12);

    const keys = ["!", "@", "#", "$", "%", "^", "&", "-", "+", "_", "=", ":"];
    const keypad = new Keypad({
      board: this.board,
      controller: "3X4_I2C_NANO_BACKPACK",
      address: 0x0A,
      keys
    });
    const callback = this.i2cRead.getCall(1).args[2];
    const spy = this.sandbox.spy();

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

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  press(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

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

  multiPress(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

    this.keypad.on("down", spy);

    callback([0, 3]);
    callback([12, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [1, 2]);
    test.deepEqual(spy.lastCall.args[0].which, [0, "#"]);

    test.done();
  },


  hold(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

    this.keypad.on("hold", spy);

    callback([0, 8]);
    this.clock.tick(600);
    callback([0, 8]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiHold(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

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

  release(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

    this.keypad.on("release", spy);

    callback([0, 1]);
    callback([0, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiRelease(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

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

exports["Keypad: 4X4_I2C_NANO_BACKPACK"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", fn => fn);
    this.clock = this.sandbox.useFakeTimers();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.keypad = new Keypad({
      controller: "4X4_I2C_NANO_BACKPACK",
      address: 0x0A,
      board: this.board
    });

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new Keypad({
      controller: "4X4_I2C_NANO_BACKPACK",
      address: 0xff,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0xff);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },

  initialize(test) {
    test.expect(2);

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(this.i2cRead.callCount, 1);

    test.done();
  },

  keysDefault(test) {
    test.expect(16);

    const keys = [1, 2, 3, "A", 4, 5, 6, "B", 7, 8, 9, "C", "*", 0, "#", "D"];
    const keypad = new Keypad({
      board: this.board,
      controller: "4X4_I2C_NANO_BACKPACK",
      address: 0x0A
    });
    const callback = this.i2cRead.getCall(1).args[2];
    const spy = this.sandbox.spy();

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
    callback([16, 0]);
    callback([32, 0]);
    callback([64, 0]);
    callback([128, 0]);

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysRowsCols(test) {
    test.expect(16);

    const keys = ["!", "@", "#", "?", "$", "%", "^", "≠", "&", "-", "+", ";", "_", "=", ":", "¢"];
    const keypad = new Keypad({
      board: this.board,
      controller: "4X4_I2C_NANO_BACKPACK",
      address: 0x0A,
      keys: [
        ["!", "@", "#", "?"],
        ["$", "%", "^", "≠"],
        ["&", "-", "+", ";"],
        ["_", "=", ":", "¢"]
      ]
    });
    const callback = this.i2cRead.getCall(1).args[2];
    const spy = this.sandbox.spy();

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
    callback([16, 0]);
    callback([32, 0]);
    callback([64, 0]);
    callback([128, 0]);


    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  keysList(test) {
    test.expect(16);

    const keys = ["!", "@", "#", "?", "$", "%", "^", "≠", "&", "-", "+", ";", "_", "=", ":", "¢"];
    const keypad = new Keypad({
      board: this.board,
      controller: "4X4_I2C_NANO_BACKPACK",
      address: 0x0A,
      keys
    });
    const callback = this.i2cRead.getCall(1).args[2];
    const spy = this.sandbox.spy();

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
    callback([16, 0]);
    callback([32, 0]);
    callback([64, 0]);
    callback([128, 0]);

    keys.forEach((key, index) => {
      test.deepEqual(spy.args[index][0].which, [key]);
    });

    test.done();
  },

  press(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

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

  multiPress(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

    this.keypad.on("down", spy);

    callback([0, 3]);
    callback([96, 0]);

    test.equal(spy.callCount, 2);
    test.deepEqual(spy.firstCall.args[0].which, [1, 2]);
    test.deepEqual(spy.lastCall.args[0].which, [0, "#"]);

    test.done();
  },


  hold(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

    this.keypad.on("hold", spy);

    callback([0, 8]);
    this.clock.tick(600);
    callback([0, 8]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiHold(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

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

  release(test) {
    test.expect(1);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

    this.keypad.on("release", spy);

    callback([0, 1]);
    callback([0, 0]);

    test.equal(spy.callCount, 1);
    test.done();
  },

  multiRelease(test) {
    test.expect(3);

    const callback = this.i2cRead.getCall(0).args[2];
    const spy = this.sandbox.spy();

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
