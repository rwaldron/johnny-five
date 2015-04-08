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
    this.i2cReadOnce = sinon.spy(board.io, "i2cReadOnce");
    this.i2cWrite = sinon.spy(board.io, "i2cWrite");
    this.i2cConfig = sinon.spy(board.io, "i2cConfig");

    this.proximity = new Proximity({
      controller: "SRF10",
      board: board
    });

    this.proto = [{
      name: "within"
    }];

    this.instance = [{
      name: "centimeters"
    }, {
      name: "cm"
    },{
      name: "inches"
    }, {
      name: "in"
    }];

    done();
  },

  tearDown: function(done) {
    this.clock.restore();
    this.i2cReadOnce.restore();
    this.i2cWrite.restore();
    this.i2cConfig.restore();

    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      console.log(method.name);
      test.equal(typeof this.proximity[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.proximity[property.name], 0);
    }, this);

    test.done();
  },

  initialize: function(test) {
    test.expect(5);

    test.ok(this.i2cConfig.called);
    test.ok(this.i2cWrite.calledThrice);

    test.deepEqual(this.i2cConfig.args[0], [0]);
    test.deepEqual(
      this.i2cWrite.firstCall.args, [0x70, [0x01, 16]]
    );
    test.deepEqual(
      this.i2cWrite.secondCall.args, [0x70, [0x02, 255]]
    );

    test.done();
  },

  data: function(test) {
    test.expect(2);

    this.clock.tick(100);

    var callback = this.i2cReadOnce.args[0][2],
      spy = sinon.spy();

    test.equal(spy.callCount, 0);

    this.proximity.on("data", spy);

    callback([3, 225]);
    callback([3, 255]);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  change: function(test) {
    this.clock.tick(100);

    var callback = this.i2cReadOnce.args[0][2],
      spy = sinon.spy();

    test.expect(1);
    this.proximity.on("change", spy);

    this.clock.tick(100);
    callback([3, 225]);

    this.clock.tick(100);
    callback([3, 255]);

    this.clock.tick(100);

    test.ok(spy.called);
    test.done();
  },

  within_unit: function(test) {
    this.clock.tick(65);

    var callback = this.i2cReadOnce.args[0][2];
    var called = false;

    test.expect(1);

    this.proximity.within([3, 6], "inches", function() {
      if (!called) {
        called = true;
        test.equal(this.inches, 3.9);
        test.done();
      }
    });

    callback([0, 10]);
    this.clock.tick(100);
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
