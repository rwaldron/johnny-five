var MockFirmata = require("./util/mock-firmata"),
  sinon = require("sinon"),
  five = require("../lib/johnny-five.js"),
  Button = five.Button;

var io = new MockFirmata();
var board = new five.Board({
  debug: false,
  repl: false,
  io: io
});

io.emit("ready");


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


exports["Button, Digital Pin"] = {
  setUp: function(done) {
    this.digitalRead = sinon.spy(MockFirmata.prototype, "digitalRead");
    this.button = new Button({
      pin: 8,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.digitalRead.restore();
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
    var clock = sinon.useFakeTimers();
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

exports["Button, Analog Pin"] = {
  setUp: function(done) {
    this.digitalRead = sinon.spy(MockFirmata.prototype, "digitalRead");
    this.button = new Button({
      pin: "A0",
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.digitalRead.restore();
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
    var clock = sinon.useFakeTimers();
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

exports["Button, Value Inversion"] = {
  setUp: function(done) {
    this.digitalRead = sinon.spy(MockFirmata.prototype, "digitalRead");
    this.button = new Button({
      pin: 8,
      board: board
    });


    done();
  },

  tearDown: function(done) {
    this.digitalRead.restore();
    done();
  },

  initialInversion: function(test) {
    test.expect(6);

    this.button = new Button({
      pin: 8,
      invert: true,
      board: board
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
      board: board
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
