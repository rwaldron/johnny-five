var Board = require("../lib/board.js"),
  events = require("events"),
  util = require("util"),
  within = require("./mixins/within"),
  __ = require("./fn");

var Devices,
  // Speed of sound in m/s
  soundSpeed = 343.2;

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
    bytes,
    preRead, 
    startRanging,
    data, 
    device, 
    delay,
    setup,
    median = 0, 
    last = 0, 
    samples = [];
          
  // Initialize a Device instance on a Board
  Board.Device.call(
      this, opts = Board.Options(opts)
  );

  device = Devices[opts.device];

  address = opts.address || device.address;
  bytes = device.bytes;
  preRead = device.preRead;
  startRanging = device.startRanging;
  data = device.data;
  delay = device.delay;
  setup = device.setup;

  // Read event throttling
  this.freq = opts.freq || 250;
  this.value = null;

  // Set up I2C data connection
  this.io.sendI2CConfig(0);

  // Enumerate and write each set of setup instructions
  setup.forEach(function(byteArray) {
    this.io.sendI2CWriteRequest(address, byteArray);
  }, this);

  this.setMaxListeners(100);

  function loop() {

    function ready() {

      this.io.sendI2CWriteRequest(address, preRead);
      this.io.sendI2CReadRequest(address, bytes, function(x){
          samples.push(data(x));
      });

      loop.call(this);
    }

    this.io.sendI2CWriteRequest(address, startRanging);

    setTimeout(ready.bind(this), delay);
  }

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
          return (((((median / 2) * soundSpeed) / 10) / 1000) * 0.39).toFixed(1);
      }
    }
  });

  loop.call(this);
}

util.inherits(I2CSonar, events.EventEmitter);
__.mixin(I2CSonar.prototype, within);

module.exports = I2CSonar;


Devices = {

  "SRF10": {
    address: 0x70,
    bytes: 2,
    delay: 65,

    // read request data handler
    data: function(x) {
      return (x[0] << 8) | x[1];
    },

    setup: [
      [0x01, 16],
      [0x02, 255]
    ],

    startRanging: [
      0x00,
      // result in ms
      0x52
    ],
    preRead: [
      [0x02]
    ]
  }
};

// Reference
//
// http://www.robot-electronics.co.uk/htm/srf10tech.htm
