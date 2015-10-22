var Board = require("../lib/board.js");

var priv = new Map();

function Relay(opts) {

  var state;

  if (!(this instanceof Relay)) {
    return new Relay(opts);
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  opts.type = opts.type || "NO";

  state = {
    isInverted: opts.type === "NC",
    isOn: false,
    value: null,
  };

  priv.set(this, state);

  Object.defineProperties(this, {
    value: {
      get: function() {
        return Number(this.isOn);
      }
    },
    type: {
      get: function() {
        return state.isInverted ? "NC" : "NO";
      }
    },
    isOn: {
      get: function() {
        return state.isOn;
      }
    }
  });
}

/**
 * on Turn the relay on
 * @return {Relay}
 */
Relay.prototype.on = function() {
  var state = priv.get(this);

  this.io.digitalWrite(
    this.pin, state.isInverted ? this.io.LOW : this.io.HIGH
  );
  state.isOn = true;

  return this;
};

Relay.prototype.close = Relay.prototype.on;

/**
 * off Turn the relay off
 * @return {Relay}
 */
Relay.prototype.off = function() {
  var state = priv.get(this);

  this.io.digitalWrite(
    this.pin, state.isInverted ? this.io.HIGH : this.io.LOW
  );
  state.isOn = false;

  return this;
};

Relay.prototype.open = Relay.prototype.off;

/**
 * toggle Toggle the on/off state of the relay
 * @return {Relay}
 */
Relay.prototype.toggle = function() {
  var state = priv.get(this);

  if (state.isOn) {
    this.off();
  } else {
    this.on();
  }

  return this;
};

module.exports = Relay;
