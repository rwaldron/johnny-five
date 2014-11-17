var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./mock-firmata"),
  Wii = five.Wii,
  Board = five.Board;

function newBoard() {
  return new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });
}

exports["Nunchuk"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.board = newBoard();
    this.sendI2CReadRequest = sinon.spy(this.board.io, "sendI2CReadRequest");

    this.nunchuk = new Wii.Nunchuk({
      board: this.board,
      freq: 50
    });

    this.proto = [];
    this.instance = [{
      name: "threshold"
    }, {
      name: "freq"
    }, {
      name: "holdtime"
    }];

    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.nunchuk[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.nunchuk[property.name], "undefined");
    }, this);

    test.done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.sendI2CReadRequest.restore();
    done();
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

    var callback = this.sendI2CReadRequest.args[0][2];

    this.nunchuk.joystick.on("change", function(err, event) {
      console.log(
        "joystick " + event.axis,
        event.target[event.axis],
        event.axis, event.direction
      );
      test.ok(true);
      test.done();
    });
    this.nunchuk.accelerometer.on("change", function(err, event) {});

    callback([31,127,149,88,134,135]);
    this.clock.tick(50);

    callback([199,127,156,92,151,127]);
    this.clock.tick(50);

  }

};
