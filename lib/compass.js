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
    read: function( data ) {
      var ref = compassMap.get( this );

      ref.x = ( data[0] << 8 ) | data[1];
      ref.y = ( data[4] << 8 ) | data[5];
      ref.z = ( data[2] << 8 ) | data[3];

      // console.log( data, ref );
      // 1nT * 100,000 = 1 gauss
      Object.keys( ref ).forEach(function( key ) {
        if ( ref[ key ] >= 1000 ) {
          ref[ key ] -= 65000;
        }
      });
      //

      // if ( !this.offsets.x[0] && !this.offsets.y[0] && !this.offsets.z[0] ) {
      //   this.offsets.x = [ ref.x, ref.x, 0 ];
      //   this.offsets.y = [ ref.y, ref.y, 0 ];
      //   this.offsets.z = [ ref.z, ref.z, 0 ];
      // }

      // Object.keys( ref ).forEach(function( key ) {
      //   var offs = this.offsets[ key ];

      //   // Update min
      //   if ( ref[ key ] < offs[ 0 ] ) {
      //     this.offsets[ key ][ 0 ] = ref[ key ];
      //   }
      //   // Update max
      //   if ( ref[ key ] > offs[ 1 ] ) {
      //     this.offsets[ key ][ 1 ] = ref[ key ];
      //   }
      //   // Update difference
      //   this.offsets[ key ][ 2 ] = (this.offsets[ key ][ 0 ] + this.offsets[ key ][ 1 ]) / 2;
      // }, this );


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

  // Limit polling/reading frequency
  if ( this.freq < 500 ) {
    this.freq = 500;
  }

  // Correct value set in scale()
  this.scale = 1;
  this.register = 0x00;

  Compass.scale.call( this, opts.gauss );

  // Offset correction
  //  (max + min)/2.
  this.offsets = {
    x: [ 0, 0, 0 ],
    y: [ 0, 0, 0 ],
    z: [ 0, 0, 0 ]
  };

  // Set up I2C data connection
  this.firmata.sendI2CConfig();

  // http://torrentula.to.funpic.de/tag/i2c/
  // CRA
  this.firmata.sendI2CWriteRequest( address, [ 0x00, 0x70 ] );
  // CRB
  this.firmata.sendI2CWriteRequest( address, [ 0x01, this.register ] );

  // Continuous measurement mode
  this.firmata.sendI2CWriteRequest( address, [ 0x02, 0x00 ] );

  setInterval(function() {

    // Set pointer to MSB
    this.firmata.sendI2CWriteRequest( address, [ 0x03 ] );

    // Read from register
    this.firmata.sendI2CReadRequest( address, bytes, read.bind(this) );

    // console.log( "--------------" );

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
          x: ref.x * this.scale,
          y: ref.y * this.scale,
          z: ref.z * this.scale
        };
      }
    },
    heading: {
      get: function() {
        var azimuth, heading, offset, ref;

        ref = compassMap.get( this );
        azimuth = Math.atan( ref.y / ref.x ) * 180 / Math.PI;


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
         *
         *
         * http://www.ngdc.noaa.gov/geomag/faqgeom.shtml
         * http://gge.unb.ca/Resources/gpsworld.september03.pdf
         * http://www.fooke.eu/core/cms/front_content.php?idart=371&changelang=2
         *
         */
//console.log( "azimuth", azimuth );
        // if ( ref.y < 0 ) {
        //   heading = 180.0 - azimuth;
        // }
        // if ( ref.y > 0 && ref.y < 0 ) {
        //   heading = 0.0 - azimuth;
        // }
        // if ( ref.y > 0 && ref.y > 0 ) {
        //   heading = 360 - azimuth;
        // }


// console.log( "refs", ref.x, ref.y, ref.z  );
// console.log( "offs", this.offsets.x[2], this.offsets.y[2], this.offsets.z[2]  );


        if ( ref.y > 0 ) {
          console.log( "condition 1, ref.y > 0" );
          heading = 90.0 - azimuth;
        }
        else if ( ref.y < 0 ) {
          console.log( "condition 2, ref.y < 0" );
          heading = 270.0 - azimuth;
        }
        else if ( ref.y === 0 && ref.x < 0 ) {
          console.log( "condition 3, ref.y === 0 && ref.x < 0 " );
          heading = 180.0;
        }
        else if ( ref.y === 0 && ref.x > 0 ) {
          console.log( "condition 4, ref.y === 0 && ref.x > 0 " );
          heading = 0.0;
        }

        return heading;
      }
    }
  });
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

console.log( this.register, this.scale );
  // Setting is in the top 3 bits of the register.
  this.register = this.register << 5;
};

util.inherits( Compass, events.EventEmitter );

module.exports = Compass;
