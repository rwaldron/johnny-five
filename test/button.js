var proto = [];
var instance = [{
  name: "pullup"
}, {
  name: "invert"
}, {
  name: "downValue"
}, {
  name: "upValue"
}, {
  name: "holdtime"
}, {
  name: "isDown"
}, {
  name: "value"
}];



exports["Button -- Digital Pin"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", function(fn) {
      return fn;
    });
    this.digitalRead = this.sandbox.spy(MockFirmata.prototype, "digitalRead");
    this.button = new Button({
      pin: 8,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  shape: function(test) {
    test.expect(proto.length + instance.length);

    proto.forEach(function(method) {
      test.equal(typeof this.button[method.name], "function");
    }, this);

    instance.forEach(function(property) {
      test.notEqual(typeof this.button[property.name], "undefined");
    }, this);

    test.done();
  },

  down: function(test) {

    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("down", function() {

      test.ok(true);
      test.done();
    });
    // Set initial state
    callback(this.button.upValue);
    // Trigger a change of state
    callback(this.button.downValue);
  },

  up: function(test) {

    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("up", function() {
      test.ok(true);
      test.done();
    });
    callback(this.button.downValue);
    callback(this.button.upValue);
  },

  hold: function(test) {
    var clock = this.sandbox.useFakeTimers();
    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("hold", function() {
      test.ok(true);
      clock.restore();
      test.done();
    });
    // Set initial state
    callback(this.button.upValue);
    this.button.holdtime = 10;
    // Trigger a change of state
    callback(this.button.downValue);
    // Simulate the state being held
    clock.tick(11);
    callback(this.button.upValue);
  },

  holdRepeatsUntilRelease: function(test) {
    var clock = this.sandbox.useFakeTimers();
    var spy = this.sandbox.spy();
    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("hold", spy);

    // Set initial state
    callback(this.button.upValue);

    this.button.holdtime = 10;

    // Trigger a change of state
    callback(this.button.downValue);

    // Simulate the state being held for 3 "holdtime" periods
    clock.tick(30);

    test.equal(spy.callCount, 3);

    clock.restore();

    test.done();
  },
};

exports["Button -- Analog Pin"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", function(fn) {
      return fn;
    });
    this.digitalRead = this.sandbox.spy(MockFirmata.prototype, "digitalRead");
    this.button = new Button({
      pin: "A0",
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  pinTranslation: function(test) {
    test.expect(1);
    test.equal(this.button.pin, 14);
    test.done();
  },
  down: function(test) {

    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("down", function() {

      test.ok(true);
      test.done();
    });

    // Set initial state
    callback(this.button.upValue);
    // Trigger a change of state
    callback(this.button.downValue);
  },

  up: function(test) {

    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("up", function() {
      test.ok(true);
      test.done();
    });
    callback(this.button.downValue);
    callback(this.button.upValue);
  },

  hold: function(test) {
    var clock = this.sandbox.useFakeTimers();
    var callback = this.digitalRead.args[0][1];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("hold", function() {
      test.ok(true);
      clock.restore();
      test.done();
    });
    // Set initial state
    callback(this.button.upValue);
    this.button.holdtime = 10;
    // Trigger a change of state
    callback(this.button.downValue);
    // Simulate the state being held
    clock.tick(11);
    callback(this.button.upValue);
  },
};

exports["Button -- Value Inversion"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", function(fn) {
      return fn;
    });
    this.digitalRead = this.sandbox.spy(MockFirmata.prototype, "digitalRead");
    this.button = new Button({
      pin: 8,
      board: this.board
    });


    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  initialInversion: function(test) {
    test.expect(6);

    this.button = new Button({
      pin: 8,
      invert: true,
      board: this.board
    });

    test.equal(this.button.downValue, 0);
    test.equal(this.button.upValue, 1);

    this.button.downValue = 1;

    test.equal(this.button.downValue, 1);
    test.equal(this.button.upValue, 0);

    this.button.upValue = 1;

    test.equal(this.button.downValue, 0);
    test.equal(this.button.upValue, 1);

    test.done();
  },

  pullupInversion: function(test) {
    test.expect(6);

    this.button = new Button({
      pin: 8,
      pullup: true,
      board: this.board
    });

    test.equal(this.button.downValue, 0);
    test.equal(this.button.upValue, 1);

    this.button.downValue = 1;

    test.equal(this.button.downValue, 1);
    test.equal(this.button.upValue, 0);

    this.button.upValue = 1;

    test.equal(this.button.downValue, 0);
    test.equal(this.button.upValue, 1);

    test.done();
  },

  inlineInversion: function(test) {
    test.expect(14);

    test.equal(this.button.downValue, 1);
    test.equal(this.button.upValue, 0);

    this.button.upValue = 1;

    test.equal(this.button.downValue, 0);
    test.equal(this.button.upValue, 1);

    this.button.upValue = 0;

    test.equal(this.button.downValue, 1);
    test.equal(this.button.upValue, 0);

    this.button.downValue = 0;

    test.equal(this.button.downValue, 0);
    test.equal(this.button.upValue, 1);

    this.button.downValue = 1;

    test.equal(this.button.downValue, 1);
    test.equal(this.button.upValue, 0);

    this.button.invert = true;

    test.equal(this.button.downValue, 0);
    test.equal(this.button.upValue, 1);

    this.button.invert = false;

    test.equal(this.button.downValue, 1);
    test.equal(this.button.upValue, 0);

    test.done();
  },
};


exports["Button -- EVS_EV3"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", function(fn) {
      return fn;
    });
    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.button = new Button({
      controller: "EVS_EV3",
      pin: "BAS1",
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  pinTranslation: function(test) {
    test.expect(1);
    test.equal(this.button.pin, "BAS1");
    test.done();
  },

  initialization: function(test) {
    test.expect(4);

    test.equal(this.evssetup.callCount, 1);
    test.equal(this.evsread.callCount, 1);

    test.equal(this.i2cWrite.callCount, 1);
    test.equal(this.i2cRead.callCount, 1);

    test.done();
  },

  down: function(test) {

    var callback = this.i2cRead.args[0][3];
    test.expect(1);

    this.button.on("down", function() {

      test.ok(true);
      test.done();
    });

    callback([this.button.downValue]);
  },

  up: function(test) {

    var callback = this.i2cRead.args[0][3];
    test.expect(1);

    this.button.on("up", function() {
      test.ok(true);
      test.done();
    });
    callback([this.button.downValue]);
    callback([this.button.upValue]);
  },

  hold: function(test) {
    var clock = this.sandbox.useFakeTimers();
    var callback = this.i2cRead.args[0][3];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("hold", function() {
      test.ok(true);
      clock.restore();
      test.done();
    });

    this.button.holdtime = 10;
    callback([this.button.downValue]);
    clock.tick(11);
    callback([this.button.upValue]);
  },
};

exports["Button -- EVS_NXT"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", function(fn) {
      return fn;
    });
    this.evssetup = this.sandbox.spy(EVS.prototype, "setup");
    this.evsread = this.sandbox.spy(EVS.prototype, "read");

    this.i2cConfig = this.sandbox.spy(MockFirmata.prototype, "i2cConfig");
    this.i2cWrite = this.sandbox.spy(MockFirmata.prototype, "i2cWrite");
    this.i2cRead = this.sandbox.spy(MockFirmata.prototype, "i2cRead");

    this.button = new Button({
      controller: "EVS_NXT",
      pin: "BAS1",
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  pinTranslation: function(test) {
    test.expect(1);
    test.equal(this.button.pin, "BAS1");
    test.done();
  },

  initialization: function(test) {
    test.expect(4);

    test.equal(this.evssetup.callCount, 1);
    test.equal(this.evsread.callCount, 1);

    test.equal(this.i2cWrite.callCount, 1);
    test.equal(this.i2cRead.callCount, 1);

    test.done();
  },

  down: function(test) {

    var callback = this.i2cRead.args[0][3];
    test.expect(1);

    this.button.on("down", function() {

      test.ok(true);
      test.done();
    });

    callback([250]);
  },

  up: function(test) {

    var callback = this.i2cRead.args[0][3];
    test.expect(1);

    this.button.on("up", function() {
      test.ok(true);
      test.done();
    });
    callback([250]);
    callback([1000]);
  },

  hold: function(test) {
    var clock = this.sandbox.useFakeTimers();
    var callback = this.i2cRead.args[0][3];
    test.expect(1);

    //fake timers dont play nice with __.debounce
    this.button.on("hold", function() {
      test.ok(true);
      clock.restore();
      test.done();
    });

    this.button.holdtime = 10;
    callback([250]);
    clock.tick(11);
    callback([1000]);
  },
};

exports["Button.Collection"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.board = newBoard();
    this.digitalRead = this.sandbox.spy(MockFirmata.prototype, "digitalRead");

    done();
  },

  tearDown: function(done) {
    Button.purge();
    Board.purge();
    this.sandbox.restore();
    done();
  },

  data: function(test) {
    test.expect(4);

    this.sensors = new Button.Collection([2, 3, 4]);

    this.callbacks = [
      this.digitalRead.getCall(0).args[1],
      this.digitalRead.getCall(1).args[1],
      this.digitalRead.getCall(2).args[1],
    ];

    var spy = this.sandbox.spy();

    this.sensors.on("data", spy);

    this.callbacks[0](0);
    this.callbacks[1](0);
    this.callbacks[2](0);

    this.clock.tick(25);
    this.callbacks[0](1);
    this.callbacks[1](1);
    this.callbacks[2](1);
    this.clock.tick(25);
    this.callbacks[0](0);
    this.callbacks[1](0);
    this.callbacks[2](0);
    this.clock.tick(25);
    this.callbacks[0](1);

    test.equal(this.sensors.length, 3);
    test.equal(this.sensors[0].value, 1);
    test.equal(this.sensors[1].value, 0);
    test.equal(this.sensors[2].value, 0);
    test.done();

  },

  change: function(test) {
    test.expect(4);

    this.sensors = new Button.Collection({
      pins: [2, 3, 4],
      board: this.board,
    });

    this.callbacks = [
      this.digitalRead.getCall(0).args[1],
      this.digitalRead.getCall(1).args[1],
      this.digitalRead.getCall(2).args[1],
    ];

    var spy = this.sandbox.spy();

    this.sensors.on("change", spy);

    this.callbacks[0](0);
    this.callbacks[1](0);
    this.callbacks[2](0);
    this.callbacks[0](1);
    this.callbacks[1](1);
    this.callbacks[2](1);
    this.callbacks[0](0);
    this.callbacks[1](0);
    this.callbacks[2](0);
    this.callbacks[0](1);

    test.equal(this.sensors.length, 3);
    test.equal(this.sensors[0].value, 1);
    test.equal(this.sensors[1].value, 0);
    test.equal(this.sensors[2].value, 0);
    test.done();

  },

  dataFromLateAddition: function(test) {
    test.expect(5);

    this.sensors = new Button.Collection({
      pins: [2, 3, 4],
      board: this.board,
    });

    this.callbacks = [
      this.digitalRead.getCall(0).args[1],
      this.digitalRead.getCall(1).args[1],
      this.digitalRead.getCall(2).args[1],
    ];

    var spy = this.sandbox.spy();

    this.sensors.on("change", spy);

    this.clock.tick(1);

    this.callbacks[0](1);
    this.callbacks[1](1);
    this.callbacks[2](1);
    this.clock.tick(1);

    this.sensors.add(new Button(5));

    this.callbacks.push(this.digitalRead.lastCall.args[1]);

    this.clock.tick(2);

    this.callbacks[3](0);
    this.callbacks[0](0);
    this.callbacks[1](0);
    this.callbacks[2](0);
    this.clock.tick(3);
    this.callbacks[3](1);

    test.equal(this.sensors.length, 4);
    test.equal(this.sensors[0].value, 0);
    test.equal(this.sensors[1].value, 0);
    test.equal(this.sensors[2].value, 0);
    test.equal(this.sensors[3].value, 1);
    test.done();

  },
};

exports["Button -- TINKERKIT"] = {
  setUp: function(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.debounce = this.sandbox.stub(Fn, "debounce", function(fn) {
      return fn;
    });

    this.pinMode = this.sandbox.spy(MockFirmata.prototype, "pinMode");
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");

    this.button = new Button({
      controller: "TINKERKIT",
      pin: "I0",
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  pinTranslation: function(test) {
    test.expect(1);
    // translates through to an analog pin 0
    test.equal(this.button.pin, 0);
    test.done();
  },

  initialization: function(test) {
    test.expect(2);
    test.equal(this.pinMode.callCount, 1);
    test.equal(this.analogRead.callCount, 1);
    test.done();
  },

  down: function(test) {
    test.expect(1);

    var callback = this.analogRead.firstCall.args[1];

    this.button.on("down", function() {
      test.ok(true);
      test.done();
    });

    callback(513);
  },

  up: function(test) {

    var callback = this.analogRead.firstCall.args[1];
    test.expect(1);

    this.button.on("up", function() {
      test.ok(true);
      test.done();
    });
    callback(513);
    callback(511);
  },

  hold: function(test) {
    test.expect(1);

    this.clock = this.sandbox.useFakeTimers();
    var callback = this.analogRead.firstCall.args[1];

    //fake timers dont play nice with __.debounce
    this.button.on("hold", function() {
      test.ok(true);
      test.done();
    });

    this.button.holdtime = 10;
    callback(513);
    this.clock.tick(11);
    callback(511);
  },
};
