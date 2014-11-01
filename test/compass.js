var five = require("../lib/johnny-five.js"),
  sinon = require("sinon"),
  MockFirmata = require("./mock-firmata"),
  Board = five.Board,
  Compass = five.Compass;

exports["Compass"] = {
  setUp : function(done) {

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

