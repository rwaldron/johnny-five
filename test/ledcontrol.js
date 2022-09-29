require("./common/bootstrap");

exports["LedControl - I2C Matrix Initialization"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    LedControl.purge();
    done();
  },

  fwdOptionsToi2cConfig(test) {
    test.expect(3);

    this.i2cConfig.reset();

    new LedControl({
      controller: "HT16K33",
      address: 0x70,
      bus: "i2c-1",
      board: this.board
    });

    const forwarded = this.i2cConfig.lastCall.args[0];

    test.equal(this.i2cConfig.callCount, 1);
    test.equal(forwarded.address, 0x70);
    test.equal(forwarded.bus, "i2c-1");

    test.done();
  },


  addressSingle(test) {
    test.expect(1);

    const matrix = new LedControl({
      address: 0x70,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(matrix.addresses, [0x70]);

    test.done();
  },
  addressesSingle(test) {
    test.expect(1);

    const matrix = new LedControl({
      addresses: [0x70],
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(matrix.addresses, [0x70]);

    test.done();
  },
  addressesMultiple(test) {
    test.expect(1);

    const matrix = new LedControl({
      addresses: [0x70, 0x71],
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(matrix.addresses, [0x70, 0x71]);

    test.done();
  },
  addressesMultipleInferredByDeviceCount(test) {
    test.expect(1);

    const matrix = new LedControl({
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(matrix.addresses, [0x70, 0x71]);

    test.done();
  },

  addressesExhaustAvailability(test) {
    test.expect(5);

    const a = new LedControl({
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(a.addresses, [0x70, 0x71]);

    const b = new LedControl({
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(b.addresses, [0x72, 0x73]);

    const c = new LedControl({
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(c.addresses, [0x74, 0x75]);

    const d = new LedControl({
      devices: 2,
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    test.deepEqual(d.addresses, [0x76, 0x77]);

    test.throws(() => {
      new LedControl({
        devices: 1,
        controller: "HT16K33",
        isMatrix: true,
        board: this.board
      });
    });

    test.done();
  },

  addressesInvalid(test) {
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

  addressesAvailableByDeviceCount(test) {
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

  addressesAvailableByAddressList(test) {
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

  addressesAndDevicesMissingImpliesOne(test) {
    test.expect(1);

    const a = new LedControl({
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
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");

    this.lc = new LedControl({
      controller: "HT16K33",
      isMatrix: true,
      board: this.board
    });

    this.each = this.sandbox.spy(this.lc, "each");
    this.row = this.sandbox.spy(this.lc, "row");
    done();
  },
  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    LedControl.purge();
    done();
  },
  initialize(test) {
    const expected = [
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
  clearAll(test) {
    test.expect(2);

    const expected = [
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
  on(test) {
    test.expect(1);
    const expected = [
      // oscillator on
      [0x70, [0x21]],
      // blink off
      [0x70, [0x81]],
      // brightness at max
      [0x70, [0xEF]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      // oscillator on
      [0x70, [0x21]]
    ];
    this.lc.on(0);
    test.deepEqual(this.i2cWrite.args, expected);

    test.done();
  },
  off(test) {
    test.expect(1);
    const expected = [
      // oscillator on
      [0x70, [0x21]],
      // blink off
      [0x70, [0x81]],
      // brightness at max
      [0x70, [0xEF]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      // oscillator off
      [0x70, [0x20]]
    ];
    this.lc.off(0);
    test.deepEqual(this.i2cWrite.args, expected);

    test.done();
  },
  brightness(test) {
    test.expect(1);
    const expected = [
      // oscillator on
      [0x70, [0x21]],
      // blink off
      [0x70, [0x81]],
      // brightness at max
      [0x70, [0xEF]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      // min brightness
      [0x70, [0xE0]],
      // max brightness
      [0x70, [0xEF]]
    ];
    this.lc.brightness(0); // set min brightness
    this.lc.brightness(100); // set max brightness
    test.deepEqual(this.i2cWrite.args, expected);

    test.done();
  },

  blink(test) {
    test.expect(2);
    const expected = [
      // oscillator on
      [0x70, [0x21]],
      // blink off
      [0x70, [0x81]],
      // brightness at max
      [0x70, [0xEF]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      // slow blink
      [0x70, [0x80 | 0x01 | 0x06]],
      // normal blink
      [0x70, [0x80 | 0x01 | 0x04]],
      // fast blink
      [0x70, [0x80 | 0x01 | 0x02]],
      // no blink
      [0x70, [0x80 | 0x01 | 0x00]]
    ];
    this.lc.blink("slow");
    this.lc.blink("normal");
    this.lc.blink("fast");
    this.lc.blink(false);
    test.deepEqual(this.i2cWrite.args, expected);

    test.equal(this.lc.blink(null), this.lc);
    test.done();
  },

  ledNoDevice(test) {
    test.expect(3);

    const ledWithDevice = this.sandbox.spy(this.lc, "led");

    this.lc.led(0, 0, 1);

    test.equal(ledWithDevice.callCount, 2);
    test.deepEqual(ledWithDevice.firstCall.args, [0, 0, 1]);
    test.deepEqual(ledWithDevice.lastCall.args, [0, 0, 0, 1]);

    test.done();
  },

  ledInvalidRow(test) {
    test.expect(1);

    const before = this.lc.memory.slice();

    this.lc.led(0, -1, 0, 1);
    this.lc.led(0, 100, 0, 1);

    test.deepEqual(this.lc.memory, before);

    test.done();
  },

  ledInvalidCol(test) {
    test.expect(1);

    const before = this.lc.memory.slice();

    this.lc.led(0, 0, -1, 1);
    this.lc.led(0, 0, 100, 1);

    test.deepEqual(this.lc.memory, before);

    test.done();
  },

  ledRotation(test) {
    test.expect(2);

    const writeDisplay = this.sandbox.stub(this.lc, "writeDisplay");
    let before = this.lc.memory.slice();

    this.lc.rotation = 2;
    this.lc.led(0, 0, 0, 1);

    test.equal(writeDisplay.callCount, 1);

    before = this.lc.memory.slice();

    this.lc.rotation = 3;
    this.lc.led(0, 0, 0, 0);

    test.equal(writeDisplay.callCount, 2);
    test.done();
  },

  ledIsBicolor(test) {
    test.expect(1);

    this.lc = new LedControl({
      controller: "HT16K33",
      isMatrix: true,
      isBicolor: true,
      board: this.board
    });

    const writeDisplay = this.sandbox.stub(this.lc, "writeDisplay");

    this.lc.led(0, 0, 0, LedControl.COLORS.GREEN);
    this.lc.led(0, 0, 0, LedControl.COLORS.YELLOW);
    this.lc.led(0, 0, 0, LedControl.COLORS.RED);
    this.lc.led(0, 0, 0, 0);
    test.equal(writeDisplay.callCount, 4);
    test.done();
  },


  row(test) {
    test.expect(1);

    const expected = [
      // oscillator on
      [0x70, [0x21]],
      // blink off
      [0x70, [0x81]],
      // brightness at max
      [0x70, [0xEF]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      // setting the values
      [0x70, [0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 32, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 32, 0, 32, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 32, 0, 32, 0, 32, 0, 32, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 0, 0, 0, 0]],
      [0x70, [0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 0, 0]],
      [0x70, [0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0, 32, 0]]
    ];

    this.lc.row(0, 1, 255);

    test.deepEqual(this.i2cWrite.args, expected);

    test.done();
  },

  rowNoDevice(test) {
    test.expect(3);

    this.lc.row.reset();

    this.lc.row(0, 1);

    test.equal(this.lc.row.callCount, 2);
    test.deepEqual(this.lc.row.firstCall.args, [0, 1]);
    test.deepEqual(this.lc.row.lastCall.args, [0, 0, 1]);

    test.done();
  },

  column(test) {
    test.expect(1);

    const expected = [
      // oscillator on
      [0x70, [0x21]],
      // blink off
      [0x70, [0x81]],
      // brightness at max
      [0x70, [0xEF]],
      // clear
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      // setting the values
      [0x70, [0, 0, 0, 0, 0, 0, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 0, 0, 0, 0, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 0, 0, 0, 0, 112, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 0, 0, 0, 0, 120, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 0, 0, 0, 0, 124, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 0, 0, 0, 0, 126, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 0, 0, 0, 0, 127, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    ];

    this.lc.column(0, 3, 255);

    test.deepEqual(this.i2cWrite.args, expected);

    test.done();
  },

  draw(test) {
    test.expect(2);

    test.doesNotThrow(() => {
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
    });

    test.throws(() => {
      this.lc.draw([
        "00111100",
      ]);
    });

    test.done();
  },

  drawStringArray(test) {
    test.expect(2);

    const expected = [
      [0, 0, "00111100"],
      [0, 1, "01000010"],
      [0, 2, "10100101"],
      [0, 3, "10000001"],
      [0, 4, "10100101"],
      [0, 5, "10011001"],
      [0, 6, "01000010"],
      [0, 7, "00111100"]
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
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");

    this.lc = new LedControl({
      controller: "HT16K33",
      isMatrix: true,
      is16x8: true,
      isBicolor: false,
      board: this.board
    });
    this.each = this.sandbox.spy(this.lc, "each");
    this.row = this.sandbox.spy(this.lc, "row");
    done();
  },
  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    LedControl.purge();
    done();
  },
  clearAll(test) {
    test.expect(2);
    const expected = [
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
  drawStringArray(test) {
    test.expect(2);

    const expected = [
      [0, 0, "0110011001100110"],
      [0, 1, "1001100110011001"],
      [0, 2, "1000000110000001"],
      [0, 3, "1000000110000001"],
      [0, 4, "0100001001000010"],
      [0, 5, "0010010000100100"],
      [0, 6, "0001100000011000"],
      [0, 7, "0000000000000000"]
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
  row(test) {
    test.expect(1);

    const expected = [
      // oscillator on
      [0x70, [0x21]],
      // blink off
      [0x70, [0x81]],
      // brightness at max
      [0x70, [0xEF]],
      // clear

      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      // setting the values

      [0x70, [0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 64, 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 64, 0, 64, 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 0, 0, 0, 0]],
      [0x70, [0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 0, 0]],
      [0x70, [0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0, 64, 0]]
    ];

    this.lc.row(0, 0, 0xffff);

    test.deepEqual(this.i2cWrite.args, expected);
    test.done();
  },
};

exports["LedControl - Matrix"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();
    this.digitalWrite = this.sandbox.spy(MockFirmata.prototype, "digitalWrite");
    this.shiftOut = this.sandbox.spy(Board.prototype, "shiftOut");


    this.lc = new LedControl({
      pins: {
        data: 2,
        clock: 3,
        cs: 4
      },
      isMatrix: true,
      board: this.board
    });

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
    }];

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


    this.each = this.sandbox.spy(this.lc, "each");
    this.row = this.sandbox.spy(this.lc, "row");
    this.column = this.sandbox.spy(this.lc, "column");
    this.draw = this.sandbox.spy(this.lc, "draw");
    this.on = this.sandbox.spy(this.lc, "on");
    this.off = this.sandbox.spy(this.lc, "off");
    this.scanLimit = this.sandbox.spy(this.lc, "scanLimit");
    this.brightness = this.sandbox.spy(this.lc, "brightness");
    this.clear = this.sandbox.spy(this.lc, "clear");
    this.led = this.sandbox.spy(this.lc, "led");
    this.initialize = this.sandbox.spy(this.lc, "initialize");
    this.send = this.sandbox.spy(this.lc, "send");


    this.digitalWrite.reset();
    this.shiftOut.reset();

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    LedControl.purge();
    done();
  },

  shape(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(({name}) => test.equal(typeof this.lc[name], "function"));
    this.instance.forEach(({name}) => test.notEqual(typeof this.lc[name], "undefined"));


    test.done();
  },

  initialization(test) {
    test.expect(3);

    const expected = [
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

    this.lc = new LedControl({
      pins: {
        data: 2,
        clock: 3,
        latch: 4
      },
      isMatrix: true,
      board: this.board
    });

    test.equal(this.lc.pins.cs, 4);
    test.done();
  },

  device(test) {
    test.expect(1);

    test.notEqual(this.lc.device(0), undefined);
    test.done();
  },

  returns(test) {
    test.expect(this.proto.length);

    this.proto.forEach(function({name, args}) {
      test.equal(this[name].apply(this, args), this);
    }, this.lc);

    test.done();
  },

  dimensions(test) {
    test.expect(8);

    this.matrix = {};

    this.matrix["16x8"] = new LedControl({
      pins: {
        data: 2,
        clock: 3,
        cs: 4
      },
      isMatrix: true,
      dims: "16x8",
      board: this.board
    });

    test.equal(this.matrix["16x8"].rows, 16);
    test.equal(this.matrix["16x8"].columns, 8);


    this.matrix["8x16"] = new LedControl({
      pins: {
        data: 5,
        clock: 6,
        cs: 7
      },
      isMatrix: true,
      dims: "8x16",
      board: this.board
    });

    test.equal(this.matrix["8x16"].rows, 8);
    test.equal(this.matrix["8x16"].columns, 16);


    this.matrix["8x8"] = new LedControl({
      pins: {
        data: 8,
        clock: 9,
        cs: 10
      },
      isMatrix: true,
      dims: "8x8",
      board: this.board
    });

    test.equal(this.matrix["8x8"].rows, 8);
    test.equal(this.matrix["8x8"].columns, 8);


    this.matrix.array = new LedControl({
      pins: {
        data: 8,
        clock: 9,
        cs: 10
      },
      isMatrix: true,
      dims: [16, 8],
      board: this.board
    });

    test.equal(this.matrix.array.rows, 16);
    test.equal(this.matrix.array.columns, 8);


    test.done();
  },

  "dimensions: invalid string": function(test) {
    test.expect(1);
    test.throws(() => {
      new LedControl({
        pins: {
          data: 2,
          clock: 3,
          cs: 4
        },
        isMatrix: true,
        dims: "17x9",
        board: this.board
      });
    });
    test.done();
  },

  "dimensions: invalid array": function(test) {
    test.expect(1);
    test.throws(() => {
      new LedControl({
        pins: {
          data: 2,
          clock: 3,
          cs: 4
        },
        isMatrix: true,
        dims: [ 19, 7 ],
        board: this.board
      });
    });
    test.done();
  },

  on(test) {
    test.expect(1);

    this.lc.on(0);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 12],
      [2, 3, 1]
    ]);

    test.done();
  },

  onAll(test) {
    test.expect(2);

    this.lc.on();
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 12],
      [2, 3, 1]
    ]);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  off(test) {
    test.expect(1);

    this.lc.off(0);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 12],
      [2, 3, 0]
    ]);

    test.done();
  },

  offAll(test) {
    test.expect(2);

    this.lc.off();
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 12],
      [2, 3, 0]
    ]);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  scanLimit(test) {
    test.expect(1);

    this.lc.scanLimit(0, 8);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 11],
      [2, 3, 8]
    ]);

    test.done();
  },

  scanLimitAll(test) {
    test.expect(2);

    this.lc.scanLimit(8);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 11],
      [2, 3, 8]
    ]);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  brightness(test) {
    test.expect(1);

    this.lc.brightness(0, 100);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 10],
      [2, 3, 15]
    ]);


    test.done();
  },

  brightnessAll(test) {
    test.expect(2);

    this.lc.brightness(100);
    test.deepEqual(this.shiftOut.args, [
      [2, 3, 10],
      [2, 3, 15]
    ]);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  clear(test) {
    test.expect(1);

    const expected = [
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

  clearAll(test) {
    test.expect(2);

    const expected = [
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

  row(test) {
    test.expect(1);

    const expected = [
      [2, 3, 2],
      [2, 3, 255]
    ];

    this.lc.row(0, 1, 255);

    test.deepEqual(this.shiftOut.args, expected);

    test.done();
  },

  rowAll(test) {
    test.expect(2);

    const expected = [
      [2, 3, 2],
      [2, 3, 255]
    ];

    this.lc.row(1, 255);

    test.deepEqual(this.shiftOut.args, expected);
    test.equal(this.each.callCount, 1);

    test.done();
  },

  column(test) {
    test.expect(1);

    const expected = [
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

  columnAll(test) {
    test.expect(2);

    const expected = [
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


  led(test) {
    test.expect(2);

    let before = this.lc.memory.slice();

    this.lc.led(0, 0, 0, 1);

    test.notDeepEqual(this.lc.memory, before);

    before = this.lc.memory.slice();

    this.lc.led(0, 0, 0, 0);

    test.notDeepEqual(this.lc.memory, before);

    test.done();
  },

  ledOutOfBounds(test) {
    test.expect(3);

    const before = this.lc.memory.slice();

    this.lc.led(0, 0, 0, 1);

    test.notDeepEqual(this.lc.memory, before);
    test.equal(this.lc.led(0, -1, -1, 1), this.lc);
    test.equal(this.lc.led(0, 0, 1000, 1), this.lc);

    test.done();
  },

  ledNoDevice(test) {
    test.expect(3);

    this.lc.led(0, 0, 1);

    test.equal(this.lc.led.callCount, 2);
    test.deepEqual(this.lc.led.firstCall.args, [0, 0, 1]);
    test.deepEqual(this.lc.led.lastCall.args, [0, 0, 0, 1]);

    test.done();
  },

  ledRotation(test) {
    test.expect(2);

    let before = this.lc.memory.slice();

    this.lc.rotation = 2;
    this.lc.led(0, 1, 1, 1);

    test.notDeepEqual(this.lc.memory, before);

    before = this.lc.memory.slice();

    this.lc.rotation = 3;
    this.lc.led(0, 2, 2, 1);

    test.notDeepEqual(this.lc.memory, before);
    test.done();
  },

  drawSingleChar(test) {
    test.expect(2);

    const expected = [
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

  drawByteArray(test) {
    test.expect(2);

    const expected = [
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

  drawStringArray(test) {
    test.expect(2);

    const expected = [
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


  send(test) {
    test.expect(2);

    const expected = [
      [2, 3, 10],
      [2, 3, 0]
    ];

    this.digitalWrite.reset();
    this.shiftOut.reset();

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

  sendError(test) {
    test.expect(1);

    try {
      this.lc.send();
    } catch (e) {
      test.equal(e.message, "`send` expects three arguments: device, opcode, data");
    }

    test.done();
  },

  printThrows(test) {
    test.expect(1);

    test.throws(() => {
      this.lc.print("");
    });

    test.done();
  },


  // TODO: digit, char
  // TODO: Statics
  //  - OP
  //  - DEFAULTS
  //  - CHAR_TABLE
  //  - MATRIX_CHARS
};

exports["Led.Matrix => LedControl"] = {
  setUp(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    LedControl.purge();
    done();
  },

  wrapper(test) {
    test.expect(2);

    const matrix = new Led.Matrix({
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

  statics(test) {
    const keys = Object.keys(LedControl);

    test.expect(keys.length);

    keys.forEach(key => {
      test.equal(Led.Matrix[key], LedControl[key]);
    });

    test.done();
  }
};

exports["LedControl - Digits"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.lc = new Led.Digits({
      pins: {
        data: 2,
        clock: 3,
        cs: 4
      },
      board: this.board
    });

    this.digitalWrite = this.sandbox.spy(this.board, "digitalWrite");
    this.shiftOut = this.sandbox.spy(this.board, "shiftOut");
    this.each = this.sandbox.spy(this.lc, "each");
    this.send = this.sandbox.spy(this.lc, "send");

    done();
  },

  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    LedControl.purge();
    done();
  },

  initialization(test) {
    test.expect(3);

    const expected = [
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

  digit(test) {
    test.expect(1);

    this.lc.digit(0, 0, 1);
    test.deepEqual(this.send.args, [
      [0, 8, 48]
    ]);

    test.done();
  },
  digitDigitWithDecimal(test) {
    test.expect(1);

    this.lc.digit(0, 0, "1.");
    test.deepEqual(this.send.args, [
      [0, 8, 176]
    ]);

    test.done();
  },
  draw(test) {
    test.expect(1);

    this.lc.draw(0, 0, 1);
    test.deepEqual(this.send.args, [
      [0, 8, 48]
    ]);

    test.done();
  },
  drawAlphaWithDecimal(test) {
    test.expect(1);

    this.lc.draw(0, 0, "1.");
    test.deepEqual(this.send.args, [
      [0, 8, 176]
    ]);

    test.done();
  },
  digitAll(test) {
    test.expect(1);

    this.lc.digit(0, 1);
    test.deepEqual(this.send.args, [
      [0, 8, 48]
    ]);

    test.done();
  },
  digitDigitWithDecimalAll(test) {
    test.expect(1);

    this.lc.digit(0, "1.");
    test.deepEqual(this.send.args, [
      [0, 8, 176]
    ]);

    test.done();
  },
  print(test) {
    test.expect(1);

    this.lc.print("1234");
    test.deepEqual(this.send.args, [
      [0, 8, 0x30],
      [0, 7, 0x6D],
      [0, 6, 0x79],
      [0, 5, 0x33],
    ]);

    test.done();
  },
  drawAll(test) {
    test.expect(1);

    this.lc.draw(0, 1);
    test.deepEqual(this.send.args, [
      [0, 8, 48]
    ]);

    test.done();
  },
  drawAlphaWithDecimalAll(test) {
    test.expect(1);

    this.lc.draw(0, "1.");
    test.deepEqual(this.send.args, [
      [0, 8, 176]
    ]);

    test.done();
  },

  columnThrows(test) {
    test.expect(1);
    test.throws(() => {
      this.lc.column();
    });
    test.done();
  },

  rowIsNotMatrix(test) {
    test.expect(1);
    test.throws(() => {
      this.lc.row();
    });
    test.done();
  },

  led(test) {
    test.expect(1);
    this.lc.led(0, 0, 0, 0);

    const before = this.lc.memory.slice();

    this.lc.led(0, 0, 0, 1);

    test.notDeepEqual(this.lc.memory, before);
    test.done();
  },
};

exports["LedControl - I2C Digits"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.clock = this.sandbox.useFakeTimers();

    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");

    this.lc = new LedControl({
      controller: "HT16K33",
      isMatrix: false,
      board: this.board
    });

    this.each = this.sandbox.spy(this.lc, "each");
    this.row = this.sandbox.spy(this.lc, "row");
    done();
  },
  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    LedControl.purge();
    done();
  },
  digit(test) {
    test.expect(1);

    this.i2cWrite.reset();
    this.lc.digit(0, 0, 1);
    test.deepEqual(this.i2cWrite.args, [
      [0x70, [0, 0x06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    ]);

    test.done();
  },
  digitDigitWithDecimal(test) {
    test.expect(1);

    this.i2cWrite.reset();
    this.lc.digit(0, 0, "1.");
    test.deepEqual(this.i2cWrite.args, [
      [0x70, [0, 0x86, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    ]);

    test.done();
  },
  digitAlpha(test) {
    test.expect(1);

    this.i2cWrite.reset();
    this.lc.digit(0, 0, "A");
    test.deepEqual(this.i2cWrite.args, [
      [0x70, [0, 0x77, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
    ]);

    test.done();
  },
  print(test) {
    test.expect(1);

    this.i2cWrite.reset();
    this.lc.print("12:00");
    test.deepEqual(this.i2cWrite.args, [
      [0x70, [0, 0x06, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0x06, 0, 0x5B, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0x06, 0, 0x5B, 0, 0xFF, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0x06, 0, 0x5B, 0, 0xFF, 0, 0x3F, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0x06, 0, 0x5B, 0, 0xFF, 0, 0x3F, 0, 0x3F, 0, 0, 0, 0, 0, 0, 0]]
    ]);

    test.done();
  },
  printNonString(test) {
    test.expect(1);

    this.i2cWrite.reset();
    this.lc.print(1);
    test.deepEqual(this.i2cWrite.args, [
      [ 112, [ 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] ]
    ]);

    test.done();
  },
  printSpaceInColonSpot(test) {
    test.expect(1);

    this.i2cWrite.reset();
    this.lc.print("12 00");
    test.deepEqual(this.i2cWrite.args, [
      [0x70, [0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 6, 0, 91, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 6, 0, 91, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 6, 0, 91, 0, 0, 0, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 6, 0, 91, 0, 0, 0, 63, 0, 63, 0, 0, 0, 0, 0, 0, 0]]
    ]);

    test.done();
  },
  printNoColon(test) {
    test.expect(1);

    this.i2cWrite.reset();
    this.lc.print("hola");
    test.deepEqual(this.i2cWrite.args, [
      [0x70, [0, 116, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 116, 0, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 116, 0, 92, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 116, 0, 92, 0, 0, 0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 116, 0, 92, 0, 0, 0, 48, 0, 95, 0, 0, 0, 0, 0, 0, 0]]
    ]);

    test.done();
  },
  printNoColonExplicitSpace(test) {
    test.expect(1);

    this.i2cWrite.reset();
    this.lc.print(" 4 09");
    test.deepEqual(this.i2cWrite.args, [
      [0x70, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 102, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 102, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 102, 0, 0, 0, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      [0x70, [0, 0, 0, 102, 0, 0, 0, 63, 0, 111, 0, 0, 0, 0, 0, 0, 0]]
    ]);

    test.done();
  },

  rowIsNotMatrix(test) {
    test.expect(1);
    test.throws(() => {
      this.lc.row(0, 1, 255);
    });
    test.done();
  },

  scanLimit(test) {
    test.expect(1);
    test.throws(() => {
      this.lc.scanLimit();
    });
    test.done();
  },

  sendInvalidArguments(test) {
    test.expect(1);
    test.throws(() => {
      this.lc.send();
    });
    test.done();
  },

};
