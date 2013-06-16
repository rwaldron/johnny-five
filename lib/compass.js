var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js");


var priv = new WeakMap(),
    Devices;


/**
 * Compass
 * @constructor
 *
 * five.Compass();
 *
 * five.Compass({
 *  device: "HMC5883L",
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

function Compass( opts ) {

  if ( !(this instanceof Compass) ) {
    return new Compass( opts );
  }

  var address, bytes, data, descriptor, device, delay,
      last, properties, read, setup;

  // Initialize a Device instance on a Board
  Board.Device.call(
    this, opts = Board.Options( opts )
  );

  device = Devices[ opts.device ];

  address = device.address;
  bytes = device.bytes;
  data = device.data;
  delay = device.delay;
  setup = device.setup;
  properties = device.properties;

  // Read event throttling
  this.freq = opts.freq || 500;


  // Make private data entry
  priv.set( this, { x: 0, y: 0, z: 0 } );


  // Correct value set in scale()
  this.scale = 1;
  this.register = 0x00;

  Compass.scale.call( this, opts.gauss );

  // Set up I2C data connection
  this.firmata.sendI2CConfig();

  // Enumerate and write each set of setup instructions
  setup.forEach(function( byteArray ) {
    this.firmata.sendI2CWriteRequest( address, byteArray );
  }, this);


  this.setMaxListeners( 100 );

  // Read Request Loop
  setInterval(function() {
    // Set pointer to X most signficant byte
    this.firmata.sendI2CWriteRequest( address, [ 0x03 ] );

    // Read from register
    this.firmata.sendI2CReadRequest( address, bytes, data.bind(this) );

    // Emit "headingchange" events whenever the calculated
    // heading accessor changes

    // TODO: handling for 360/0
    if ( __.range( last - 1, last + 1 ).indexOf( Math.floor(this.heading) ) === -1 ) {
      this.emit( "headingchange", {
        now: this.heading,
        previous: last
      });
    }

    last = Math.floor( this.heading );

  }.bind(this), delay );

  // "read" throttle loop
  setInterval(function() {

    this.emit( "read", null, Date.now() );

  }.bind(this), this.freq );


  descriptor = __.extend({}, {
    /**
     * raw x, y, z data
     * @name raw
     * @property
     * @type Object
     */
    raw: {
      get: function() {
        var raw = priv.get( this );
        return {
          x: raw.x,
          y: raw.y,
          z: raw.z || null
        };
      }
    },
    /**
     * scaled x, y, z data
     * @name scaled
     * @property
     * @type Object
     */
    scaled: {
      get: function() {
        var raw = priv.get( this );
        return {
          x: raw.x * this.scale,
          y: raw.y * this.scale,
          z: raw.z ? raw.z * this.scale : null
        };
      }
    }
  });

  // If this compass device has it's own properties
  // then merge with the defaults;
  if ( properties ) {
    descriptor = __.extend( descriptor, properties );
  }

  // Define instance accessors with merged descriptor properties
  Object.defineProperties( this, descriptor );
}

/**
 * Compass.scale Set the scale gauss for compass readings
 * @param  {Number} gauss [description]
 * @return {register}       [description]
 *
 * Ported from:
 * http://bildr.org/2012/02/hmc5883l_arduino/
 */

Compass.scale = function( gauss ) {

  if ( !(this instanceof Compass) ) {
    return;
  }

  if ( gauss === 0.88 ) {
    this.register = 0x00;
    this.scale = 0.73;
  }
  else if ( gauss === 1.3 ) {
    this.register = 0x01;
    this.scale = 0.92;
  }
  else if ( gauss === 1.9 ) {
    this.register = 0x02;
    this.scale = 1.22;
  }
  else if ( gauss === 2.5 ) {
    this.register = 0x03;
    this.scale = 1.52;
  }
  else if ( gauss === 4.0 ) {
    this.register = 0x04;
    this.scale = 2.27;
  }
  else if ( gauss === 4.7 ) {
    this.register = 0x05;
    this.scale = 2.56;
  }
  else if ( gauss === 5.6 ) {
    this.register = 0x06;
    this.scale = 3.03;
  }
  else if ( gauss === 8.1 ) {
    this.register = 0x07;
    this.scale = 4.35;
  }
  else {
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

Compass.Points = [
  {
    "point": "North",
    "abbr": "N",
    "low": 354.38,
    "mid": 360,
    "high": 360
  },
  {
    "point": "North",
    "abbr": "N",
    "low": 0,
    "mid": 0,
    "high": 5.62
  },
  {
    "point": "North by East",
    "abbr": "NbE",
    "low": 5.63,
    "mid": 11.25,
    "high": 16.87
  },
  {
    "point": "North-NorthEast",
    "abbr": "NNE",
    "low": 16.88,
    "mid": 22.5,
    "high": 28.12
  },
  {
    "point": "NorthEast by North",
    "abbr": "NEbN",
    "low": 28.13,
    "mid": 33.75,
    "high": 39.37
  },
  {
    "point": "NorthEast",
    "abbr": "NE",
    "low": 39.38,
    "mid": 45,
    "high": 50.62
  },
  {
    "point": "NorthEast by East",
    "abbr": "NEbE",
    "low": 50.63,
    "mid": 56.25,
    "high": 61.87
  },
  {
    "point": "East-NorthEast",
    "abbr": "ENE",
    "low": 61.88,
    "mid": 67.5,
    "high": 73.12
  },
  {
    "point": "East by North",
    "abbr": "EbN",
    "low": 73.13,
    "mid": 78.75,
    "high": 84.37
  },
  {
    "point": "East",
    "abbr": "E",
    "low": 84.38,
    "mid": 90,
    "high": 95.62
  },
  {
    "point": "East by South",
    "abbr": "EbS",
    "low": 95.63,
    "mid": 101.25,
    "high": 106.87
  },
  {
    "point": "East-SouthEast",
    "abbr": "ESE",
    "low": 106.88,
    "mid": 112.5,
    "high": 118.12
  },
  {
    "point": "SouthEast by East",
    "abbr": "SEbE",
    "low": 118.13,
    "mid": 123.75,
    "high": 129.37
  },
  {
    "point": "SouthEast",
    "abbr": "SE",
    "low": 129.38,
    "mid": 135,
    "high": 140.62
  },
  {
    "point": "SouthEast by South",
    "abbr": "SEbS",
    "low": 140.63,
    "mid": 146.25,
    "high": 151.87
  },
  {
    "point": "South-SouthEast",
    "abbr": "SSE",
    "low": 151.88,
    "mid": 157.5,
    "high": 163.12
  },
  {
    "point": "South by East",
    "abbr": "SbE",
    "low": 163.13,
    "mid": 168.75,
    "high": 174.37
  },
  {
    "point": "South",
    "abbr": "S",
    "low": 174.38,
    "mid": 180,
    "high": 185.62
  },
  {
    "point": "South by West",
    "abbr": "SbW",
    "low": 185.63,
    "mid": 191.25,
    "high": 196.87
  },
  {
    "point": "South-SouthWest",
    "abbr": "SSW",
    "low": 196.88,
    "mid": 202.5,
    "high": 208.12
  },
  {
    "point": "SouthWest by South",
    "abbr": "SWbS",
    "low": 208.13,
    "mid": 213.75,
    "high": 219.37
  },
  {
    "point": "SouthWest",
    "abbr": "SW",
    "low": 219.38,
    "mid": 225,
    "high": 230.62
  },
  {
    "point": "SouthWest by West",
    "abbr": "SWbW",
    "low": 230.63,
    "mid": 236.25,
    "high": 241.87
  },
  {
    "point": "West-SouthWest",
    "abbr": "WSW",
    "low": 241.88,
    "mid": 247.5,
    "high": 253.12
  },
  {
    "point": "West by South",
    "abbr": "WbS",
    "low": 253.13,
    "mid": 258.75,
    "high": 264.37
  },
  {
    "point": "West",
    "abbr": "W",
    "low": 264.38,
    "mid": 270,
    "high": 275.62
  },
  {
    "point": "West by North",
    "abbr": "WbN",
    "low": 275.63,
    "mid": 281.25,
    "high": 286.87
  },
  {
    "point": "West-NorthWest",
    "abbr": "WNW",
    "low": 286.88,
    "mid": 292.5,
    "high": 298.12
  },
  {
    "point": "NorthWest by West",
    "abbr": "NWbW",
    "low": 298.13,
    "mid": 303.75,
    "high": 309.37
  },
  {
    "point": "NorthWest",
    "abbr": "NW",
    "low": 309.38,
    "mid": 315.00,
    "high": 320.62
  },
  {
    "point": "NorthWest by North",
    "abbr": "NWbN",
    "low": 320.63,
    "mid": 326.25,
    "high": 331.87
  },
  {
    "point": "North-NorthWest",
    "abbr": "NNW",
    "low": 331.88,
    "mid": 337.5,
    "high": 343.12
  },
  {
    "point": "North by West",
    "abbr": "NbW",
    "low": 343.13,
    "mid": 348.75,
    "high": 354.37
  }
];

// Add ranges to each compass point record
Compass.Points.forEach(function( point, k ) {
  this[ k ].range = __.range( Math.floor(point.low),  Math.floor(point.high) );
}, Compass.Points );


util.inherits( Compass, events.EventEmitter );



Devices = {
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
  "HMC5883L": {
    address: 0x1E,
    bytes: 6,
    delay: 100,

    // read request data handler
    data: function( data ) {
      var raw = priv.get( this );

      // console.log( data );

      raw.x = ( data[0] << 8 ) | data[1];
      raw.y = ( data[4] << 8 ) | data[5];
      raw.z = ( data[2] << 8 ) | data[3];

      // Negative number, nT spike correction
      // Derived and adapted from:
      // Jeff Hoefs' Breakout.js > MagnetoMeterHMC5883.js
      Object.keys( raw ).forEach(function( key ) {
        var val = raw[ key ];

        raw[ key ] = val >> 15 ?
          ( (val ^ 0xFFFF) + 1 ) * -1 : val;
      });

      // console.log( raw );
      priv.set( this, raw );
    },

    // These are added to the property descriptors defined
    // within the constructor
    // Reference:
    // http://casanovasadventures.com/catalog/compass/p1409.htm
    // http://en.wikipedia.org/wiki/Boxing_the_compass
    // http://en.wikipedia.org/wiki/File:Compass_Card.png
    // http://en.wikipedia.org/wiki/Boxing_the_compass#Compass_point_names
    properties: {

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
          var k, len, heading, point;

          k = 0;
          len = Compass.Points.length;

          heading = Math.floor( this.heading );

          for ( ; k < len; k++ ) {
            point = Compass.Points[ k ];

            if ( point.range.indexOf(heading) !== -1 ) {
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
          var heading, raw, x, y, z;

          // Aquire raw x, y, z data from private data map
          raw = priv.get( this );

          x = raw.x;
          y = raw.y;
          z = raw.z;

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

          heading = Math.atan2( y, x );

          if ( heading < 0 ) {
            heading += 2 * Math.PI;
          }

          if ( heading > 2 * Math.PI ) {
            heading -= 2 * Math.PI;
          }

          return heading * (180 / Math.PI);
        }
      }
    },
    // http://torrentula.to.funpic.de/tag/i2c/
    setup: [
      // CRA
      [ 0x00, 0x70 ],
      // CRB
      [ 0x01, 0x40 ],
      // Continuous measurement mode
      [ 0x02, 0x00 ]
    ],
    preread: [
      [ 0x03 ]
    ]
  },
  /**
   * HMC6352: 2-Axis Compass Module
   * 0x42
   *
   * http://www.sparkfun.com/datasheets/Components/HMC6352.pdf
   */
  "HMC6352": {
    address: 0x42,
    bytes: 2,
    read: function( data ) {
      var v;

      v = ( data[1] << 8 ) | data[2];

      // TODO: Find out if this device is still in production
    },
    setup: []
  }
};



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
