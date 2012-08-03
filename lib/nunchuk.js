var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap,
    __ = require("../lib/fn.js");

var DeviceMap,
    // Regular Wiimote driver bytes will be encoded 0x17
    decodeByte = function( x ) {
      return ( x ^ 0x17 ) + 0x17;
    },

    // alias map for events one can subscribe to for button
    // presses.
    aliases = {
      down: [ "down", "press", "tap", "impact", "hit" ],
      up: [ "up", "release" ],
      hold: [ "hold" ]
    },

    // Create a 5 ms debounce boundary on event triggers
    // this avoids button events firing on
    // press noise and false positives
    trigger = function( key, button ) {
      aliases[ key ].forEach(function( type ) {

        var event = new Board.Event({
          target : this,
          type : type
        });

        // fire button event on the button itself
        button.emit( type, event );

        // fire button event on the nunchuk
        this.nunchuk.emit( type, event );
      }, button);
    },

    // all private instances
    priv = new WeakMap(),

    // hold time out for buttons.
    holdTimeout = new WeakMap();

/**
 * Nunchuk
 * @constructor
 *
 * five.Nunchuk([ x, y[, z] ]);
 *
 * five.Nunchuk({
 *   pin: 0x52,
 *   holdtime: 500,
 *   freq: ms
 *  });
 *
 * Available events:
 *    "read" - firehose.
 *    "down", "press", "tap", "impact", "hit" - button press
 *    "up", "release" - button release
 *    "hold" - button hold
 *
 * @param {Object} opts [description]
 *
 */

function Nunchuk( opts ) {

  if ( !(this instanceof Nunchuk) ) {
    return new Nunchuk( opts );
  }

  var err, address, bytes, data, device,
  delay, setup, preread;


  err = null;

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

  // Button instance properties
  this.holdtime = opts && opts.holdtime || 500;

  this.joystick = {
    x: 0,
    y: 0
  };

  this.accelerometer = {
    x: 0,
    y: 0,
    z: 0
  };

  this.c = new Nunchuk.Button( "c", this );
  this.z = new Nunchuk.Button( "z", this );

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

    // TODO: This seems like a courtesy at this point.
    //       Should refine this so that it only fires when
    //       real changes occur.
    //
    this.emit( "change", err, Board.Event({
        type: "change",
        target: this
      })
    );

  }.bind(this), delay );

  // Throttled "read" event loop
  setInterval(function() {

    this.emit( "read", null, Board.Event({
        type: "read",
        target: this
      })
    );

  }.bind( this ), this.freq );
}

// A nunchuck button (c or z.)
Nunchuk.Button = function( which, nunchuk ) {

  if ( !(this instanceof Nunchuk.Button) ) {
    return new Nunchuk.Button( which, nunchuk );
  }

  // c or z.
  this.which = which;

  // reference to parent nunchuk
  this.nunchuk = nunchuk;

  // internal state tracking
  // TODO: this should be in a weakmap in the main constructor
  //        and updated in the DeviceMap data handler
  priv.set(this, {
    isUp: true,
    isHold: false,
    isDown: false
  });

  // TODO: Remove all set accessors. Update data via
  //       |this| bound weakmap
  //
  Object.defineProperties( this, {
    // is the button up (not pressed)?
    isUp: {
      get: function() {
        return priv.get(this).isUp;
      }
    },

    // is the button pressed?
    isDown: {
      get: function() {
        return priv.get(this).isDown;
      }
    }
  });
};

util.inherits( Nunchuk, events.EventEmitter );
util.inherits( Nunchuk.Button, events.EventEmitter );

// add modifier functions to our private state cache so that 
// we don't have to put the setter logic in hardware representing
// objects (such as a Nunchuk.Button) but still don't have to keep
// it inside the read loop.
__.extend( priv, {
   // is the button up (not pressed)?
  setButtonUp: function( button, value ) {
    var state = priv.get(button);

    // if this is a state change, mark this
    // change as fireable.
    var fire = false;

    if ( value !== state.isUp ) {
      fire = true;
    }

    state.isUp = value;
    // mark the other two states as false.
    state.isDown = false;
    state.isHold = false;

    priv.set(button, state);

    // fire state change event
    if ( fire ) {
      // clear the hold watch timeout, since
      // the button went up, it's clearly not
      // on hold anymore.
      clearTimeout( holdTimeout.get(button) );

      trigger( "up", button );
    }
  
  },

  // is the button pressed?
  setButtonDown: function( button, value ) {

    var state = priv.get(button);

    // if this is a state change, mark this
    // change as fireable.
    var fire = false;
    if ( value !== state.isDown ) {
      fire = true;
    }
    state.isDown = value;

    // mark up as being false. Note we are not
    // changing the isHold state here since we
    // don't know yet if it triggered.
    state.isUp = false;

    priv.set(button, state);

    if ( fire ) {
      // start hold timeout for broadcasting hold.
      holdTimeout.set( button, setTimeout(function() {
        if ( state.isDown ) {
          trigger( "hold", button );
        }
      }.bind(button), button.nunchuk.holdtime ));

      trigger( "down", button );
    }
  }
} );

DeviceMap = {
  "RVL-004": {
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


      // TODO: Shift state management to weakmap, this
      //       should only update an entry in the map
      //

      if ( data[0] !== 254 && data[1] !== 254 && data[2] !== 254 ) {

        // Byte 0x00 :  X-axis data of the joystick
        this.joystick.x = decodeByte( data[0] ) << 2;

        // Byte 0x01 :  Y-axis data of the joystick
        this.joystick.y = decodeByte( data[1] ) << 2;

        // Byte 0x02 :  X-axis data of the accellerometer sensor
        this.accelerometer.x = decodeByte( data[2] ) << 2;

        // Byte 0x03 :  Y-axis data of the accellerometer sensor
        this.accelerometer.y = decodeByte( data[3] ) << 2;

        // Byte 0x04 :  Z-axis data of the accellerometer sensor
        this.accelerometer.z = decodeByte( data[4] ) << 2;

        // Grab the first byte of the sixth bit
        if ( ( decodeByte( data[5] ) & 0x01 ) === 0 ) {
          priv.setButtonDown(this.z, true); // z button is down
        } else {
          priv.setButtonUp(this.z, true); // z button is up
        }

        // Grab the second byte of the sixth bit
        if ( ( decodeByte( data[5] ) & 0x02 ) === 0 ) {
          priv.setButtonDown(this.c, true); // c button is isDown
        } else {
          priv.setButtonUp(this.c, true); // c button is up
        }
      }
    }
  }
};

module.exports = Nunchuk;
