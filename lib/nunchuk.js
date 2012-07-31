var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js");

var DeviceMap;

/**
 * Nunchuk
 * @constructor
 *
 * five.Nunchuk([ x, y[, z] ]);
 *
 * five.Nunchuk({
 *   pin: 0x52
 *   freq: ms
 *  });
 *
 *
 * @param {Object} opts [description]
 *
 */

function Nunchuk( opts ) {

  if ( !(this instanceof Nunchuk) ) {
    return new Nunchuk( opts );
  }

  var err = null,
      zDownEmited = 0,
      zUpEmited = 0,
      cDownEmited = 0,
      cUpEmited = 0;

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;

  // Encode data to format that most wiimote drivers except
  // only needed if you use one of the regular wiimote drivers
  this.decodeByte = function(x){
    x = (x ^ 0x17) + 0x17;
    return x;
  }

  device = DeviceMap[ opts.device ];

  address = device.address;
  bytes = device.bytes;
  delay = device.delay;
  data = device.data;
  setup = device.setup;
  preread = device.preread;

  // Nunchuk instance properties
  this.freq = opts.freq || 500;

  this.joystick = {
    x: 0,
    y: 0
  };

  this.accelerometer = {
    x: 0,
    y: 0,
    z: 0
  };

  this.z = 0;
  this.c = 0;

  // Set up I2C data connection
  this.firmata.sendI2CConfig();

  // Iterate and write each set of setup instructions
  setup.forEach(function( bytes ) {
    this.firmata.sendI2CWriteRequest( address, bytes );
  }, this);


  // Unthrottled i2c read request loop
  setInterval(function() {

    // Send this command to get all sensor data and store into
    // the 6-byte register within Nunchuk controller.
    // This must be execute before reading data from the Nunchuk.

    // Iterate and write each set of setup instructions
    preread.forEach(function( bytes ) {
      this.firmata.sendI2CWriteRequest( address, bytes );
    }, this);


    // Request six bytes of data from the controller
    this.firmata.sendI2CReadRequest( address, bytes, data.bind(this) );

    if( this.z && !zDownEmited ) {
      zDownEmited = 1;
      zUpEmited = 0;
      this.emit( "zDown", err, new Date() );
    }

    if( zDownEmited && !this.z && !zUpEmited ) {
      zDownEmited = 0;
      zUpEmited = 1;
      this.emit( "zUp", err, new Date() );
    }

    if( this.c && !cDownEmited ) {
      cDownEmited = 1;
      cUpEmited = 0;
      this.emit( "cDown", err, new Date() );
    }

    if( cDownEmited && !this.c && !cUpEmited ) {
      cDownEmited = 0;
      cUpEmited = 1;
      this.emit( "cUp", err, new Date() );
    }

    // TODO: This seems like a courtesy at this point.
    //       Should refine this so that it only fires when
    //       real changes occur.
    //
    this.emit( "change", err, new Date() );

  }.bind(this), delay );

  // Throttled "read" event loop
  setInterval(function() {

    this.emit( "read", null, Date.now() );

  }.bind(this), this.freq );

}

util.inherits( Nunchuk, events.EventEmitter );

DeviceMap = {
  "RVL-004" : {
    address: 0x52,
    bytes: 6,
    delay: 100,
    setup: [
      [ 0x40, 0x00 ]
    ],
    preread: [
      [ 0x00 ]
    ],
    data: function( data ) {

      // Sometimes the nunchuk spits out corrupted data. What seems
      // to be corrupted data.
      if(data[0] !== 254 && data[1] !== 254 && data[2] !== 254){

        // Byte 0x00 :  X-axis data of the joystick
        this.joystick.x = this.decodeByte( data[0] ) << 2;

        // Byte 0x01 :  Y-axis data of the joystick
        this.joystick.y = this.decodeByte( data[1]) << 2;

        // Byte 0x02 :  X-axis data of the accellerometer sensor
        this.accelerometer.x = this.decodeByte( data[2] ) << 2;

        // Byte 0x03 :  Y-axis data of the accellerometer sensor
        this.accelerometer.y = this.decodeByte( data[3] ) << 2;

        // Byte 0x04 :  Z-axis data of the accellerometer sensor
        this.accelerometer.z = this.decodeByte( data[4] ) << 2;

        // Grab the first byte of the sixth bit
        if( ( this.decodeByte( data[5] ) & 0x01 ) === 0 ) {
          this.z = 1; // z button is down
        }else{
          this.z = 0; // z button is up
        }

        // Grab the second byte of the sixth bit
        if( ( this.decodeByte( data[5]) & 0x02 ) === 0 ) {
          this.c = 1; // c button is down
        }else{
          this.c = 0; // c button is up
        }

      }

    }
  }
};

module.exports = Nunchuk;
