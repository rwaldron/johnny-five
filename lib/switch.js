const Board = require("./board");
const Collection = require("./mixins/collection");
const Emitter = require("events");
const Fn = require("./fn");

/**
 * Switch
 * @constructor
 *
 * five.Switch();
 *
 * five.Switch({
 *   pin: 10
 * });
 *
 *
 * @param {Object} options [description]
 *
 */

class Switch extends Emitter {
  constructor(options) {

    super();

    Board.Component.call(
      this, options = Board.Options(options)
    );

    // Create a 5 ms debounce boundary on event triggers
    // this avoids button events firing on
    // press noise and false positives
    const trigger = Fn.debounce(type => this.emit(type, this), 5);

    // Resolve the default type to Normally Open
    options.type = options.type || "NO";

    // Is this instance Normally Open?
    const isNormallyOpen = options.type === "NO";
    let raw = null;
    let invert = typeof options.invert !== "undefined" ?
      options.invert : (isNormallyOpen || false);

    // Logical Defaults
    let closeValue = 1;
    let openValue = 0;

    if (invert) {
      closeValue ^= 1;
      openValue ^= 1;
    }

    this.io.pinMode(this.pin, this.io.MODES.INPUT);

    if (isNormallyOpen) {
      this.io.digitalWrite(this.pin, this.io.HIGH);
    }

    this.io.digitalRead(this.pin, data => {
      raw = data;

      trigger.call(this, this.isOpen ? "open" : "close");
    });

    Object.defineProperties(this, {
      value: {
        get() {
          return Number(this.isOpen);
        }
      },
      invert: {
        get() {
          return invert;
        },
        set(value) {
          invert = value;
          closeValue = invert ? 0 : 1;
          openValue = invert ? 1 : 0;
        }
      },
      closeValue: {
        get() {
          return closeValue;
        },
        set(value) {
          closeValue = value;
          openValue = value ^ 1;
        }
      },
      openValue: {
        get() {
          return openValue;
        },
        set(value) {
          openValue = value;
          closeValue = value ^ 1;
        }
      },
      isOpen: {
        get() {
          return raw === openValue;
        }
      },
      isClosed: {
        get() {
          return raw === closeValue;
        }
      },
    });
  }
}


/**
 * Fired when the Switch is close
 *
 * @event
 * @name close
 * @memberOf Switch
 */


/**
 * Fired when the Switch is opened
 *
 * @event
 * @name open
 * @memberOf Switch
 */


/**
 * Switches()
 * new Switches()
 *
 * Constructs an Array-like instance of all servos
 */
class Switches extends Collection.Emitter {
  constructor(numsOrObjects) {
    super(numsOrObjects);
  }

  get type() {
    return Switch;
  }
}

Collection.installMethodForwarding(
  Switches.prototype, Switch.prototype
);

// Assign Switches Collection class as static "method" of Switch.
Switch.Collection = Switches;



module.exports = Switch;
