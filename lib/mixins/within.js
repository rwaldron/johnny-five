var mixins = {

  within: function(range, unit, callback) {
    var upper;

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

    // Use the continuous read event for high resolution
    this.on("data", function() {
      var value = this[unit];
      if (value >= range[0] && value <= range[1]) {
        callback.call(this, null, value);
      }
    }.bind(this));

    return this;
  }
};

module.exports = mixins;
