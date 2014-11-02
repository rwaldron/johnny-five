var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./mock-firmata"),
  Board = five.Board,
  Compass = five.Compass;

function newBoard() {
  return new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });
}

exports["Compass"] = {
  setUp: function(done) {

    this.clock = sinon.useFakeTimers();

    this.board = newBoard();
    sinon.stub(this.board.io, "pulseIn", function(settings, handler) {
      handler(1000);
    });

    this.compass = new Compass({
      board: this.board,
      device: "HMC5883L",
      freq: 50,
      gauss: 1.3
    });

    this.instance = [{
      name: "scale"
    }, {
      name: "register"
    }, {
      name: "freq"
    }];

    done();
  },

  shape: function(test) {
    test.expect(this.instance.length);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.compass[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {
   var spy = sinon.spy();
    test.expect(1);

    this.compass.on("data", function() {
      test.ok(true);
    });
    this.clock.tick(66);
    test.done();
  },

  tearDown: function(done) {
    this.board.io.pulseIn.restore();
    this.clock.restore();
    done();
  }

};

exports["HMC6352"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.board = newBoard();
    sinon.stub(this.board.io, "pulseIn", function(settings, handler) {
      handler(1000);
    });

    this.compass = new Compass({
      board: this.board,
      device: "HMC6352",
      freq: 50,
      gauss: 1.3
    });

    done();
  },

  data: function(test) {

    var spy = sinon.spy();
    test.expect(1);

    this.compass.on("data", function() {
      test.ok(true);
    });
    this.clock.tick(66);
    test.done();

  },

  tearDown: function(done) {
    this.board.io.pulseIn.restore();
    this.clock.restore();
    done();
  }

};
