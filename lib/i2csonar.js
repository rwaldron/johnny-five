var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  within = require("./mixins/within"),
  __ = require("./fn");

var Devices,
  // Speed of sound in m/s
  soundSpeed = 343.2,
  cmToInches = 0.39;

/**
 * I2CSonar
 * @constructor
 *
 * @param {Object} opts Options: pin (analog)
 */
function I2CSonar(opts) {

  if (!(this instanceof I2CSonar)) {
    return new I2CSonar(opts);
  }

  var address, 
    data, 
    device, 
    initialize,
    median = 0, 
    last = 0,
    samples = [];

          
  // Initialize a Device instance on a Board
  Board.Device.call(
      this, opts = Board.Options(opts)
  );

  // TODO It is still I2c related.
  address = opts.address || device.address;
  device = Devices[opts.device];
  initialize = device.initialize;

  // Read event throttling
  this.freq = opts.freq || 250;
  this.value = null;

  this.setMaxListeners(100);

  // Throttle
  setInterval(function() {

    // Nothing read since previous interval
    if (samples.length === 0) {
        return;
    }

    median = samples.sort()[Math.floor(samples.length / 2)];
    this.value = median;

    this.emit("data", median);


    // If the median value for this interval is not the same as the
    // median value in the last interval, fire a "change" event.
    //
    if (last && median && (median.toFixed(1) !== last.toFixed(1))) {
        this.emit("change", median);
    }

    // Store this media value for comparison
    // in next interval
    last = median;

    // Reset samples;
    samples.length = 0;
  }.bind(this), this.freq);

  Object.defineProperties(this, {
    // Based on ms,
    cm: {
      get: function() {
          return ((((median / 2) * soundSpeed) / 10) / 1000).toFixed(1);
      }
    },
    inches: {
      get: function() {
          return (((((median / 2) * soundSpeed) / 10) / 1000) * cmToInches).toFixed(1);
      }
    }
  });

  function onData(data) {
      samples.push(data);
  }

  initialize.call(this, onData);
}

util.inherits(I2CSonar, events.EventEmitter);
__.mixin(I2CSonar.prototype, within);

module.exports = I2CSonar;


Devices = {

  "SRF10": {
    defaultAddress: 0x70,

    initialize: function(onData) {
     
      var address = 0x70,
        // It is by specification
        delay = 65;

      // Set up I2C data connection
      this.io.sendI2CConfig(0);

      // Startup parameter
      this.io.sendI2CWriteRequest(address, [0x01, 16]);
      this.io.sendI2CWriteRequest(address, [0x02, 255]);

      this.io.setMaxListeners(100);

      function loop() {

        function ready() {

          this.io.sendI2CWriteRequest(address, [0x02]);
          this.io.sendI2CReadRequest(address, 2, function(x) {

              var data = (x[0] << 8) | x[1];
              onData.call(this, data);
          }.bind(this));

          loop.call(this);
        }

        // 0x52 result in us (microseconds)
        this.io.sendI2CWriteRequest(address, [0x00, 0x52]);

        setTimeout(ready.bind(this), delay);
      }

      loop.call(this);
    }
  }
};

// Reference
//
// http://www.robot-electronics.co.uk/htm/srf10tech.htm
