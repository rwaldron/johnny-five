const Emitter = require("events");

class Withinable extends Emitter {
  constructor() {
    super();
  }
  within(range, unit, callback) {
    let upper;

    if (typeof range === "number") {
      upper = range;
      range = [0, upper];
    }

    if (!Array.isArray(range)) {
      throw new Error("within expected a range array");
    }

    if (typeof unit === "function") {
      callback = unit;
      unit = "value";
    }

    if (typeof this[unit] === "undefined") {
      return this;
    }

    this.on("data", () => {
      const value = this[unit];
      if (value >= range[0] && value <= range[1]) {
        callback.call(this, null, value);
      }
    });
    return this;
  }
}

module.exports = Withinable;
