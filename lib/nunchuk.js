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

  var err = null;

  opts = Board.options( opts );

  // Hardware instance properties
  this.board = Board.mount( opts );
  this.firmata = this.board.firmata;

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

  // Set up I2C data connection
  this.firmata.sendI2CConfig();

  // Do the setup with the wiichuk ( 0x40 ) and preread ( 0x00 )
  this.firmata.sendI2CWriteRequest( address, setup );

  // Unthrottled i2c read request loop
  setInterval(function() {

    // Send this command to get all sensor data and store into
    // the 6-byte register within Nunchuk controller.
    // This must be execute before reading data from the Nunchuk.
    this.firmata.sendI2CWriteRequest( address, preread );

    // Request six bytes of data from the controller
    this.firmata.sendI2CReadRequest( address, bytes, data.bind(this) );

    // TODO: This seems like a courtesy at this point.
    //       Should refine this so that it only fires when
    //       real changes occur.
    //
    this.emit( "change", err, new Date() );

  }, delay );

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
      // Byte 0x00 :  X-axis data of the joystick
      this.joystick.x = data[0];

      // Byte 0x01 :  Y-axis data of the joystick
      this.joystick.y = data[1];

      // Byte 0x02 :  X-axis data of the accellerometer sensor
      this.accelerometer.x = data[2];

      // Byte 0x03 :  Y-axis data of the accellerometer sensor
      this.accelerometer.y = data[3];

      // Byte 0x04 :  Z-axis data of the accellerometer sensor
      this.accelerometer.z = data[4];
    }
  }
};

module.exports = Nunchuk;
