var Board = require("../lib/board.js"),
    events = require("events"),
    util = require("util"),
    es6 = require("es6-collections"),
    WeakMap = es6.WeakMap,
    __ = require("../lib/fn.js");

var DeviceMap, aliases, priv, holdTimeout, last,
    Change, Update;

// Event type alias map
aliases = {
  down: [ "down", "press", "tap", "impact", "hit" ],
  up: [ "up", "release" ],
  hold: [ "hold" ]
};

// all private instances
priv = new WeakMap();

// hold time out for buttons.
holdTimeout = new WeakMap();

// keeps data between cycles and fires change event
// if data changes
last = new WeakMap();




/**
 * Nunchuk
 * @constructor
 *
 * five.Nunchuk([ x, y[, z] ]);
 *
 * five.Nunchuk({
 *   device: "RVL-004",
 *   holdtime: ms before firing a hold event on a button,
 *   freq: ms to throttle the read data loop
 *   threshold: difference of change to qualify for a change event
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

  var address, bytes, data, device,
  delay, setup, preread;

  // Normalize Constructor options
  opts = Board.options( opts );

  // Initialize Hardware instance properties
  Board.Device.call( this, opts );

  // Derive device definition from DeviceMap
  var deviceIdentifier = opts.device || "RVL-004";
  device = DeviceMap[ deviceIdentifier ];
  
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
  this.threshold = opts && opts.threshold || 10;

  // Initialize components

  device.initialize(this);

  // Set initial "last data" byte array
  last.set( this, [ 0, 0, 0, 0, 0, 0, 0 ] );

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

    // Use the high-frequency data read loop as the change event
    // emitting loop. This drastically improves change event
    // frequency and sensitivity
    //
    // Emit change events if any delta is greater than
    // the threshold

    // commented out for now -- csw
    if (typeof device.inReadLoopDo == 'function')
      device.inReadLoopDo(this);
    

  }.bind(this), delay );

  // Throttled "read" event loop
  setInterval(function() {

    this.emit( "read", null, Board.Event({
        type: "read",
        target: this
      })
    );

  }.bind(this), this.freq );
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

  // Set initial values for state tracking
  priv.set( this, {
    isDown: false
  });

  Object.defineProperties( this, {
    // is the button up (not pressed)?
    isUp: {
      get: function() {
        return !priv.get(this).isDown;
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

Nunchuk.Joystick = function( nunchuk ) {

  if ( !(this instanceof Nunchuk.Joystick) ) {
    return new Nunchuk.Joystick( nunchuk );
  }

  this.nunchuk = nunchuk;

  var state, accessors;

  // Initialize empty state object
  state = {};

  // Initialize empty accessors object
  accessors = {};

  // Enumerate Joystick properties
  [ "x", "y", "dx", "dy" ].forEach(function( key ) {

    state[ key ] = 0;

    // Define accessors for each property in Joystick list
    accessors[ key ] = {
      get: function() {
        return priv.get( this )[ key ];
      }
    };
  }, this);

  // Store private state cache
  priv.set( this, state );

  // Register newly defined accessors
  Object.defineProperties( this, accessors );
};

Nunchuk.Accelerometer = function( nunchuk ) {

  if ( !(this instanceof Nunchuk.Accelerometer) ) {
    return new Nunchuk.Accelerometer( nunchuk );
  }

  this.nunchuk = nunchuk;

  var state, accessors;

  // Initialize empty state object
  state = {};

  // Initialize empty accessors object
  accessors = {};

  // Enumerate Joystick properties
  [ "x", "y", "z", "dx", "dy", "dz" ].forEach(function( key ) {

    state[ key ] = 0;

    // Define accessors for each property in Joystick list
    accessors[ key ] = {
      get: function() {
        return priv.get( this )[ key ];
      }
    };
  }, this);

  // Store private state cache
  priv.set( this, state );

  // Register newly defined accessors
  Object.defineProperties( this, accessors );
};

util.inherits( Nunchuk, events.EventEmitter );
util.inherits( Nunchuk.Button, events.EventEmitter );
util.inherits( Nunchuk.Joystick, events.EventEmitter );
util.inherits( Nunchuk.Accelerometer, events.EventEmitter );


// Regular Wiimote driver bytes will be encoded 0x17
function decodeByte( x ) {
  return ( x ^ 0x17 ) + 0x17;
}
// Change handlers for disparate nunchuk event types
//
// Note: Change.* methods are |this| sensitive,
// therefore, call sites must use:
//
//    Change.button.call( instance, data );
//
//    Change.component.call( instance, data );
//
//
Change = {

  // Fire a "down", "up" or "hold" (and aliases) event
  // for a button context
  button: function( key ) {
    // |this| is button context set by calling as:
    // Change.button.call( button instance, event key );
    //

    // Enumerate all button event aliases,
    // fire matching types
    aliases[ key ].forEach(function( type ) {
      var event = new Board.Event({
        // |this| value is a button instance
        target: this,
        type: type
      });

        // fire button event on the button itself
        this.emit( type, null, event );

        // fire button event on the nunchuk
        this.nunchuk.emit( type, null, event );
    }, this);
  },

  // Fire a "change" event on a component context
  component: function( coordinate ) {
    // |this| is component context set by calling as:
    // Change.component.call( component instance, coordinate, val );
    //

    [ "axischange", "change" ].forEach(function( type ) {
      var event;

      if ( this._events[ type ] ) {
        event = new Board.Event({
          // |this| value is a button instance
          target: this,
          type: type,
          axis: coordinate,
          // Check dx/dy/dz change to determine direction
          direction: this[ "d" + coordinate ] < 0 ? -1 : 1
        });

        // Fire change event on actual component
        this.emit( type, null, event );

        // Fire change on nunchuk
        this.nunchuk.emit( type, null, event );
      }
    }, this);
  }
};

// Update handlers for disparate nunchuk event types
//
// Note: Update.* methods are |this| sensitive,
// therefore, call sites must use:
//
//    Update.button.call( button instance, boolean down );
//
//    Update.component.call( component instance, coordinate, val );
//
//

Update = {
  // Set "down" state for button context.
  button: function( isDown ) {
    // |this| is button context set by calling as:
    // Update.button.call( button instance, boolean down );
    //

    var state, isFireable;

    // Derive state from private cache
    state = priv.get( this );

    // if this is a state change, mark this
    // change as fireable.
    isFireable = false;

    if ( isDown !== state.isDown ) {
      isFireable = true;
    }

    state.isDown = isDown;

    priv.set( this, state );

    if ( isFireable ) {
      // start hold timeout for broadcasting hold.
      holdTimeout.set( this, setTimeout(function() {
        if ( state.isDown ) {
          Change.button.call( this, "hold" );
        }
      }.bind(this), this.nunchuk.holdtime ));

      Change.button.call( this, isDown ? "down" : "up" );
    }
  },

  // Set "coordinate value" state for component context.
  component: function( coordinate, val ) {
    // |this| is component context set by calling as:
    // Update.component.call( component instance, coordinate, val );
    //

    var state = priv.get( this );
    state[ "d" + coordinate ] = val - state[ coordinate ];
    state[ coordinate ] = val;
    priv.set( this, state );
  }
};


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
    inReadLoopDo: function (that) {
      var axes = [ "x", "y", "z" ];

      [ that.joystick, that.accelerometer ].forEach(function( component ) {
        axes.forEach( function( axis ) {
          var delta = "d" + axis;
          if ( typeof component[ delta ] !== "undefined" ) {
            if ( Math.abs( component[ delta ] ) > this.threshold ) {
              Change.component.call( component, axis );
            }
          }
        }, that );
      }, that );
    },

    initialize: function (obj) {
      obj.joystick = new Nunchuk.Joystick( obj );
      obj.accelerometer = new Nunchuk.Accelerometer( obj );
      obj.c = new Nunchuk.Button( "c", obj );
      obj.z = new Nunchuk.Button( "z", obj );
    },
    data: function( data ) {
      // TODO: Shift state management to weakmap, this
      //       should only update an entry in the map
      //

      if ( data[0] !== 254 && data[1] !== 254 && data[2] !== 254 ) {

        // Byte 0x00 :  X-axis data of the joystick
        Update.component.call(
          this.joystick,
          "x", decodeByte( data[0] ) << 2
        );

        // Byte 0x01 :  Y-axis data of the joystick
        Update.component.call(
          this.joystick,
          "y", decodeByte( data[1] ) << 2
        );

        // Byte 0x02 :  X-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "x", decodeByte( data[2] ) << 2
        );

        // Byte 0x03 :  Y-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "y", decodeByte( data[3] ) << 2
        );

        // Byte 0x04 :  Z-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "z", decodeByte( data[4] ) << 2
        );

        // Update Z button
        // Grab the first byte of the sixth bit
        Update.button.call(
          this.z,
          ( decodeByte( data[5] ) & 0x01 ) === 0 ? true : false
        );

        // Update C button
        // Grab the second byte of the sixth bit
        Update.button.call(
          this.c,
          ( decodeByte( data[5] ) & 0x02 ) === 0 ? true : false
        );

        // Update last data array cache
        last.set( this, data );
      }
    }
  },
  "RVL-005": {
    address: 0x52,
    bytes: 6,
    delay: 100,
    setup: [
      [ 0x40, 0x00 ]
    ],
    preread: [
      [ 0x00 ]
    ],

    initialize: function (obj) {
      obj.left_joystick = new Nunchuk.Joystick( obj );
      obj.right_joystick = new Nunchuk.Joystick( obj );
      // obj.direction_pad = new Nunchuk.DirectionPad( obj );
      obj.y = new Nunchuk.Button( "y", obj );
      obj.x = new Nunchuk.Button( "x", obj );
      obj.a = new Nunchuk.Button( "a", obj );
      obj.b = new Nunchuk.Button( "b", obj );
      obj.l = new Nunchuk.Button( "l", obj );
      obj.r = new Nunchuk.Button( "r", obj );
      obj.zl = new Nunchuk.Button( "zl", obj );
      obj.zr = new Nunchuk.Button( "zr", obj );
      obj.start = new Nunchuk.Button( "start", obj );
      obj.home = new Nunchuk.Button( "home", obj );
      obj.select = new Nunchuk.Button( "select", obj );
    },
    data: function( data ) {
      // TODO: Shift state management to weakmap, this
      //       should only update an entry in the map
      //
      // console.log("data read");
      // console.log(data);
      if ( data[0] !== 254 && data[1] !== 254 && data[2] !== 254 ) {

        // // Byte 0x00 :  X-axis data of the joystick
        Update.component.call(
          this.joystick,
          "x", decodeByte( data[0] ) << 2
        );

        // Byte 0x01 :  Y-axis data of the joystick
        Update.component.call(
          this.joystick,
          "y", decodeByte( data[1] ) << 2
        );

        // Byte 0x02 :  X-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "x", decodeByte( data[2] ) << 2
        );

        // Byte 0x03 :  Y-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "y", decodeByte( data[3] ) << 2
        );

        // Byte 0x04 :  Z-axis data of the accellerometer sensor
        Update.component.call(
          this.accelerometer,
          "z", decodeByte( data[4] ) << 2
        );

        // Update Z button
        // Grab the first byte of the sixth bit
        Update.button.call(
          this.z,
          ( decodeByte( data[5] ) & 0x01 ) === 0 ? true : false
        );

        // Update C button
        // Grab the second byte of the sixth bit
        Update.button.call(
          this.c,
          ( decodeByte( data[5] ) & 0x02 ) === 0 ? true : false
        );

        // Update last data array cache
        last.set( this, data );
      }
    }
  }
};

module.exports = Nunchuk;
