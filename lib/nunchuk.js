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
  handshake = device.handshake;
  readRequest = device.readRequest;

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

  // Do the handshake with the wiichuk ( 0x40 ) and readRequest ( 0x00 )
  this.firmata.sendI2CWriteRequest( address, [handshake, readRequest] );

  setInterval(function() {

    // Send this command to get all sensor data and store into
    // the 6-byte register within Nunchuk controller.
    // This must be execute before reading data from the Nunchuk.
    this.firmata.sendI2CWriteRequest( address, [readRequest] );

    // Request six bytes of data from the controller
    this.firmata.sendI2CReadRequest( address, bytes, function( data ) {

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

      this.emit( "change", err, new Date() );

    }.bind(this));
  }.bind(this), delay);

    // "read" throttle loop
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
    handshake: 0x40,
    readRequest: 0x00
  }
};

module.exports = Nunchuk;
