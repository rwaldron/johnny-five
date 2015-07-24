var MockFirmata = require("./util/mock-firmata"),
  sinon = require("sinon"),
  five = require("../lib/johnny-five.js"),
  Button = five.Button,
  Board = five.Board;


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
    this.board = newBoard();
    this.digitalRead = sinon.spy(MockFirmata.prototype, "digitalRead");
    this.button = new Button({
      pin: 8,
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
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

  holdRepeatsUntilRelease: function(test) {
    var clock = sinon.useFakeTimers();
    var spy = sinon.spy();
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

exports["Button, Analog Pin"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.digitalRead = sinon.spy(MockFirmata.prototype, "digitalRead");
    this.button = new Button({
      pin: "A0",
      board: this.board
    });

    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
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
    this.board = newBoard();
    this.digitalRead = sinon.spy(MockFirmata.prototype, "digitalRead");
    this.button = new Button({
      pin: 8,
      board: this.board
    });


    done();
  },

  tearDown: function(done) {
    Board.purge();
    restore(this);
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
