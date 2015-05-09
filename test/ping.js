var MockFirmata = require("./util/mock-firmata"),
  sinon = require("sinon"),
  five = require("../lib/johnny-five.js"),
  Board = five.Board,
  Ping = five.Ping,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Ping"] = {

  setUp: function(done) {
    this.clock = sinon.useFakeTimers();

    sinon.stub(board.io, "pingRead", function(settings, handler) {
      handler(1000);
    });

    this.ping = new Ping({
      pin: 7,
      freq: 100,
      board: board
    });

    this.proto = [];
    this.instance = [{
      name: "id"
    }, {
      name: "freq"
    }, {
      name: "value"
    }, {
      name: "inches"
    }, {
      name: "cm"
    }];

    done();
  },

  tearDown: function(done) {
    board.io.pingRead.restore();
    this.clock.restore();
    done();
  },

  shape: function(test) {

    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.ping[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.ping[property.name], "undefined");
    }, this);

    test.done();
  },

  data: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    // tick the clock forward to trigger the pingRead handler
    this.clock.tick(250);

    this.ping.on("data", spy);
    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  },

  change: function(test) {
    var spy = sinon.spy();
    test.expect(1);

    // tick the clock forward to trigger the pingRead handler
    this.clock.tick(250);

    this.ping.on("change", spy);
    // board.io.pulseValue = 1;
    // this.clock.tick(500);
    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();

  },

  within: function(test) {
    var spy = sinon.spy();
    test.expect(2);

    // tick the clock forward to trigger the pingRead handler
    this.clock.tick(250);

    this.ping.within([0, 120], "inches", function() {
      // The fake microseconds value is 1000, which
      // calculates to 6.76 inches.
      test.equal(this.inches, 6.76);
      spy();
    });

    this.clock.tick(100);
    test.ok(spy.calledOnce);
    test.done();
  }
};
