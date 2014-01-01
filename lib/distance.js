var Sensor = require("../lib/sensor.js"),
  util = require("util");

var Devices = {
  GP2Y0A21YK: {
    // https://www.sparkfun.com/products/242
    cm: {
      get: function() {
        return +(12343.85 * Math.pow(this.raw, -1.15)).toFixed(2);
      }
    }
  },
  GP2D120XJ00F: {
    // https://www.sparkfun.com/products/8959
    cm: {
      get: function() {
        return +((2914 / (this.raw + 5)) - 1).toFixed(2);
      }
    }
  },
  GP2Y0A02YK0F: {
    // https://www.sparkfun.com/products/8958
    cm: {
      get: function() {
        return +(10650.08 * Math.pow(this.raw, -0.935) - 10).toFixed(2);
      }
    }
  }
};

// Otherwise known as...
Devices["2Y0A21"] = Devices.GP2Y0A21YK;
Devices["2D120X"] = Devices.GP2D120XJ00F;
Devices["2Y0A02"] = Devices.GP2Y0A02YK0F;

function Distance(opts) {

  if (!(this instanceof Distance)) {
    return new Distance(opts);
  }

  Sensor.call(this, opts);

  var device;
  if (typeof opts.device === "string") {
    device = Devices[opts.device];
  } else {
    device = opts.device;
  }

  if (device) {
    if (!device.inches) {
      device.inches = {
        get: function() {
          return +(this.cm * 0.39).toFixed(2);
        }
      };
    }
  } else {
    device = {
      inches: {
        value: null
      },
      cm: {
        value: null
      }
    };
  }

  Object.defineProperties(this, device);
}

util.inherits(Distance, Sensor);

module.exports = Distance;


// http://www.acroname.com/robotics/info/articles/sharp/sharp.html
