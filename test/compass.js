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
  setUp : function(done) {

    this.board = newBoard();

    this.compass = new Compass({
      board: this.board,
      device: "HMC5883L",
      freq: 50,
      gauss: 1.3
    });

    this.proto = [];

    this.instance = [{
      name: "scale"
    }];

    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.compass[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.compass[property.name], "undefined");
    }, this);

    test.done();
  },
  
  tearDown : function(done) {
    done();
  }
};

exports["HMC6352"] = {

  setUp : function(done) {

    this.board = newBoard();
    this.compass = new Compass({
      board: this.board,
      device: "HMC6352",
      freq: 50,
      gauss: 1.3
    });

    done();
  },

  default : function(test) {

    test.expect(1);
    test.ok(true);
    test.done();
  },

  tearDown : function(done) {
    done();
  }


};

