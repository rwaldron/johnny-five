require("./common/bootstrap");

exports["Sensor.Collection"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.clock = this.sandbox.useFakeTimers();
    this.board = newBoard();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");

    done();
  },

  tearDown(done) {
    Sensor.purge();
    Board.purge();
    this.sandbox.restore();
    done();
  },

  instanceof(test) {
    test.expect(1);
    test.equal(new Sensor.Collection({}) instanceof Sensor.Collection, true);
    test.done();
  },

  data(test) {
    test.expect(4);

    this.sensors = new Sensor.Collection(["A0", "A1", "A2"]);

    this.callbacks = [
      this.analogRead.getCall(0).args[1],
      this.analogRead.getCall(1).args[1],
      this.analogRead.getCall(2).args[1],
    ];

    const spy = this.sandbox.spy();

    this.sensors.on("data", spy);

    this.callbacks[0](0);
    this.callbacks[1](0);
    this.callbacks[2](0);

    this.clock.tick(25);
    this.callbacks[0](1023);
    this.callbacks[1](1023);
    this.callbacks[2](1023);
    this.clock.tick(25);
    this.callbacks[0](1);
    this.callbacks[1](1);
    this.callbacks[2](1);
    this.clock.tick(25);
    this.callbacks[0](2);

    test.equal(this.sensors.length, 3);
    test.equal(this.sensors[0].value, 2);
    test.equal(this.sensors[1].value, 1);
    test.equal(this.sensors[2].value, 1);
    test.done();

  },

  change(test) {
    test.expect(4);

    this.sensors = new Sensor.Collection({
      pins: ["A0", "A1", "A2"],
      board: this.board,
    });

    this.callbacks = [
      this.analogRead.getCall(0).args[1],
      this.analogRead.getCall(1).args[1],
      this.analogRead.getCall(2).args[1],
    ];

    const spy = this.sandbox.spy();

    this.sensors.on("change", spy);

    this.callbacks[0](0);
    this.callbacks[1](0);
    this.callbacks[2](0);
    this.callbacks[0](1023);
    this.callbacks[1](1023);
    this.callbacks[2](1023);
    this.callbacks[0](1);
    this.callbacks[1](1);
    this.callbacks[2](1);
    this.callbacks[0](2);

    test.equal(this.sensors.length, 3);
    test.equal(this.sensors[0].value, 2);
    test.equal(this.sensors[1].value, 1);
    test.equal(this.sensors[2].value, 1);
    test.done();

  },

  dataFromLateAddition(test) {
    test.expect(5);

    this.sensors = new Sensor.Collection({
      pins: ["A0", "A1", "A2"],
      board: this.board,
    });

    this.callbacks = [
      this.analogRead.getCall(0).args[1],
      this.analogRead.getCall(1).args[1],
      this.analogRead.getCall(2).args[1],
    ];

    const spy = this.sandbox.spy();

    this.sensors.on("change", spy);

    this.clock.tick(1);

    this.callbacks[0](1023);
    this.callbacks[1](1023);
    this.callbacks[2](1023);
    this.clock.tick(1);

    this.sensors.add(new Sensor("A3"));

    this.callbacks.push(this.analogRead.lastCall.args[1]);

    this.clock.tick(2);

    this.callbacks[3](1);
    this.callbacks[0](1);
    this.callbacks[1](1);
    this.callbacks[2](1);
    this.clock.tick(3);
    this.callbacks[3](2);

    test.equal(this.sensors.length, 4);
    test.equal(this.sensors[0].value, 1);
    test.equal(this.sensors[1].value, 1);
    test.equal(this.sensors[2].value, 1);
    test.equal(this.sensors[3].value, 2);
    test.done();
  },
};
