var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    __ = require("../lib/fn.js");

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
  this.mode = this.firmata.MODES.ANALOG;
  this.pin = opts.pin;

  this.joystick = {
    x: 0,
    y: 0
  }

  this.accelerametor = {
    x: 0,
    y: 0,
    z: 0
  }

  this.button = {
    z:0,
    c:0
  }

  // Nunchuk instance properties
  this.freq = opts.freq || 500;

  // init I2C
  // Have to config before you start read of writing
  this.firmata.sendI2CConfig(); 

  // Do the handshake with the wiichuk ( 0x40 ) and reset ( 0x00 )
  this.firmata.sendI2CWriteRequest(this.pin, [0x40, 0x00 ]);

  setInterval(function() {

    // Send this command to get all sensor data and store into 
    // the 6-byte register within Nunchuk controller.  
    // This must be execute before reading data from the Nunchuk.
    this.firmata.sendI2CWriteRequest(this.pin, [0x00]);

    // Request six bytes of data from the chuk
    this.firmata.sendI2CReadRequest(this.pin, 6, function( data ) {

      // Byte 0x00 :  X-axis data of the joystick
      this.joystick.x = data[0];

      // Byte 0x01 :  Y-axis data of the joystick
      this.joystick.y = data[1];

      // Byte 0x02 :  X-axis data of the accellerometer sensor
      this.accelerametor.x = data[2];

      // Byte 0x03 :  Y-axis data of the accellerometer sensor
      this.accelerametor.y = data[3];

      // Byte 0x04 :  Z-axis data of the accellerometer sensor
      this.accelerametor.z = data[4];

      // Byte 0x05 : bit 1 as  C button status - 0 = pressed and 1 = release
      if (( data[5] & 0x02 ) !== 0 ){
        this.button.c = 1;
        this.emit( "buttonUp", err);
      }
      else{
        this.button.c = 0;
        this.emit( "buttonDown", err);
      }

      this.emit( "chuk", err, new Date() );
    }.bind(this));
  }.bind(this), this.freq );

}

util.inherits( Nunchuk, events.EventEmitter );

module.exports = Nunchuk;

