var Board = require("../lib/board.js");

var priv = new WeakMap();

function Relay(opts) {

  var pinValue;

  if (!(this instanceof Relay)) {
    return new Relay(opts);
  }

  pinValue = typeof opts === "object" ? opts.pin : opts;

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options(opts)
  );

  if (typeof pinValue === "string" && pinValue[0] === "A") {
    pinValue = this.io.analogPins[+pinValue.slice(1)];
  }

  pinValue = +pinValue;

  priv.set(this, {
    isOn: false,
    value: null,
  });

  Object.defineProperties(this, {
    value: {
      get: function() {
        return priv.get(this).value;
      }
    },
    isOn: {
      get: function() {
        return priv.get(this).isOn;
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

  this.io.digitalWrite(this.pin, this.io.HIGH);
  state.isOn = true;

  return this;
};

/**
 * off Turn the relay off
 * @return {Relay}
 */
Relay.prototype.off = function() {
  var state = priv.get(this);

  this.io.digitalWrite(this.pin, this.io.LOW);
  state.isOn = false;

  return this;
};

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