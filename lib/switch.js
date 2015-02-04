var Board = require("../lib/board.js"),
  __ = require("../lib/fn.js"),
  events = require("events"),
  util = require("util");

// Switch instance private data
var priv = new Map(),
  aliases = {
    closed: ["close", "closed", "on"],
    open: ["open", "off"]
  };


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
 * @param {Object} opts [description]
 *
 */

function Switch(opts) {

  if (!(this instanceof Switch)) {
    return new Switch(opts);
  }

  // Create a 5 ms debounce boundary on event triggers
  // this avoids button events firing on
  // press noise and false positives
  var trigger = __.debounce(function(key) {
    aliases[key].forEach(function(type) {
      this.emit(type, null);
    }, this);
  }, 7);

  var state = {
    isClosed: false
  };


  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  // Set the pin to INPUT mode
  this.mode = this.io.MODES.INPUT;
  this.io.pinMode(this.pin, this.mode);

  // Create a "state" entry for privately
  // storing the state of the Switch
  priv.set(this, state);

  // Analog Read event loop
  this.io.digitalRead(this.pin, function(data) {
    var err = null;

    // data = 0, this.isClosed = true
    // indicates that the Switch has been opened
    // after previously being closed
    if (!data && this.isClosed) {
      state.isClosed = false;

      trigger.call(this, "open");
    }

    // data = 1, this.isClosed = false
    // indicates that the Switch has been closed
    // after previously being open
    if (data && !this.isClosed) {

      // Update private data
      state.isClosed = true;

      // Call debounced event trigger for given "key"
      // This will trigger all event aliases assigned
      // to "key"
      trigger.call(this, "closed" /* key */ );
    }
  }.bind(this));

  Object.defineProperties(this, {
    isClosed: {
      get: function() {
        return state.isClosed;
      }
    }
  });
}

util.inherits(Switch, events.EventEmitter);


/**
 * Fired when the Switch is closed
 *
 * @event
 * @name closed
 * @memberOf Switch
 */


/**
 * Fired when the Switch is opened
 *
 * @event
 * @name open
 * @memberOf Switch
 */


module.exports = Switch;
