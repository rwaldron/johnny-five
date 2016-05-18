exports["Nunchuk"] = {

  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.board = newBoard();

    this.nunchuk = new Wii.Nunchuk({
      board: this.board,
      freq: 50
    });

    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.instance = [{
      name: "threshold"
    }, {
      name: "freq"
    }, {
      name: "holdtime"
    }];

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.instance.length);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.nunchuk[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {
    test.expect(1);

    this.nunchuk.on("data", function() {
      test.ok(true);
    });
    this.clock.tick(50);
    test.done();
  },

  "joystick change": function(test) {
    test.expect(1);

    this.clock.tick(100);
    var callback = this.i2cReadOnce.args[0][2];

    var spy = this.sandbox.spy();

    this.nunchuk.joystick.on("change", spy);

    callback([31, 127, 149, 88, 134, 135]);
    this.clock.tick(50);

    callback([199, 127, 156, 92, 151, 127]);
    this.clock.tick(50);

    test.ok(spy.called);
    test.done();
  },

  "accelerometer change": function(test) {
    test.expect(1);

    this.clock.tick(100);
    var callback = this.i2cReadOnce.args[0][2];

    var spy = this.sandbox.spy();

    this.nunchuk.accelerometer.on("change", spy);

    callback([31, 127, 149, 88, 134, 135]);
    this.clock.tick(50);

    callback([199, 127, 156, 92, 151, 127]);
    this.clock.tick(50);

    test.ok(spy.called);
    test.done();
  },

  "empty constructor": function(test) {
    test.expect(1);

    test.ok(new Wii.Nunchuk());
    test.done();
  }
};

exports["Classic"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.board = newBoard();

    this.classic = new Wii.Classic({
      board: this.board,
      freq: 50
    });

    this.i2cReadOnce = this.sandbox.spy(MockFirmata.prototype, "i2cReadOnce");

    this.instance = [{
      name: "threshold"
    }, {
      name: "freq"
    }, {
      name: "holdtime"
    }];
    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.instance.length);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.classic[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {
    test.expect(1);

    this.classic.on("data", function() {
      test.ok(true);
    });
    this.clock.tick(50);
    test.done();
  },

  "empty constructor": function(test) {
    test.expect(1);

    test.ok(new Wii.Classic());
    test.done();
  }
};
