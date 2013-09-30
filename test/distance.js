var MockFirmata = require("./mock-firmata"),
    five = require("../lib/johnny-five.js"),
    events = require("events"),
    sinon = require("sinon"),
    Board = five.Board,
    Sensor = five.Sensor,
    Distance = five.IR.Distance,
    board = new five.Board({
      repl: false,
      firmata: new MockFirmata()
    });

exports["IR.Distance"] = {
  setUp: function( done ) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.firmata, "analogRead");
    this.distance = new Distance({ pin: "A1", board: board });

    this.instance = [
      { name: "inches" },
      { name: "cm" }
    ];

    done();
  },

  tearDown: function( done ) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  shape: function( test ) {
    test.expect( this.instance.length );

    this.instance.forEach(function( property ) {
      test.notEqual( typeof this.distance[ property.name ], "undefined" );
    }, this);

    test.done();
  },

  sensor: function( test ) {
    test.expect(1);
    test.ok(this.distance instanceof Sensor);
    test.done();
  },

  emitter: function( test ) {
    test.expect( 1 );
    test.ok( this.distance instanceof events.EventEmitter );
    test.done();
  }
};

exports["IR.Distance: GP2Y0A21YK"] = {
  setUp: function( done ) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.firmata, "analogRead");
    this.distance = new Distance({
      device: "GP2Y0A21YK",
      pin: "A1",
      board: board
    });

    done();
  },

  tearDown: function( done ) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  GP2Y0A21YK: function( test ) {
    var callback = this.analogRead.args[0][1];

    test.expect(2);

    // 154 is an actual reading at ~14.5"
    callback(154);

    test.equals(Math.round(this.distance.cm), 38);
    test.equals(Math.round(this.distance.inches), 15);

    test.done();
  }
};

exports["IR.Distance: GP2D120XJ00F"] = {
  setUp: function( done ) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.firmata, "analogRead");
    this.distance = new Distance({
      device: "GP2D120XJ00F",
      pin: "A1",
      board: board
    });

    done();
  },

  tearDown: function( done ) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  GP2D120XJ00F: function( test ) {
    var callback = this.analogRead.args[0][1];

    test.expect(2);
    // 70 is an actual reading at ~14.5"
    callback(70);

    test.equals(Math.round(this.distance.cm), 38);
    test.equals(Math.round(this.distance.inches), 15);

    test.done();
  }
};

exports["IR.Distance: GP2Y0A02YK0F"] = {
  setUp: function( done ) {
    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.firmata, "analogRead");
    this.distance = new Distance({
      device: "GP2Y0A02YK0F",
      pin: "A1",
      board: board
    });

    done();
  },

  tearDown: function( done ) {
    this.clock.restore();
    this.analogRead.restore();
    done();
  },

  GP2Y0A02YK0F: function( test ) {
    var callback = this.analogRead.args[0][1];

    test.expect(2);

    // 325 is an actual reading at ~14.5"
    callback(325);

    test.equals(Math.round(this.distance.cm), 38);
    test.equals(Math.round(this.distance.inches), 15);

    test.done();
  }
};


// - GP2Y0A21YK
//     https://www.sparkfun.com/products/242
// - GP2D120XJ00F
//     https://www.sparkfun.com/products/8959
// - GP2Y0A02YK0F
//     https://www.sparkfun.com/products/8958
