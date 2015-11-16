var Board = require("./board"),
  events = require("events"),
  util = require("util");

/**
 * Pir, IR.Motion
 * @deprecated
 * @param {Object} opts Options: pin, type, id, range
 */

function Pir(opts) {

  if (!(this instanceof Pir)) {
    return new Pir(opts);
  }

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  // Set the pin to INPUT mode
  this.mode = this.io.MODES.INPUT;
  this.io.pinMode(this.pin, this.mode);

  // PIR instance properties
  this.value = null;
  this.isCalibrated = false;
  this.freq = opts.freq || 25;

  // Analog Read event loop
  // TODO: make this "throttle-able"
  this.io.digitalRead(this.pin, function(data) {
    var timestamp = Date.now();

    // If this is not a calibration event
    if (this.value != null && this.value !== +data) {

      // Update current value of PIR instance
      this.value = +data;

      // "motionstart" event fired when motion occurs
      // within the observable range of the PIR sensor
      if (data) {
        this.emit("motionstart", timestamp);
      }

      // "motionend" event fired when motion has ceased
      // within the observable range of the PIR sensor
      if (!data) {
        this.emit("motionend", timestamp);
      }
    }

    // "calibrated" event fired when PIR sensor is
    // ready to detect movement/motion in observable range
    if (!this.isCalibrated) {
      this.isCalibrated = true;
      this.value = +data;
      this.emit("calibrated", timestamp);
    }
  }.bind(this));

  setInterval(function() {
    this.emit("data", Date.now());
  }.bind(this), this.freq);
}

util.inherits(Pir, events.EventEmitter);

module.exports = Pir;

// More information:
// http://www.ladyada.net/learn/sensors/pir.html
