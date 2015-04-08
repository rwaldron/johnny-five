var MockFirmata = require("./util/mock-firmata"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Sensor = five.Sensor,
  Proximity = five.Proximity,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });

exports["Proximity"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.distance = new Proximity({
      controller: "GP2Y0A21YK",
      pin: "A1",
      board: board
    });

    this.instance = [{
      name: "centimeters"
    }, {
      name: "inches"
    }];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.instance.length);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.distance[property.name], "undefined");
    }, this);

    test.done();
  },

  emitter: function(test) {
    test.expect(1);
    test.ok(this.distance instanceof events.EventEmitter);
    test.done();
  }
};

exports["Proximity: GP2Y0A21YK"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.distance = new Proximity({
      controller: "GP2Y0A21YK",
      pin: "A1",
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  GP2Y0A21YK: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    // 154 is an actual reading at ~14.5"
    callback(154);

    test.equals(Math.round(this.distance.centimeters), 38);
    test.equals(Math.round(this.distance.cm), 38);
    test.equals(Math.round(this.distance.inches), 15);
    test.equals(Math.round(this.distance.in), 15);

    test.done();
  }
};

exports["Proximity: GP2D120XJ00F"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.distance = new Proximity({
      controller: "GP2D120XJ00F",
      pin: "A1",
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  GP2D120XJ00F: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);
    // 70 is an actual reading at ~14.5"
    callback(70);

    test.equals(Math.round(this.distance.centimeters), 38);
    test.equals(Math.round(this.distance.cm), 38);
    test.equals(Math.round(this.distance.inches), 15);
    test.equals(Math.round(this.distance.in), 15);

    test.done();
  }
};

exports["Proximity: GP2Y0A02YK0F"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.distance = new Proximity({
      controller: "GP2Y0A02YK0F",
      pin: "A1",
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  GP2Y0A02YK0F: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    // 325 is an actual reading at ~14.5"
    callback(325);

    test.equals(Math.round(this.distance.centimeters), 38);
    test.equals(Math.round(this.distance.cm), 38);
    test.equals(Math.round(this.distance.inches), 15);
    test.equals(Math.round(this.distance.in), 15);

    test.done();
  }
};

exports["Proximity: GP2Y0A41SK0F"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.distance = new Proximity({
      controller: "GP2Y0A41SK0F",
      pin: "A1",
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  GP2Y0A41SK0F: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    // 325 is an actual reading at ~2.5"
    callback(325);

    test.equals(Math.round(this.distance.centimeters), 7);
    test.equals(Math.round(this.distance.cm), 7);
    test.equals(Math.round(this.distance.inches), 3);
    test.equals(Math.round(this.distance.in), 3);

    test.done();
  }
};

exports["Proximity: MB1003"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.distance = new Proximity({
      controller: "MB1003",
      pin: "A1",
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  MB1003: function(test) {
    var callback = this.analogRead.args[0][1];

    test.expect(4);

    // 500 is an actual reading at ~250cm
    callback(500);

    test.equals(Math.round(this.distance.centimeters), 250);
    test.equals(Math.round(this.distance.cm), 250);
    test.equals(Math.round(this.distance.inches), 98);
    test.equals(Math.round(this.distance.in), 98);

    test.done();
  }
};

exports["Proximity: SRF10"] = {
  setUp: function(done) {
    this.clock = sinon.useFakeTimers();
    this.i2cConfig = sinon.spy(board.io, "i2cConfig");
    this.i2cWrite = sinon.spy(board.io, "i2cWrite");
    this.i2cRead = sinon.spy(board.io, "i2cRead");


    this.distance = new Proximity({
      controller: "SRF10",
      freq: 100,
      board: board
    });

    done();
  },

  tearDown: function(done) {
    this.i2cConfig.restore();
    this.i2cWrite.restore();
    this.i2cRead.restore();
    this.clock.restore();
    done();
  },

  SRF10: function(test) {
    // A test should go here
    test.done();
  }
};

// - GP2Y0A21YK
//     https://www.sparkfun.com/products/242
// - GP2D120XJ00F
//     https://www.sparkfun.com/products/8959
// - GP2Y0A02YK0F
//     https://www.sparkfun.com/products/8958
// - GP2Y0A41SK0F
//     https://www.sparkfun.com/products/12728
