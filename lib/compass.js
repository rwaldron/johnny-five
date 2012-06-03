var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap


// Known I2C Device Address Map
var I2CAddressMap, compassMap;


I2CAddressMap = {
  /**
   * HMC5883L: 3-Axis Compass Module
   * 0x1E
   *
   * https://sites.google.com/site/parallaxinretailstores/home/compass-module-3-axis-hmc5883l
   */
  "HMC5883L": {
    addr: 0x1E,
    bytes: 6,
    read: function( data ) {
      var ref = compassMap.get( this );

      ref.x = ( data[1] << 8 ) | data[2];
      ref.y = ( data[5] << 8 ) | data[6];
      ref.z = ( data[3] << 8 ) | data[4];

      compassMap.set( this, ref );
    },
    write: [ 0x02, 0x00 ]
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
    },
    write: []
  }
};


compassMap = new WeakMap();


function Compass( opts ) {

  if ( !(this instanceof Compass) ) {
    return new Compass( opts );
  }

  var address, bytes, config, read, write;

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;

  config = I2CAddressMap[ opts.device ];

  address = config.addr;
  write = config.write;
  bytes = config.bytes;
  read = config.read;

  this.freq = opts.freq || 500;

  // Set up I2C data connection
  this.firmata.sendI2CConfig();

  setInterval(function() {

    this.firmata.sendI2CWriteRequest( address, write );
    this.firmata.sendI2CReadRequest( address, bytes, read.bind(this) );

    this.emit( "read", null, Date.now() );

  }.bind(this), this.freq );

  // Make private data entry
  compassMap.set( this, { x: 0, y: 0, z: 0 } );

  Object.defineProperties( this, {

    axis: {
      get: function() {
        var ref = compassMap.get( this );

        return {
          x: ref.x,
          y: ref.y,
          z: ref.z
        };
      }
    },
    scaled: {
      get: function() {
        var ref = compassMap.get( this );
        return {
          x: ref.x * 0.92,
          y: ref.y * 0.92,
          z: ref.z * 0.92
        };
      }
    },
    heading: {
      get: function() {
        var azimuth, heading, offset, ref;

        ref = compassMap.get( this );
        azimuth = Math.atan( ref.x / ref.y ) * 180 / Math.PI;

        /**
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
         * http://bildr.org/2012/02/hmc5883l_arduino/
         */

        if ( ref.x === 0 && ref.y < 0 ) {
          heading = 90.0;
        }
        if ( ref.x === 0 && ref.y > 0 ) {
          heading = 270.0
        }
        if ( ref.x < 0 ) {
          heading = 180.0 - azimuth;
        }
        if ( ref.x > 0 && ref.y < 0 ) {
          heading = 0.0 - azimuth;
        }
        if ( ref.x > 0 && ref.y > 0 ) {
          heading = 360 - azimuth;
        }

        return heading;
      }
    }
  });
};

util.inherits( Compass, events.EventEmitter );

module.exports = Compass;
