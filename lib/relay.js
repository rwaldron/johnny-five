const Board = require("./board");
const Collection = require("./mixins/collection");
const Pins = Board.Pins;
const priv = new Map();

class Relay {
  constructor(options) {

    const pinValue = typeof options === "object" ? options.pin : options;

    Board.Component.call(
      this, options = Board.Options(options)
    );

    options.type = options.type || "NO";

    const state = {
      isInverted: options.type === "NC",
      isClosed: false,
      value: null,
    };

    priv.set(this, state);

    Object.defineProperties(this, {
      value: {
        get() {
          return Number(this.isClosed);
        }
      },
      type: {
        get() {
          return state.isInverted ? "NC" : "NO";
        }
      },
      isClosed: {
        get() {
          return state.isClosed;
        }
      }
    });

    if (Pins.isFirmata(this) &&
        (typeof pinValue === "string" && pinValue[0] === "A")) {
      this.pin = this.io.analogPins[+pinValue.slice(1)];
      this.io.pinMode(this.pin, this.io.MODES.OUTPUT);
    }
  }

  /**
   * close Close the relay circuit
   * @return {Relay}
   */
  close() {
    const state = priv.get(this);

    this.io.digitalWrite(
      this.pin, state.isInverted ? this.io.LOW : this.io.HIGH
    );
    state.isClosed = true;

    return this;
  }

  /**
   * open Open the relay circuit
   * @return {Relay}
   */
  open() {
    const state = priv.get(this);

    this.io.digitalWrite(
      this.pin, state.isInverted ? this.io.HIGH : this.io.LOW
    );
    state.isClosed = false;

    return this;
  }

  /**
   * toggle Toggle the on/off state of the relay
   * @return {Relay}
   */
  toggle() {
    const state = priv.get(this);

    if (state.isClosed) {
      this.open();
    } else {
      this.close();
    }

    return this;
  }
}

/**
 * Relays()
 * new Relays()
 *
 * Constructs an Array-like instance of all relays
 */
class Relays extends Collection {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }
  get type() {
    return Relay;
  }
}


/*
 * Relays, on()
 *
 * Turn all relays on
 *
 * eg. collection.on();
 *
 *
 * Relays, off()
 *
 * Turn all relays off
 *
 * eg. collection.off();
 *
 *
 * Relays, open()
 *
 * Open all relays
 *
 * eg. collection.open();
 *
 *
 * Relays, close()
 *
 * Close all relays
 *
 * eg. collection.close();
 *
 *
 * Relays, toggle()
 *
 * Toggle the state of all relays
 *
 * eg. collection.toggle();
 */

Collection.installMethodForwarding(
  Relays.prototype, Relay.prototype
);

Relay.Collection = Relays;

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Relay.purge = () => {
    priv.clear();
  };
}

module.exports = Relay;
