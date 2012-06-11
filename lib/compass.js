var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap


var DeviceMap,
    priv = new WeakMap();

DeviceMap = {
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
    addr: 0x1E,
    bytes: 6,
    delay: 66,

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
    properties: {

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
           removes: azimuth from variable initialization list

           azimuth = Math.atan( x / y ) * 180 / Math.PI;

           console.log( "azimuth", azimuth, [ x, y, z ] );

           if ( x === 0 && y < 0 ) {
             console.log( "x === 0 && y < 0 [90]" );
             heading = 90;
           }

           if ( x === 0 && y > 0 ) {
             console.log( "x === 0 && y > 0 [270]" );
             heading = 270;
           }

           if ( x < 0 ) {
             console.log( "x < 0 [180 - azimuth]" );
             heading = 180 - azimuth;
           }

           if ( x > 0 && y < 0 ) {
             console.log( "x > 0 && y < 0 [0 - azimuth]" );
             heading = 0 - azimuth;
           }

           if ( x > 0 && y > 0 ) {
             console.log( "x > 0 && y > 0 [360 - azimuth]" );
             heading = 360 - azimuth;
           }
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
            heading -= 2 * Math.PI
          };

          return heading * (180 / Math.PI);

          return heading;
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
    addr: 0x42,
    bytes: 2,
    read: function( data ) {
      var v;

      v = ( data[1] << 8 ) | data[2];

      // TODO: Find out if this device is still in production
    },
    setup: []
  }
};





function Compass( opts ) {

  if ( !(this instanceof Compass) ) {
    return new Compass( opts );
  }

  var address, bytes, descriptor, device, delay,
      last, properties, read, setup;

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;

  device = DeviceMap[ opts.device ];

  address = device.addr;
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

  // Iterate and write each set of setup instructions
  setup.forEach(function( byteArray ) {
    this.firmata.sendI2CWriteRequest( address, byteArray );
  }, this);

  // Read Request Loop
  setInterval(function() {
    // Set pointer to X most signficant byte
    this.firmata.sendI2CWriteRequest( address, [ 0x03 ] );

    // Read from register
    this.firmata.sendI2CReadRequest( address, bytes, data.bind(this) );

    // Emit "headingchange" events whenever the calculated
    // heading accessor changes
    if ( Math.floor(this.heading) !== Math.floor(last) ) {
      this.emit( "headingchange", {
        now: this.heading,
        previous: last
      });
    }

    last = this.heading;

  }.bind(this), delay );

  // "read" throttle loop
  setInterval(function() {

    this.emit( "read", null, Date.now() );

  }.bind(this), this.freq );


  descriptor = __.extend({}, {
    axis: {
      get: function() {
        var raw = priv.get( this );
        return {
          x: raw.x,
          y: raw.y,
          z: raw.z || null
        };
      }
    },
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
};

/**
 * scale Set the scale gauss for compass readings
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

  if ( gauss == 0.88 ) {
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

util.inherits( Compass, events.EventEmitter );

module.exports = Compass;
