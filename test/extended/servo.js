require("../common/bootstrap");

exports["Servo"] = {
  setUp: function(done) {
    this.board = newBoard();
    this.sandbox = sinon.sandbox.create();
    this.servoWrite = this.sandbox.spy(MockFirmata.prototype, "servoWrite");

    done();
  },

  tearDown: function(done) {
    if (this.servo && this.servo.animation) {
      this.servo.animation.stop();
    }

    Board.purge();
    Servo.purge();
    this.sandbox.restore();

    done();
  },

  center: function(test) {
    test.expect(4);

    this.spy = this.sandbox.spy(Servo.prototype, "center");

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      center: true
    });

    // constructor called .center()
    test.ok(this.spy.called);


    // and servo is actually centered
    test.equal(this.servo.position, 90);


    this.servo.to(180);
    this.servo.center(1000, 100);

    setTimeout(function() {
      test.ok(this.servo.position > 90);
    }.bind(this), 900);

    // it fired a move:complete event when finished
    this.servo.on("move:complete", function() {
      test.equal(this.servo.position, 90);
      test.done();
    }.bind(this));
  },

  min: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(180);
    this.servo.min(1000, 100);

    this.servo.on("move:complete", function() {
      test.equal(this.servo.position, 0);
      test.ok(this.servoWrite.callCount === 101);
      test.done();
    }.bind(this));
  },



  min2: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(180);
    this.servo.min(1000, 100);

    this.servo.on("move:complete", function() {
      test.equal(this.servo.position, 0);
      test.ok(this.servoWrite.callCount === 101);
      test.done();
    }.bind(this));
  },

  rate: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(0);
    this.servo.to(180, 1000, 100);

    setTimeout(function() {
      test.equal(this.servo.position, 180);
      test.equal(this.servoWrite.callCount, 101);

      test.done();
    }.bind(this), 1010);


  },

  min3: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(180);
    this.servo.min(1000, 100);

    this.servo.on("move:complete", function() {
      test.equal(this.servo.position, 0);
      test.ok(this.servoWrite.callCount === 101);
      test.done();
    }.bind(this));
  },

  min4: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(180);
    this.servo.min(1000, 100);

    this.servo.on("move:complete", function() {
      test.equal(this.servo.position, 0);
      test.ok(this.servoWrite.callCount === 101);
      test.done();
    }.bind(this));
  },

  max: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(0);
    this.servo.max(1000, 100);
    //this.servo.to(180, 1000, 100);

    this.servo.on("move:complete", function() {
      test.equal(this.servo.position, 180);
      test.ok(this.servoWrite.callCount === 101);
      test.done();
    }.bind(this));
  },

  completeMoveEmitted: function(test) {
    test.expect(1);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(0);
    this.servo.to(180, 1000, 100);

    this.servo.on("move:complete", function() {
      test.ok(this.servoWrite.callCount, 1);
      test.done();
    }.bind(this));
  },

  fps: function(test) {
    test.expect(1);

    this.servo = new Servo({
      pin: 11,
      board: this.board,
      fps: 50
    });

    this.servo.to(0);
    this.servo.to(180, 1000);

    this.servo.on("move:complete", function() {
      test.ok(this.servoWrite.callCount === 51);
      test.done();
    }.bind(this));

  },

  toDegreesAndTimeWithOffset: function(test) {
    test.expect(2);
    
    this.servo = new Servo({
      board: this.board,
      pin: 11,
      offset: -10
    });

    this.servo.to(80, 100);

    this.servo.on("move:complete", function() {
      test.equal(this.servo.value, 80);
      test.equal(this.servoWrite.lastCall.args[1], 1300);
      test.done();
    }.bind(this));
    
  },

  toDegreesAndTimeWithOffsetAndInvert: function(test) {
    test.expect(2);
    
    this.servo = new Servo({
      board: this.board,
      pin: 11,
      offset: -10,
      invert: true
    });

    this.servo.to(80, 100);

    this.servo.on("move:complete", function() {
      test.equal(this.servo.value, 80);
      test.equal(this.servoWrite.lastCall.args[1], 1700);
      test.done();
    }.bind(this));
    
  },

  /* These tests are commented out while we figure out Issue #829
  degreeChange: function(test) {
    test.expect(1);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    //this.servo.to(180);

    this.servo.to(180, 1000, 100);

    this.servo.on("move:complete", function() {
      console.log("Servo move complete");
      test.ok(this.servoWrite.callCount, 1);

      test.done();
    }.bind(this));
  },

  resolutionLimited: function(test) {
    test.expect(2);

    this.servo = new Servo({
      pin: 11,
      board: this.board
    });

    this.servo.to(0);
    this.servo.to(90, 1000, 255);

    this.servo.on("move:complete", function() {

      test.ok(this.servoWrite.callCount === 91);
      test.equal(this.servo.position, 90);

      test.done();
    }.bind(this));
  }
  */
};
