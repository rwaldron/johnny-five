require("./common/bootstrap");

const Crypto = require("crypto");

class Component extends Suspendable {
  constructor(options) {
    super();

    var value = null;

    this.board = options.board;
    this.io = options.board.io;
    this.pin = options.pin;

    this.io.analogRead(this.pin, (data) => {
      value = data;
      this.emit("data", value);
    });


    this.tracking = {
      value: {
        get: 0,
        set: 0,
      },
      unit: {
        get: 0,
      },
    };

    Object.defineProperties(this, {
      value: {
        get: function() {
          this.tracking.value.get++;
          return value;
        },
        set: function(input) {
          this.tracking.value.set++;
          value = input;
        },
      },
      unit: {
        get: function() {
          this.tracking.unit.get++;
          return value;
        },
      },
    });
  }
}

exports["Suspendable"] = {
  setUp(done) {
    this.sandbox = sinon.sandbox.create();
    this.board = newBoard();
    this.analogRead = this.sandbox.spy(MockFirmata.prototype, "analogRead");
    this.component = new Component({
      board: this.board,
      pin: "A0",
    });

    done();
  },
  tearDown(done) {
    Board.purge();
    this.sandbox.restore();
    done();
  },

  isInstanceOf(test) {
    test.expect(3);
    test.equal(new Suspendable() instanceof Withinable, true);
    test.equal(this.component instanceof Suspendable, true);
    test.equal(this.component instanceof Withinable, true);
    test.done();
  },

  pauseIsAFunction(test) {
    test.expect(1);
    const suspendable = new Suspendable();
    test.equal(typeof suspendable.pause, "function");
    test.done();
  },

  resumeIsAFunction(test) {
    test.expect(1);
    const suspendable = new Suspendable();
    test.equal(typeof suspendable.resume, "function");
    test.done();
  },

  suspendability(test) {
    test.expect(5);
    const suspendable = new Suspendable();
    const expectedBytes = [];
    const emittedBytes = [];

    suspendable.on("data", byte => emittedBytes.push(byte));

    let turns = 0;
    let interval = setInterval(() => {
      const byte = Crypto.randomBytes(1);
      turns++;
      suspendable.emit("data", byte);

      if (turns === 2) {
        suspendable.pause();
      }

      if (turns === 4) {
        suspendable.resume();
      }

      if (turns <= 2 || turns > 4) {
        expectedBytes.push(byte);
      }

      if (turns === 6) {
        test.equal(emittedBytes.length, 4);
        emittedBytes.forEach((b, index) => test.equal(b, expectedBytes[index]));
        clearInterval(interval);
        test.done();
      }
    }, 5);
  },

  componentSuspendability(test) {
    test.expect(5);
    const analogRead = this.analogRead.lastCall.args[1];
    const expectedBytes = [];
    const emittedBytes = [];

    this.component.on("data", byte => emittedBytes.push(byte));

    let turns = 0;
    let interval = setInterval(() => {
      const byte = Crypto.randomBytes(1);
      turns++;
      analogRead(byte);

      if (turns === 2) {
        this.component.pause();
      }

      if (turns === 4) {
        this.component.resume();
      }

      if (turns <= 2 || turns > 4) {
        expectedBytes.push(byte);
      }

      if (turns === 6) {
        test.equal(emittedBytes.length, 4);
        emittedBytes.forEach((b, index) => test.equal(b, expectedBytes[index]));
        clearInterval(interval);
        test.done();
      }
    }, 5);
  },

};
