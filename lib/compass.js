var Board = require("../lib/board.js"),
  Emitter = require("events").EventEmitter,
  util = require("util"),
  __ = require("../lib/fn.js"),
  int16 = __.int16;


var priv = new Map();

var Controllers = {

  /**
   * HMC5883L: 3-Axis Compass Module
   * 0x1E
   *
   * https://sites.google.com/site/parallaxinretailstores/home/compass-module-3-axis-hmc5883l
   *
   * http://www51.honeywell.com/aero/common/documents/myaerospacecatalog-documents/Defense_Brochures-documents/HMC5883L_3-Axis_Digital_Compass_IC.pdf
   * P. 10,11,12,13
   *
   * http://www.memsense.com/docs/MTD-0801_1_0_Calculating_Heading_Elevation_Bank_Angle.pdf
   *
   * https://www.loveelectronics.co.uk/Tutorials/13/tilt-compensated-compass-arduino-tutorial
   *
   */
  HMC5883L: {
    COMMANDS: {
      value: {
        // Configuration Register A
        CRA: 0x00,
        // Configuration Register B
        // This may change, depending on gauss
        CRB: 0x01,
        MEASUREMENTMODE: 0x02,
        READREGISTER: 0x03
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);
        var address = 0x1E;
        var READLENGTH = 6;

        state.scale = 1;
        state.register = 0x40;

        Object.assign(state, new Compass.Scale(opts.gauss || 0.88));

        this.io.i2cConfig(opts);

        // Set CRA
        this.io.i2cWrite(address, this.COMMANDS.CRA, 0x70);

        // Set CRB
        this.io.i2cWrite(address, this.COMMANDS.CRB, state.register);

        // Measurement: Continuous
        this.io.i2cWrite(address, this.COMMANDS.MEASUREMENTMODE, 0x00);

        // Initialize continuous read
        this.io.i2cRead(address, this.COMMANDS.READREGISTER, READLENGTH, function(bytes) {
          dataHandler.call(this, {
            x: int16(bytes[0], bytes[1]),
            y: int16(bytes[4], bytes[5]),
            z: int16(bytes[2], bytes[3]),
          });
        }.bind(this));
      }
    },
    toScaledHeading: {
      value: function(data) {
        var x = data.x * data.scale;
        var y = data.y * data.scale;

        return ToHeading(x, y);
      }
    }
  },

  /**
   * HMC6352: 2-Axis Compass Module
   * 0x42
   *
   * http://www.sparkfun.com/datasheets/Components/HMC6352.pdf
   * http://bildr.org/2011/01/hmc6352/
   */
  HMC6352: {
    COMMANDS: {
      value: {
        READREGISTER: 0x41
      }
    },
    initialize: {
      value: function(opts, dataHandler) {
        var state = priv.get(this);
        var address = 0x42 >> 1; // 0x42 >> 1
        var READLENGTH = 2;

        state.scale = 1;

        opts.delay = 10;

        this.io.i2cConfig(opts);

        this.io.i2cWrite(address, this.COMMANDS.READREGISTER);

        // Initialize continuous read
        this.io.i2cRead(address, this.COMMANDS.READREGISTER, READLENGTH, function(bytes) {
          dataHandler.call(this, {
            x: (((bytes[0] << 8) + bytes[1]) / 10) | 0,
            y: null,
            z: null,
          });
        }.bind(this));
      }
    },
    toScaledHeading: {
      value: function(data) {
        return data.x * data.scale;
      }
    }
  },
};


/**
 * Compass
 * @constructor
 *
 * five.Compass();
 *
 * five.Compass({
 *  controller: "HMC5883L",
 *  freq: 50,
 * });
 *
 *
 * Device Shorthands:
 *
 * "HMC5883L": new five.Magnetometer()
 *
 *
 * @param {Object} opts [description]
 *
 */

function Compass(opts) {

  if (!(this instanceof Compass)) {
    return new Compass(opts);
  }

  var controller = null;
  var state = {
    x: 0,
    y: 0,
    z: 0,
    scale: 0,
    register: 0,
    heading: 0
  };

  Board.Component.call(
    this, opts = Board.Options(opts)
  );

  if (opts.controller && typeof opts.controller === "string") {
    controller = Controllers[opts.controller.toUpperCase()];
  } else {
    controller = opts.controller;
  }

  if (controller === null || typeof controller !== "object") {
    throw new Error("Missing valid Compass controller");
  }

  Object.defineProperties(this, controller);

  if (!this.toScaledHeading) {
    this.toScaledHeading = opts.toScaledHeading || function(raw) { return raw; };
  }

  priv.set(this, state);

  if (typeof this.initialize === "function") {
    this.initialize(opts, function(data) {
      var isChange = false;

      state.x = data.x;
      state.y = data.y;
      state.z = data.z;

      var heading = this.heading;

      if (heading !== state.heading) {
        state.heading = heading;
        isChange = true;
      }

      this.emit("data", {
        heading: state.heading
      });

      if (isChange) {
        this.emit("change", {
          heading: state.heading
        });
      }
    });
  }
}


util.inherits(Compass, Emitter);


Object.defineProperties(Compass.prototype, {
  /**
   * [read-only] Bearing information
   * @name bearing
   * @property
   * @type Object
   *
   *
      name
      abbr
      low
      mid
      high
      heading
   *
   */

  bearing: {
    get: function() {
      var length = Compass.Points.length;
      var heading = Math.floor(this.heading);
      var point;

      for (var i = 0; i < length; i++) {
        point = Compass.Points[i];

        if (point.range.includes(heading)) {
          // Specify fields to return to avoid returning the
          // range array (too much noisy data)
          return {
            name: point.point,
            abbr: point.abbr,
            low: point.low,
            mid: point.mid,
            high: point.high,
            heading: heading
          };
        }
      }
    }
  },

  /**
   * [read-only] Heading (azimuth)
   * @name heading
   * @property
   * @type number
   */
  heading: {
    get: function() {
      var state = priv.get(this);
      return this.toScaledHeading(state);
    }
  }
});


function ToHeading(x, y) {
  /**
   *
   * Applications of Magnetoresistive Sensors in Navigation Systems
   * by Michael J. Caruso of Honeywell Inc.
   * http://www.ssec.honeywell.com/position-sensors/datasheets/sae.pdf
   *
   *
   * Azimuth (x=0, y<0)   = 90.0 (3)
   * Azimuth (x=0, y>0)   = 270.0
   * Azimuth (x<0)        = 180 - [arcTan(y/x)]*180/PI
   * Azimuth (x>0, y<0)   = - [arcTan(y/x)]*180/PI
   * Azimuth (x>0, y>0)   = 360 - [arcTan(y/x)]*180/PI
   *
   *
   *
   *
   *
   */
  /**
   *
   *
   * http://bildr.org/2012/02/hmc5883l_arduino/
   * @type {[type]}
   * Copyright (C) 2011 Love Electronics (loveelectronics.co.uk)

   This program is free software: you can redistribute it and/or modify it under the terms of the version 3 GNU General Public License as published by the Free Software Foundation.

   This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

   You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.

   */

  var heading = Math.atan2(y, x);

  if (heading < 0) {
    heading += 2 * Math.PI;
  }

  if (heading > 2 * Math.PI) {
    heading -= 2 * Math.PI;
  }

  return heading * (180 / Math.PI);
}


/**
 * Compass.scale Set the scale gauss for compass readings
 * @param  {Number} gauss [description]
 * @return {register}       [description]
 *
 * Ported from:
 * http://bildr.org/2012/02/hmc5883l_arduino/
 */

Compass.Scale = function(gauss) {

  if (gauss === 0.88) {
    this.register = 0x00;
    this.scale = 0.73;
  } else if (gauss === 1.3) {
    this.register = 0x01;
    this.scale = 0.92;
  } else if (gauss === 1.9) {
    this.register = 0x02;
    this.scale = 1.22;
  } else if (gauss === 2.5) {
    this.register = 0x03;
    this.scale = 1.52;
  } else if (gauss === 4.0) {
    this.register = 0x04;
    this.scale = 2.27;
  } else if (gauss === 4.7) {
    this.register = 0x05;
    this.scale = 2.56;
  } else if (gauss === 5.6) {
    this.register = 0x06;
    this.scale = 3.03;
  } else if (gauss === 8.1) {
    this.register = 0x07;
    this.scale = 4.35;
  } else {
    this.register = 0x00;
    this.scale = 1;
  }

  // Setting is in the top 3 bits of the register.
  this.register = this.register << 5;
};


/**
 * Compass.Points
 *
 * 32 Point Compass
 * +1 for North
 *
 */

Compass.Points = [{
  point: "North",
  abbr: "N",
  low: 354.38,
  mid: 360,
  high: 360
}, {
  point: "North",
  abbr: "N",
  low: 0,
  mid: 0,
  high: 5.62
}, {
  point: "North by East",
  abbr: "NbE",
  low: 5.63,
  mid: 11.25,
  high: 16.87
}, {
  point: "North-NorthEast",
  abbr: "NNE",
  low: 16.88,
  mid: 22.5,
  high: 28.12
}, {
  point: "NorthEast by North",
  abbr: "NEbN",
  low: 28.13,
  mid: 33.75,
  high: 39.37
}, {
  point: "NorthEast",
  abbr: "NE",
  low: 39.38,
  mid: 45,
  high: 50.62
}, {
  point: "NorthEast by East",
  abbr: "NEbE",
  low: 50.63,
  mid: 56.25,
  high: 61.87
}, {
  point: "East-NorthEast",
  abbr: "ENE",
  low: 61.88,
  mid: 67.5,
  high: 73.12
}, {
  point: "East by North",
  abbr: "EbN",
  low: 73.13,
  mid: 78.75,
  high: 84.37
}, {
  point: "East",
  abbr: "E",
  low: 84.38,
  mid: 90,
  high: 95.62
}, {
  point: "East by South",
  abbr: "EbS",
  low: 95.63,
  mid: 101.25,
  high: 106.87
}, {
  point: "East-SouthEast",
  abbr: "ESE",
  low: 106.88,
  mid: 112.5,
  high: 118.12
}, {
  point: "SouthEast by East",
  abbr: "SEbE",
  low: 118.13,
  mid: 123.75,
  high: 129.37
}, {
  point: "SouthEast",
  abbr: "SE",
  low: 129.38,
  mid: 135,
  high: 140.62
}, {
  point: "SouthEast by South",
  abbr: "SEbS",
  low: 140.63,
  mid: 146.25,
  high: 151.87
}, {
  point: "South-SouthEast",
  abbr: "SSE",
  low: 151.88,
  mid: 157.5,
  high: 163.12
}, {
  point: "South by East",
  abbr: "SbE",
  low: 163.13,
  mid: 168.75,
  high: 174.37
}, {
  point: "South",
  abbr: "S",
  low: 174.38,
  mid: 180,
  high: 185.62
}, {
  point: "South by West",
  abbr: "SbW",
  low: 185.63,
  mid: 191.25,
  high: 196.87
}, {
  point: "South-SouthWest",
  abbr: "SSW",
  low: 196.88,
  mid: 202.5,
  high: 208.12
}, {
  point: "SouthWest by South",
  abbr: "SWbS",
  low: 208.13,
  mid: 213.75,
  high: 219.37
}, {
  point: "SouthWest",
  abbr: "SW",
  low: 219.38,
  mid: 225,
  high: 230.62
}, {
  point: "SouthWest by West",
  abbr: "SWbW",
  low: 230.63,
  mid: 236.25,
  high: 241.87
}, {
  point: "West-SouthWest",
  abbr: "WSW",
  low: 241.88,
  mid: 247.5,
  high: 253.12
}, {
  point: "West by South",
  abbr: "WbS",
  low: 253.13,
  mid: 258.75,
  high: 264.37
}, {
  point: "West",
  abbr: "W",
  low: 264.38,
  mid: 270,
  high: 275.62
}, {
  point: "West by North",
  abbr: "WbN",
  low: 275.63,
  mid: 281.25,
  high: 286.87
}, {
  point: "West-NorthWest",
  abbr: "WNW",
  low: 286.88,
  mid: 292.5,
  high: 298.12
}, {
  point: "NorthWest by West",
  abbr: "NWbW",
  low: 298.13,
  mid: 303.75,
  high: 309.37
}, {
  point: "NorthWest",
  abbr: "NW",
  low: 309.38,
  mid: 315.00,
  high: 320.62
}, {
  point: "NorthWest by North",
  abbr: "NWbN",
  low: 320.63,
  mid: 326.25,
  high: 331.87
}, {
  point: "North-NorthWest",
  abbr: "NNW",
  low: 331.88,
  mid: 337.5,
  high: 343.12
}, {
  point: "North by West",
  abbr: "NbW",
  low: 343.13,
  mid: 348.75,
  high: 354.37
}];

// Add ranges to each compass point record
Compass.Points.forEach(function(point, k) {
  this[k].range = __.range(Math.floor(point.low), Math.floor(point.high));
}, Compass.Points);



/**
 * Fires once every N ms, equal to value of `freq`. Defaults to 66ms
 *
 * @event
 * @name read
 * @memberOf Compass
 */


/**
 * Fires when the calculated heading has changed
 *
 * @event
 * @name headingchange
 * @memberOf Compass
 */


module.exports = Compass;


// http://en.wikipedia.org/wiki/Relative_direction
