var MockFirmata = require("./mock-firmata"),
  pins = require("./mock-pins"),
  five = require("../lib/johnny-five.js"),
  events = require("events"),
  sinon = require("sinon"),
  Board = five.Board,
  Sonar = five.Sonar,
  board = new Board({
    io: new MockFirmata(),
    debug: false,
    repl: false
  });




exports["Sonar - Analog"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.analogRead = sinon.spy(board.io, "analogRead");
    this.sonar = new Sonar({
      pin: 9,
      freq: 100,
      board: board
    });

    this.proto = [{
      name: "within"
    }];

    this.instance = [{
      name: "inches"
    }, {
      name: "cm"
    }];

    done();
  },

  tearDown: function(done) {
    this.analogRead.restore();
    this.clock.restore();
    done();
  },

  shape: function(test) {
    test.expect(this.proto.length + this.instance.length);

    this.proto.forEach(function(method) {
      test.equal(typeof this.sonar[method.name], "function");
    }, this);

    this.instance.forEach(function(property) {
      test.notEqual(typeof this.sonar[property.name], "undefined");
    }, this);

    // console.log( this.sonar );
    test.done();
  },

  data: function(test) {

    var callback = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(1);
    this.sonar.on("data", spy);

    callback(225);
    callback(255);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.done();
  },

  change: function(test) {

    var callback = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(1);
    this.sonar.on("change", spy);

    callback(225);

    this.clock.tick(100);
    callback(255);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.done();
  },

  within: function(test) {

    var callback = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(2);

    this.sonar.within([0, 230], function() {
      test.equal(this.value, 225);
    });

    this.sonar.on("change", spy);

    callback(225);

    this.clock.tick(100);
    callback(255);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.done();
  },

  within_unit: function(test) {

    var callback = this.analogRead.args[0][1],
      spy = sinon.spy();

    test.expect(2);

    this.sonar.within([0, 120], "inches", function() {
      test.equal(this.inches, 111.46);
    });

    this.sonar.on("change", spy);

    callback(225);

    this.clock.tick(100);
    callback(255);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.done();
  }

};

exports["Sonar - I2C"] = {

  setUp: function(done) {

    this.clock = sinon.useFakeTimers();
    this.sendI2CReadRequest = sinon.spy(board.io, "sendI2CReadRequest");
    this.sendI2CWriteRequest = sinon.spy(board.io, "sendI2CWriteRequest");
    this.sendI2CConfig = sinon.spy(board.io, "sendI2CConfig");

    this.sonar = new Sonar({
      device: "SRF10",
      freq: 100,
      board: board
    });

    this.proto = [{
      name: "within"
    }];

    this.instance = [{
      name: "inches"
    }, {
      name: "cm"
    }];

    done();
  },

  tearDown: function(done) {
    this.sendI2CReadRequest.restore();
    this.sendI2CWriteRequest.restore();
    this.sendI2CConfig.restore();
    this.clock.restore();
    done();
  },

  // shape: function(test) {
  //   test.expect(this.proto.length + this.instance.length);

  //   this.proto.forEach(function(method) {
  //     test.equal(typeof this.sonar[method.name], "function");
  //   }, this);

  //   this.instance.forEach(function(property) {
  //     test.notEqual(typeof this.sonar[property.name], "undefined");
  //   }, this);

  //   // console.log( this.sonar );
  //   test.done();
  // },

  // initialize: function(test) {
  //   test.expect(5);

  //   test.ok(this.sendI2CConfig.called);
  //   test.ok(this.sendI2CWriteRequest.calledThrice);

  //   test.deepEqual(this.sendI2CConfig.args[0], [0]);
  //   test.deepEqual(
  //     this.sendI2CWriteRequest.firstCall.args, [0x70, [0x01, 16]]
  //   );
  //   test.deepEqual(
  //     this.sendI2CWriteRequest.secondCall.args, [0x70, [0x02, 255]]
  //   );

  //   test.done();
  // },

  // data: function(test) {
  //   this.clock.tick(100);

  //   var callback = this.sendI2CReadRequest.args[0][2],
  //     spy = sinon.spy();

  //   test.expect(1);
  //   this.sonar.on("data", spy);

  //   callback(225);
  //   callback(255);

  //   this.clock.tick(100);

  //   test.ok(spy.calledOnce);
  //   test.done();
  // },

  change: function(test) {
    this.clock.tick(100);

    var callback = this.sendI2CReadRequest.args[0][2],
      spy = sinon.spy();

    test.expect(1);
    this.sonar.on("change", spy);

    this.clock.tick(100);
    callback([3, 225]);

    this.clock.tick(100);
    callback([3, 255]);

    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.done();
  },

  within: function(test) {
    this.clock.tick(100);

    var callback = this.sendI2CReadRequest.args[0][2],
      spy = sinon.spy();

    test.expect(2);

    this.sonar.within([0, 1022], function() {
      test.equal(this.value, 993);
    });

    this.sonar.on("change", spy);

    callback([3, 225]);
    this.clock.tick(100);

    callback([3, 255]);
    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.done();
  },

  within_unit: function(test) {
    this.clock.tick(100);

    var callback = this.sendI2CReadRequest.args[0][2],
      spy = sinon.spy();

    test.expect(2);

    this.sonar.within([0, 10], "inches", function() {
      test.equal(this.inches, 5.81);
    });

    this.sonar.on("change", spy);

    callback([3, 100]);
    this.clock.tick(100);

    callback([3, 1024 << 2]);
    this.clock.tick(100);

    test.ok(spy.calledOnce);
    test.done();
  }
};
